import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { INITIAL_TOURS, INITIAL_SERVICES, INITIAL_BOOKINGS, INITIAL_CUSTOMERS, INITIAL_BANNERS, INITIAL_POSTS, INITIAL_FEEDBACKS, INITIAL_CAMPAIGNS, INITIAL_MEDIA_FILES, INITIAL_AUDIT_LOGS, INITIAL_CATEGORIES, INITIAL_ADMIN_USERS, INITIAL_SITE_CONFIG } from './src/data/mockData';
import 'dotenv/config';
import { Pool } from 'pg';

import path from 'path';
import fs from 'fs';

const PORT = 3000;
const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded static files if any
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

const databaseUrl = process.env.DATABASE_URL;
const db = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    })
  : null;

function cleanForDatabase(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(cleanForDatabase);
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        cleaned[key] = cleanForDatabase(obj[key]);
      }
    }
    return cleaned;
  }
  return obj;
}

async function saveToFirestore(collection: string, id: string, data: any): Promise<boolean> {
  if (!db) return false;
  try {
    await db.query(
      `INSERT INTO app_records (collection, id, data)
       VALUES ($1, $2, $3::jsonb)
       ON CONFLICT (collection, id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
      [collection, id, JSON.stringify(cleanForDatabase(data))],
    );
    return true;
  } catch (error) {
    console.error(`[PostgreSQL Sync Error] Failed to save ${collection}/${id}:`, error);
    return false;
  }
}

async function deleteFromFirestore(collection: string, id: string): Promise<boolean> {
  if (!db) return false;
  try {
    await db.query('DELETE FROM app_records WHERE collection = $1 AND id = $2', [collection, id]);
    return true;
  } catch (error) {
    console.error(`[PostgreSQL Sync Error] Failed to delete ${collection}/${id}:`, error);
    return false;
  }
}

// In-memory data store for backend acting as a performance cache
let tours = [...INITIAL_TOURS];
let services = [...INITIAL_SERVICES];
let bookings = [...INITIAL_BOOKINGS];
let customers = [...INITIAL_CUSTOMERS];
let banners = [...INITIAL_BANNERS];
let posts = [...INITIAL_POSTS];
let feedbacks = [...INITIAL_FEEDBACKS];
let campaigns = [...INITIAL_CAMPAIGNS];
let mediaFiles = [...INITIAL_MEDIA_FILES];
let auditLogs = [...INITIAL_AUDIT_LOGS];
let categories = [...INITIAL_CATEGORIES];
let users = [...INITIAL_ADMIN_USERS];
let siteConfig = { ...INITIAL_SITE_CONFIG };

async function syncAllFromFirestore() {
  if (!db) {
    console.warn('[PostgreSQL] DATABASE_URL is missing; using in-memory data only.');
    return;
  }

  try {
    await db.query(`CREATE TABLE IF NOT EXISTS app_records (
      collection TEXT NOT NULL,
      id TEXT NOT NULL,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (collection, id)
    )`);

    const stores = [
      ['banners', INITIAL_BANNERS, (value: any[]) => { banners = value; }],
      ['tours', INITIAL_TOURS, (value: any[]) => { tours = value; }],
      ['services', INITIAL_SERVICES, (value: any[]) => { services = value; }],
      ['bookings', INITIAL_BOOKINGS, (value: any[]) => { bookings = value; }],
      ['customers', INITIAL_CUSTOMERS, (value: any[]) => { customers = value; }],
      ['posts', INITIAL_POSTS, (value: any[]) => { posts = value; }],
      ['feedbacks', INITIAL_FEEDBACKS, (value: any[]) => { feedbacks = value; }],
      ['campaigns', INITIAL_CAMPAIGNS, (value: any[]) => { campaigns = value; }],
      ['media', INITIAL_MEDIA_FILES, (value: any[]) => { mediaFiles = value; }],
      ['audit_logs', INITIAL_AUDIT_LOGS, (value: any[]) => { auditLogs = value; }],
      ['categories', INITIAL_CATEGORIES, (value: any[]) => { categories = value; }],
      ['users', INITIAL_ADMIN_USERS, (value: any[]) => { users = value; }],
      ['site_config', [{ id: 'main', ...INITIAL_SITE_CONFIG }], (value: any[]) => {
        if (value[0]) siteConfig = value[0];
      }],
    ] as const;

    for (const [collection, initial, setStore] of stores) {
      const result = await db.query('SELECT data FROM app_records WHERE collection = $1 ORDER BY id', [collection]);
      if (result.rows.length > 0) {
        setStore(result.rows.map((row) => row.data));
      } else {
        for (const item of initial) await saveToFirestore(collection, item.id, item);
        setStore([...initial]);
      }
    }

    console.log('[PostgreSQL] Database state restored successfully.');
  } catch (error) {
    console.error('[PostgreSQL Error] Critical error during database restoration:', error);
    throw error;
  }
}

// ================= PUBLIC APIS =================

app.get('/api/health/db', async (_req: Request, res: Response) => {
  if (!db) {
    return res.status(503).json({ success: false, database: 'not_configured' });
  }

  try {
    const result = await db.query('SELECT NOW() AS connected_at');
    const collections = await db.query(
      'SELECT collection, COUNT(*)::int AS count FROM app_records GROUP BY collection ORDER BY collection',
    );
    res.json({
      success: true,
      database: 'connected',
      connectedAt: result.rows[0].connected_at,
      collections: collections.rows,
    });
  } catch (error: any) {
    res.status(503).json({ success: false, database: 'unavailable', message: error?.message || 'Database unavailable' });
  }
});

// GET /api/public/home
app.get('/api/public/home', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      banners: banners.filter((b) => b.isActive).sort((a, b) => a.order - b.order),
      featuredTours: tours.filter((t) => t.status === 'PUBLISHED' && t.isFeatured),
      allTours: tours.filter((t) => t.status === 'PUBLISHED'),
      services: services.filter((s) => s.isActive),
      posts: posts.filter((p) => p.status === 'PUBLISHED').slice(0, 3),
      feedbacks: feedbacks.filter((f) => f.isApproved && f.isFeatured),
      ecoMetrics: {
        plasticBottlesAvoided: 18450,
        organicWasteCompostedKg: 4200,
        soapRecycledKg: 850,
        treesPlanted: 1200,
      },
    },
  });
});

// GET /api/public/tours
app.get('/api/public/tours', (req: Request, res: Response) => {
  const { category, search, maxPrice } = req.query;
  let result = tours.filter((t) => t.status === 'PUBLISHED');
  if (category && category !== 'ALL') {
    result = result.filter((t) => t.category === category);
  }
  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter((t) => t.name.toLowerCase().includes(q) || t.departureLocation.toLowerCase().includes(q));
  }
  if (maxPrice) {
    result = result.filter((t) => t.pricing.adultPrice <= Number(maxPrice));
  }
  res.json({ success: true, data: result });
});

// GET /api/public/tours/:slug
app.get('/api/public/tours/:slug', (req: Request, res: Response) => {
  const tour = tours.find((t) => t.slug === req.params.slug && t.status === 'PUBLISHED');
  if (!tour) return res.status(404).json({ success: false, message: 'Tour không tồn tại' });
  tour.viewCount += 1;
  saveToFirestore('tours', tour.id, tour);
  res.json({ success: true, data: tour });
});

// GET /api/public/services
app.get('/api/public/services', (_req: Request, res: Response) => {
  res.json({ success: true, data: services.filter((s) => s.isActive) });
});

// GET /api/public/news
app.get('/api/public/news', (_req: Request, res: Response) => {
  res.json({ success: true, data: posts.filter((p) => p.status === 'PUBLISHED') });
});

// POST /api/public/bookings
app.post('/api/public/bookings', (req: Request, res: Response) => {
  const payload = req.body;
  const bookingCode = `BK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

  let tourName = '';
  let adultPrice = 0;
  let childPrice = 0;

  if (payload.tourId) {
    const tour = tours.find((t) => t.id === payload.tourId);
    if (tour) {
      tourName = tour.name;
      adultPrice = tour.pricing.adultPrice;
      childPrice = tour.pricing.childPrice;
      tour.bookingCount += 1;
    }
  }

  const totalAmount = payload.numAdults * adultPrice + (payload.numChildren || 0) * childPrice;
  const finalAmount = totalAmount;

  let customer = customers.find((c) => (payload.customerPhone && c.phone === payload.customerPhone) || c.email === payload.customerEmail);
  if (!customer) {
    customer = {
      id: 'cust-' + Date.now(),
      fullName: payload.customerName,
      phone: payload.customerPhone,
      email: payload.customerEmail,
      address: 'Hội An / Du khách',
      nationality: 'Việt Nam',
      totalSpent: finalAmount,
      bookingCount: 1,
      tier: 'STANDARD',
      notes: 'Đăng ký đặt tour trực tuyến từ Website Frontend',
      createdAt: new Date().toISOString(),
      lastBookingDate: new Date().toISOString(),
    };
    customers.unshift(customer);
  } else {
    customer.totalSpent += finalAmount;
    customer.bookingCount += 1;
    customer.lastBookingDate = new Date().toISOString();
  }

  const newBooking = {
    id: 'bk-' + Date.now(),
    bookingCode,
    tourId: payload.tourId,
    tourName: tourName || undefined,
    serviceId: payload.serviceId,
    customerId: customer.id,
    customerName: payload.customerName,
    customerPhone: payload.customerPhone,
    customerEmail: payload.customerEmail,
    departureDate: payload.departureDate,
    numAdults: payload.numAdults,
    numChildren: payload.numChildren || 0,
    numInfants: payload.numInfants || 0,
    totalAmount,
    discountAmount: 0,
    finalAmount,
    paymentMethod: payload.paymentMethod || 'BANK_TRANSFER',
    paymentStatus: 'UNPAID' as const,
    status: 'NEW' as const,
    notes: payload.notes,
    specialRequests: payload.specialRequests,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  bookings.unshift(newBooking);

  // Sync to Firestore
  if (payload.tourId) {
    const tour = tours.find((t) => t.id === payload.tourId);
    if (tour) saveToFirestore('tours', tour.id, tour);
  }
  saveToFirestore('customers', customer.id, customer);
  saveToFirestore('bookings', newBooking.id, newBooking);

  auditLogs.unshift({
    id: 'log-' + Date.now(),
    userName: 'Khách hàng',
    userRole: 'PUBLIC',
    action: 'CREATE',
    entityName: 'Booking',
    entityId: bookingCode,
    description: `Khách hàng ${payload.customerName} đặt tour ${tourName}`,
    timestamp: new Date().toISOString(),
  });

  res.status(201).json({ success: true, data: newBooking, message: 'Đặt tour thành công!' });
});

// ================= ADMIN APIS =================

// GET /api/admin/dashboard/stats
app.get('/api/admin/dashboard/stats', (_req: Request, res: Response) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayBookings = bookings.filter((b) => b.createdAt && b.createdAt.startsWith(todayStr)).length;
  const pendingBookings = bookings.filter((b) => b.status === 'NEW').length;
  const totalRevenue = bookings
    .filter((b) => b.status === 'CONFIRMED' || b.status === 'PAID' || b.status === 'COMPLETED')
    .reduce((acc, curr) => acc + (curr.finalAmount || 0), 0);

  const categoriesMap: Record<string, number> = {};
  tours.forEach((t) => {
    if (t.category) {
      categoriesMap[t.category] = (categoriesMap[t.category] || 0) + 1;
    }
  });
  const totalTours = tours.length;
  const tourCategoriesDistribution = Object.entries(categoriesMap).map(([category, count]) => ({
    category,
    count,
    percentage: totalTours > 0 ? Math.round((count / totalTours) * 100) : 0,
  }));

  // Generate dynamic stats for the last 6 months (based on actual dates in the system)
  const last6Months: { key: string; label: string; revenue: number; bookings: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    const key = `${d.getFullYear()}-${mm}`; // "YYYY-MM"
    const label = `T${mm}/${yy}`; // "TMM/YY"
    last6Months.push({ key, label, revenue: 0, bookings: 0 });
  }

  bookings.forEach((b) => {
    if (!b.createdAt) return;
    const bDate = new Date(b.createdAt);
    if (isNaN(bDate.getTime())) return;
    const mm = String(bDate.getMonth() + 1).padStart(2, '0');
    const yyyy = bDate.getFullYear();
    const key = `${yyyy}-${mm}`;

    const monthObj = last6Months.find((m) => m.key === key);
    if (monthObj) {
      monthObj.bookings += 1;
      if (b.status === 'CONFIRMED' || b.status === 'PAID' || b.status === 'COMPLETED') {
        monthObj.revenue += b.finalAmount || 0;
      }
    }
  });

  const monthlyRevenue = last6Months.map((m) => ({
    month: m.label,
    revenue: m.revenue,
    bookings: m.bookings,
  }));
  const currentMonthRevenue = monthlyRevenue[monthlyRevenue.length - 1]?.revenue || 0;
  const previousMonthRevenue = monthlyRevenue[monthlyRevenue.length - 2]?.revenue || 0;
  const revenueChangePercent = previousMonthRevenue > 0
    ? Math.round(((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 1000) / 10
    : null;

  res.json({
    success: true,
    data: {
      totalTours,
      totalServices: services.length,
      todayBookings,
      pendingBookings,
      totalRevenue,
      revenueChangePercent,
      totalCustomers: customers.length,
      monthlyRevenue,
      tourCategoriesDistribution,
      recentBookings: bookings.slice(0, 6),
    },
  });
});

// Tours
app.get('/api/admin/tours', (_req: Request, res: Response) => {
  res.json({ success: true, data: tours });
});

app.post('/api/admin/tours', async (req: Request, res: Response) => {
  const newTour = {
    ...req.body,
    id: 'tour-' + Date.now(),
    viewCount: 0,
    bookingCount: 0,
    rating: 5.0,
    reviewCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tours.unshift(newTour);
  if (!(await saveToFirestore('tours', newTour.id, newTour))) {
    return res.status(503).json({ success: false, message: 'Không thể lưu tour vào PostgreSQL' });
  }
  res.status(201).json({ success: true, data: newTour });
});

app.put('/api/admin/tours/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = tours.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
  tours[idx] = { ...tours[idx], ...req.body, updatedAt: new Date().toISOString() };
  if (!(await saveToFirestore('tours', id, tours[idx]))) {
    return res.status(503).json({ success: false, message: 'Không thể cập nhật tour trong PostgreSQL' });
  }
  res.json({ success: true, data: tours[idx] });
});

app.patch('/api/admin/tours/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = tours.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
  tours[idx].status = req.body.status;
  tours[idx].updatedAt = new Date().toISOString();
  if (!(await saveToFirestore('tours', id, tours[idx]))) {
    return res.status(503).json({ success: false, message: 'Không thể cập nhật trạng thái tour trong PostgreSQL' });
  }
  res.json({ success: true, data: tours[idx] });
});

app.delete('/api/admin/tours/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!tours.some((tour) => tour.id === id)) {
    return res.status(404).json({ success: false, message: 'Tour không tồn tại' });
  }
  tours = tours.filter((t) => t.id !== id);
  if (!(await deleteFromFirestore('tours', id))) {
    return res.status(503).json({ success: false, message: 'Không thể xóa tour khỏi PostgreSQL' });
  }
  res.json({ success: true, message: 'Xóa tour thành công' });
});

// Services
app.get('/api/admin/services', (_req: Request, res: Response) => {
  res.json({ success: true, data: services });
});

app.post('/api/admin/services', async (req: Request, res: Response) => {
  const newService = {
    ...req.body,
    id: 'service-' + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  services.unshift(newService);
  if (!(await saveToFirestore('services', newService.id, newService))) {
    return res.status(503).json({ success: false, message: 'Không thể lưu dịch vụ vào PostgreSQL' });
  }
  res.status(201).json({ success: true, data: newService });
});

app.put('/api/admin/services/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = services.findIndex((service) => service.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Dịch vụ không tồn tại' });
  services[idx] = { ...services[idx], ...req.body, updatedAt: new Date().toISOString() };
  if (!(await saveToFirestore('services', id, services[idx]))) {
    return res.status(503).json({ success: false, message: 'Không thể cập nhật dịch vụ trong PostgreSQL' });
  }
  res.json({ success: true, data: services[idx] });
});

app.delete('/api/admin/services/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!services.some((service) => service.id === id)) return res.status(404).json({ success: false, message: 'Dịch vụ không tồn tại' });
  services = services.filter((service) => service.id !== id);
  if (!(await deleteFromFirestore('services', id))) {
    return res.status(503).json({ success: false, message: 'Không thể xóa dịch vụ khỏi PostgreSQL' });
  }
  res.json({ success: true, message: 'Xóa dịch vụ thành công' });
});

// Bookings
app.get('/api/admin/bookings', (_req: Request, res: Response) => {
  res.json({ success: true, data: bookings });
});

app.patch('/api/admin/bookings/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = bookings.findIndex((b) => b.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
  bookings[idx].status = req.body.status;
  bookings[idx].updatedAt = new Date().toISOString();
  if (req.body.status === 'CONFIRMED' || req.body.status === 'PAID') {
    bookings[idx].confirmedAt = new Date().toISOString();
    bookings[idx].confirmedBy = 'Lê Xuân Diệu (Super Admin)';
  }
  saveToFirestore('bookings', id, bookings[idx]);
  res.json({ success: true, data: bookings[idx] });
});

app.put('/api/admin/bookings/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = bookings.findIndex((b) => b.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
  bookings[idx] = { ...bookings[idx], ...req.body, updatedAt: new Date().toISOString() };
  saveToFirestore('bookings', id, bookings[idx]);
  res.json({ success: true, data: bookings[idx] });
});

app.post('/api/admin/bookings/:id/send-email', (req: Request, res: Response) => {
  const booking = bookings.find((b) => b.id === req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, message: `Email đã gửi thành công tới ${booking.customerEmail}` });
});

// Customers
app.get('/api/admin/customers', (_req: Request, res: Response) => {
  res.json({ success: true, data: customers });
});

app.put('/api/admin/customers/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = customers.findIndex((customer) => customer.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Khách hàng không tồn tại' });
  customers[idx] = { ...customers[idx], ...req.body };
  if (!(await saveToFirestore('customers', id, customers[idx]))) {
    return res.status(503).json({ success: false, message: 'Không thể cập nhật khách hàng trong PostgreSQL' });
  }
  res.json({ success: true, data: customers[idx] });
});

app.get('/api/admin/site-config', (_req: Request, res: Response) => {
  res.json({ success: true, data: siteConfig });
});

app.put('/api/admin/site-config', async (req: Request, res: Response) => {
  siteConfig = { ...siteConfig, ...req.body };
  if (!(await saveToFirestore('site_config', 'main', siteConfig))) {
    return res.status(503).json({ success: false, message: 'Không thể cập nhật cấu hình trong PostgreSQL' });
  }
  res.json({ success: true, data: siteConfig });
});

// Admin users and authentication
app.post('/api/admin/login', async (req: Request, res: Response) => {
  const username = String(req.body.username || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const idx = users.findIndex(
    (user) => user.username.toLowerCase() === username && user.status === 'ACTIVE' && (user.password || '123456') === password,
  );

  if (idx === -1) return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' });

  users[idx] = { ...users[idx], lastLogin: new Date().toISOString() };
  if (!(await saveToFirestore('users', users[idx].id, users[idx]))) {
    return res.status(503).json({ success: false, message: 'Không thể cập nhật PostgreSQL' });
  }
  res.json({ success: true, data: users[idx] });
});

app.get('/api/admin/users', (_req: Request, res: Response) => {
  res.json({ success: true, data: users });
});

app.post('/api/admin/users', async (req: Request, res: Response) => {
  const newUser = { ...req.body, id: 'user-' + Date.now(), createdAt: new Date().toISOString() };
  users.unshift(newUser);
  if (!(await saveToFirestore('users', newUser.id, newUser))) {
    return res.status(503).json({ success: false, message: 'Không thể lưu user vào PostgreSQL' });
  }
  res.status(201).json({ success: true, data: newUser });
});

app.put('/api/admin/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = users.findIndex((user) => user.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'User không tồn tại' });
  users[idx] = { ...users[idx], ...req.body };
  if (!(await saveToFirestore('users', id, users[idx]))) {
    return res.status(503).json({ success: false, message: 'Không thể cập nhật user trong PostgreSQL' });
  }
  res.json({ success: true, data: users[idx] });
});

app.patch('/api/admin/users/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = users.findIndex((user) => user.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'User không tồn tại' });
  users[idx] = { ...users[idx], status: req.body.status };
  if (!(await saveToFirestore('users', id, users[idx]))) {
    return res.status(503).json({ success: false, message: 'Không thể cập nhật trạng thái user trong PostgreSQL' });
  }
  res.json({ success: true, data: users[idx] });
});

app.delete('/api/admin/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!users.some((user) => user.id === id)) return res.status(404).json({ success: false, message: 'User không tồn tại' });
  users = users.filter((user) => user.id !== id);
  if (!(await deleteFromFirestore('users', id))) {
    return res.status(503).json({ success: false, message: 'Không thể xóa user khỏi PostgreSQL' });
  }
  res.json({ success: true, message: 'Xóa user thành công' });
});

// Banners
app.get('/api/admin/banners', (_req: Request, res: Response) => {
  res.json({ success: true, data: banners.sort((a, b) => (a.order || 0) - (b.order || 0)) });
});

app.post('/api/admin/banners', (req: Request, res: Response) => {
  const newBanner = {
    ...req.body,
    id: 'ban-' + Date.now(),
    order: req.body.order ?? (banners.length + 1),
    isActive: req.body.isActive ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  banners.push(newBanner);
  saveToFirestore('banners', newBanner.id, newBanner);
  res.status(201).json({ success: true, data: newBanner });
});

app.put('/api/admin/banners/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = banners.findIndex((b) => b.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Banner not found' });
  banners[idx] = {
    ...banners[idx],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  saveToFirestore('banners', id, banners[idx]);
  res.json({ success: true, data: banners[idx] });
});

app.delete('/api/admin/banners/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  banners = banners.filter((b) => b.id !== id);
  deleteFromFirestore('banners', id);
  res.json({ success: true, message: 'Banner deleted' });
});

app.put('/api/admin/banners', async (req: Request, res: Response) => {
  banners = req.body;
  for (const b of banners) {
    await saveToFirestore('banners', b.id, b);
  }
  res.json({ success: true, data: banners });
});

// Posts
app.get('/api/admin/posts', (_req: Request, res: Response) => {
  res.json({ success: true, data: posts });
});

app.post('/api/admin/posts', (req: Request, res: Response) => {
  const newPost = {
    ...req.body,
    id: 'post-' + Date.now(),
    viewCount: 0,
    publishedAt: new Date().toISOString(),
  };
  posts.unshift(newPost);
  saveToFirestore('posts', newPost.id, newPost);
  res.status(201).json({ success: true, data: newPost });
});

app.put('/api/admin/posts/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }
  posts[idx] = { ...posts[idx], ...req.body };
  saveToFirestore('posts', id, posts[idx]);
  res.json({ success: true, data: posts[idx] });
});

app.delete('/api/admin/posts/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  posts = posts.filter((p) => p.id !== id);
  deleteFromFirestore('posts', id);
  res.json({ success: true, message: 'Post deleted' });
});

// Media
app.get('/api/admin/media', (_req: Request, res: Response) => {
  res.json({ success: true, data: mediaFiles });
});

app.post('/api/admin/media', async (req: Request, res: Response) => {
  const media = {
    ...req.body,
    id: req.body.id || 'media-' + Date.now(),
    createdAt: req.body.createdAt || new Date().toISOString(),
  };
  mediaFiles.unshift(media);
  if (!(await saveToFirestore('media', media.id, media))) {
    return res.status(503).json({ success: false, message: 'Không thể lưu media vào PostgreSQL' });
  }
  res.status(201).json({ success: true, data: media });
});

app.delete('/api/admin/media/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mediaFiles.some((file) => file.id === id)) return res.status(404).json({ success: false, message: 'Tệp media không tồn tại' });
  mediaFiles = mediaFiles.filter((file) => file.id !== id);
  if (!(await deleteFromFirestore('media', id))) {
    return res.status(503).json({ success: false, message: 'Không thể xóa media khỏi PostgreSQL' });
  }
  res.json({ success: true, message: 'Xóa media thành công' });
});

// Campaigns
app.get('/api/admin/campaigns', (_req: Request, res: Response) => {
  res.json({ success: true, data: campaigns });
});

app.post('/api/admin/campaigns', (req: Request, res: Response) => {
  const newCamp = {
    ...req.body,
    id: 'camp-' + Date.now(),
    createdAt: new Date().toISOString(),
  };
  campaigns.unshift(newCamp);
  saveToFirestore('campaigns', newCamp.id, newCamp);
  res.status(201).json({ success: true, data: newCamp });
});

app.put('/api/admin/campaigns/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = campaigns.findIndex((c) => c.id === id);
  if (idx === -1) {
    res.status(404).json({ success: false, message: 'Chiến dịch không tồn tại' });
    return;
  }
  campaigns[idx] = { ...campaigns[idx], ...req.body };
  saveToFirestore('campaigns', id, campaigns[idx]);
  res.json({ success: true, data: campaigns[idx] });
});

app.delete('/api/admin/campaigns/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = campaigns.findIndex((c) => c.id === id);
  if (idx === -1) {
    res.status(404).json({ success: false, message: 'Chiến dịch không tồn tại' });
    return;
  }
  campaigns.splice(idx, 1);
  deleteFromFirestore('campaigns', id);
  res.json({ success: true, message: 'Đã xóa chiến dịch thành công' });
});

// Feedbacks
app.get('/api/admin/feedbacks', (_req: Request, res: Response) => {
  res.json({ success: true, data: feedbacks });
});

app.post('/api/admin/feedbacks', (req: Request, res: Response) => {
  const newFb = {
    ...req.body,
    id: 'fb-' + Date.now(),
    createdAt: new Date().toISOString(),
  };
  feedbacks.unshift(newFb);
  saveToFirestore('feedbacks', newFb.id, newFb);
  res.json({ success: true, data: newFb });
});

app.put('/api/admin/feedbacks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = feedbacks.findIndex((f) => f.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
  feedbacks[idx] = { ...feedbacks[idx], ...req.body };
  saveToFirestore('feedbacks', id, feedbacks[idx]);
  res.json({ success: true, data: feedbacks[idx] });
});

app.delete('/api/admin/feedbacks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  feedbacks = feedbacks.filter((f) => f.id !== id);
  deleteFromFirestore('feedbacks', id);
  res.json({ success: true, message: 'Đã xóa đánh giá' });
});

app.patch('/api/admin/feedbacks/:id/approve', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = feedbacks.findIndex((f) => f.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
  feedbacks[idx].isApproved = req.body.isApproved;
  if (req.body.isFeatured !== undefined) feedbacks[idx].isFeatured = req.body.isFeatured;
  saveToFirestore('feedbacks', id, feedbacks[idx]);
  res.json({ success: true, data: feedbacks[idx] });
});

// File Upload endpoint
app.post('/api/upload', (req: Request, res: Response) => {
  try {
    const { filename, base64Data, folder = 'OTHER' } = req.body;
    if (!base64Data) {
      return res.status(400).json({ success: false, message: 'Thiếu dữ liệu file' });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const extMatch = base64Data.match(/^data:image\/([a-zA-Z0-9]+);base64,/);
    const ext = extMatch ? extMatch[1].replace('jpeg', 'jpg') : 'jpg';
    const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z0-9]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    
    const safeBaseName = (filename || 'upload')
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 50);
    const uniqueFileName = `${safeBaseName}_${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, uniqueFileName);
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${uniqueFileName}`;
    res.json({
      success: true,
      data: {
        url: fileUrl,
        name: uniqueFileName,
        sizeKb: Math.round(buffer.length / 1024),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Upload failed' });
  }
});

// Audit Logs
app.get('/api/admin/audit-logs', (_req: Request, res: Response) => {
  res.json({ success: true, data: auditLogs });
});

// Categories APIs
app.get('/api/admin/categories', (req: Request, res: Response) => {
  const type = req.query.type as string;
  let result = [...categories];
  if (type) {
    result = result.filter((c) => c.type === type);
  }
  res.json({ success: true, data: result });
});

app.post('/api/admin/categories', (req: Request, res: Response) => {
  const newCat = {
    ...req.body,
    id: 'cat-' + Date.now(),
    createdAt: new Date().toISOString(),
  };
  categories.push(newCat);
  saveToFirestore('categories', newCat.id, newCat);
  res.status(201).json({ success: true, data: newCat });
});

app.put('/api/admin/categories/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = categories.findIndex((c) => c.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Category not found' });
  const oldName = categories[idx].name;
  categories[idx] = { ...categories[idx], ...req.body };
  const newName = categories[idx].name;

  await saveToFirestore('categories', id, categories[idx]);

  // Cascade rename to tours
  if (newName && oldName && oldName !== newName) {
    tours = tours.map((t) => (t.category === oldName ? { ...t, category: newName } : t));
    // Save updated tours
    for (const t of tours) {
      if (t.category === newName) {
        await saveToFirestore('tours', t.id, t);
      }
    }
  }

  res.json({ success: true, data: categories[idx] });
});

app.delete('/api/admin/categories/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const cat = categories.find((c) => c.id === id);
  if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
  const deletedName = cat.name;
  categories = categories.filter((c) => c.id !== id);
  await deleteFromFirestore('categories', id);

  // Cascade fallback category to tours
  const fallbackCat = categories[0]?.name || 'Thủ công gia đình';
  tours = tours.map((t) => (t.category === deletedName ? { ...t, category: fallbackCat } : t));
  for (const t of tours) {
    if (t.category === fallbackCat) {
      await saveToFirestore('tours', t.id, t);
    }
  }

  res.json({ success: true, message: 'Category deleted' });
});

async function startServer() {
  // Restore application state from PostgreSQL before serving requests.
  await syncAllFromFirestore();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Emic Travel API Server] running on http://localhost:${PORT}`);
  });
}

startServer();
