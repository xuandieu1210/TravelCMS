import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { INITIAL_TOURS, INITIAL_SERVICES, INITIAL_BOOKINGS, INITIAL_CUSTOMERS, INITIAL_BANNERS, INITIAL_POSTS, INITIAL_FEEDBACKS, INITIAL_CAMPAIGNS, INITIAL_MEDIA_FILES, INITIAL_AUDIT_LOGS, INITIAL_CATEGORIES } from './src/data/mockData';

import path from 'path';
import fs from 'fs';

const PORT = 3000;
const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded static files if any
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// In-memory data store for backend
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

// ================= PUBLIC APIS =================

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

  let customer = customers.find((c) => c.phone === payload.customerPhone || c.email === payload.customerEmail);
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
  const todayBookings = bookings.filter((b) => b.createdAt.startsWith(todayStr)).length;
  const pendingBookings = bookings.filter((b) => b.status === 'NEW').length;
  const totalRevenue = bookings
    .filter((b) => b.status === 'CONFIRMED' || b.status === 'PAID' || b.status === 'COMPLETED')
    .reduce((acc, curr) => acc + curr.finalAmount, 0);

  const categoriesMap: Record<string, number> = {};
  tours.forEach((t) => {
    categoriesMap[t.category] = (categoriesMap[t.category] || 0) + 1;
  });
  const totalTours = tours.length;
  const tourCategoriesDistribution = Object.entries(categoriesMap).map(([category, count]) => ({
    category,
    count,
    percentage: totalTours > 0 ? Math.round((count / totalTours) * 100) : 0,
  }));

  const monthlyRevenue = [
    { month: 'T10/25', revenue: 185000000, bookings: 42 },
    { month: 'T11/25', revenue: 215000000, bookings: 56 },
    { month: 'T12/25', revenue: 340000000, bookings: 78 },
    { month: 'T01/26', revenue: 380000000, bookings: 92 },
    { month: 'T02/26', revenue: 410000000, bookings: 104 },
    { month: 'T03/26', revenue: totalRevenue + 50000000, bookings: bookings.length + 20 },
  ];

  res.json({
    success: true,
    data: {
      totalTours,
      totalServices: services.length,
      todayBookings: todayBookings || 3,
      pendingBookings,
      totalRevenue: totalRevenue || 428500000,
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

app.post('/api/admin/tours', (req: Request, res: Response) => {
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
  res.status(201).json({ success: true, data: newTour });
});

app.put('/api/admin/tours/:id', (req: Request, res: Response) => {
  const idx = tours.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
  tours[idx] = { ...tours[idx], ...req.body, updatedAt: new Date().toISOString() };
  res.json({ success: true, data: tours[idx] });
});

app.patch('/api/admin/tours/:id/status', (req: Request, res: Response) => {
  const idx = tours.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
  tours[idx].status = req.body.status;
  tours[idx].updatedAt = new Date().toISOString();
  res.json({ success: true, data: tours[idx] });
});

app.delete('/api/admin/tours/:id', (req: Request, res: Response) => {
  tours = tours.filter((t) => t.id !== req.params.id);
  res.json({ success: true, message: 'Xóa tour thành công' });
});

// Services
app.get('/api/admin/services', (_req: Request, res: Response) => {
  res.json({ success: true, data: services });
});

// Bookings
app.get('/api/admin/bookings', (_req: Request, res: Response) => {
  res.json({ success: true, data: bookings });
});

app.patch('/api/admin/bookings/:id/status', (req: Request, res: Response) => {
  const idx = bookings.findIndex((b) => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
  bookings[idx].status = req.body.status;
  bookings[idx].updatedAt = new Date().toISOString();
  if (req.body.status === 'CONFIRMED' || req.body.status === 'PAID') {
    bookings[idx].confirmedAt = new Date().toISOString();
    bookings[idx].confirmedBy = 'Lê Xuân Diệu (Super Admin)';
  }
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
  res.json({ success: true, data: banners[idx] });
});

app.delete('/api/admin/banners/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  banners = banners.filter((b) => b.id !== id);
  res.json({ success: true, message: 'Banner deleted' });
});

app.put('/api/admin/banners', (req: Request, res: Response) => {
  banners = req.body;
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
  res.status(201).json({ success: true, data: newPost });
});

app.put('/api/admin/posts/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }
  posts[idx] = { ...posts[idx], ...req.body };
  res.json({ success: true, data: posts[idx] });
});

app.delete('/api/admin/posts/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  posts = posts.filter((p) => p.id !== id);
  res.json({ success: true, message: 'Post deleted' });
});

// Media
app.get('/api/admin/media', (_req: Request, res: Response) => {
  res.json({ success: true, data: mediaFiles });
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
  res.json({ success: true, data: newFb });
});

app.put('/api/admin/feedbacks/:id', (req: Request, res: Response) => {
  const idx = feedbacks.findIndex((f) => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
  feedbacks[idx] = { ...feedbacks[idx], ...req.body };
  res.json({ success: true, data: feedbacks[idx] });
});

app.delete('/api/admin/feedbacks/:id', (req: Request, res: Response) => {
  feedbacks = feedbacks.filter((f) => f.id !== req.params.id);
  res.json({ success: true, message: 'Đã xóa đánh giá' });
});

app.patch('/api/admin/feedbacks/:id/approve', (req: Request, res: Response) => {
  const idx = feedbacks.findIndex((f) => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
  feedbacks[idx].isApproved = req.body.isApproved;
  if (req.body.isFeatured !== undefined) feedbacks[idx].isFeatured = req.body.isFeatured;
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
  res.status(201).json({ success: true, data: newCat });
});

app.put('/api/admin/categories/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = categories.findIndex((c) => c.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Category not found' });
  const oldName = categories[idx].name;
  categories[idx] = { ...categories[idx], ...req.body };
  const newName = categories[idx].name;

  // Cascade rename to tours
  if (newName && oldName && oldName !== newName) {
    tours = tours.map((t) => (t.category === oldName ? { ...t, category: newName } : t));
  }

  res.json({ success: true, data: categories[idx] });
});

app.delete('/api/admin/categories/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const cat = categories.find((c) => c.id === id);
  if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
  const deletedName = cat.name;
  categories = categories.filter((c) => c.id !== id);

  // Cascade fallback category to tours
  const fallbackCat = categories[0]?.name || 'Thủ công gia đình';
  tours = tours.map((t) => (t.category === deletedName ? { ...t, category: fallbackCat } : t));

  res.json({ success: true, message: 'Category deleted' });
});

async function startServer() {
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
