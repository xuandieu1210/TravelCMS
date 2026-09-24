import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { INITIAL_TOURS, INITIAL_SERVICES, INITIAL_BOOKINGS, INITIAL_CUSTOMERS, INITIAL_BANNERS, INITIAL_POSTS, INITIAL_FEEDBACKS, INITIAL_CAMPAIGNS, INITIAL_MEDIA_FILES, INITIAL_AUDIT_LOGS, INITIAL_CATEGORIES } from './src/data/mockData';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from './firebase-applet-config.json';

import path from 'path';
import fs from 'fs';

const PORT = 3000;
const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded static files if any
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const db = getFirestore();

// Clean undefined values for firestore compatibility
function cleanForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(cleanForFirestore);
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        cleaned[key] = cleanForFirestore(obj[key]);
      }
    }
    return cleaned;
  }
  return obj;
}

// Sync utilities
async function saveToFirestore(collection: string, id: string, data: any) {
  try {
    const cleaned = cleanForFirestore(data);
    await db.collection(collection).doc(id).set(cleaned);
  } catch (error) {
    console.error(`[Firestore Sync Error] Failed to save to ${collection}/${id}:`, error);
  }
}

async function deleteFromFirestore(collection: string, id: string) {
  try {
    await db.collection(collection).doc(id).delete();
  } catch (error) {
    console.error(`[Firestore Sync Error] Failed to delete ${collection}/${id}:`, error);
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

async function syncAllFromFirestore() {
  try {
    console.log('[Firestore Sync] Restoring database state from cloud...');
    
    // Check and load banners
    const bannersSnap = await db.collection('banners').get();
    if (!bannersSnap.empty) {
      banners = [];
      bannersSnap.forEach(doc => banners.push(doc.data() as any));
    } else {
      console.log('[Firestore Sync] "banners" collection empty. Seeding initial banners...');
      for (const banner of INITIAL_BANNERS) {
        await saveToFirestore('banners', banner.id, banner);
      }
    }

    // Check and load tours
    const toursSnap = await db.collection('tours').get();
    if (!toursSnap.empty) {
      tours = [];
      toursSnap.forEach(doc => tours.push(doc.data() as any));
    } else {
      console.log('[Firestore Sync] "tours" collection empty. Seeding initial tours...');
      for (const tour of INITIAL_TOURS) {
        await saveToFirestore('tours', tour.id, tour);
      }
    }

    // Check and load services
    const servicesSnap = await db.collection('services').get();
    if (!servicesSnap.empty) {
      services = [];
      servicesSnap.forEach(doc => services.push(doc.data() as any));
    } else {
      console.log('[Firestore Sync] "services" collection empty. Seeding initial services...');
      for (const s of INITIAL_SERVICES) {
        await saveToFirestore('services', s.id, s);
      }
    }

    // Check and load bookings
    const bookingsSnap = await db.collection('bookings').get();
    if (!bookingsSnap.empty) {
      bookings = [];
      bookingsSnap.forEach(doc => bookings.push(doc.data() as any));
    } else {
      console.log('[Firestore Sync] "bookings" collection empty. Seeding initial bookings...');
      for (const b of INITIAL_BOOKINGS) {
        await saveToFirestore('bookings', b.id, b);
      }
    }

    // Check and load customers
    const customersSnap = await db.collection('customers').get();
    if (!customersSnap.empty) {
      customers = [];
      customersSnap.forEach(doc => customers.push(doc.data() as any));
    } else {
      console.log('[Firestore Sync] "customers" collection empty. Seeding initial customers...');
      for (const c of INITIAL_CUSTOMERS) {
        await saveToFirestore('customers', c.id, c);
      }
    }

    // Check and load posts
    const postsSnap = await db.collection('posts').get();
    if (!postsSnap.empty) {
      posts = [];
      postsSnap.forEach(doc => posts.push(doc.data() as any));

      // Force update or seed post-botanica-04 to ensure the user gets "The other Hoi An" with all the new fields
      const p04 = INITIAL_POSTS.find(p => p.id === 'post-botanica-04');
      if (p04) {
        const existing04 = posts.find(p => p.id === 'post-botanica-04');
        if (!existing04 || !existing04.eyebrow || existing04.title !== p04.title) {
          console.log('[Firestore Sync] Overwriting/Seeding updated "post-botanica-04" post...');
          await saveToFirestore('posts', p04.id, p04);
          if (existing04) {
            Object.assign(existing04, p04);
          } else {
            posts.push(p04);
          }
        }
      }
    } else {
      console.log('[Firestore Sync] "posts" collection empty. Seeding initial posts...');
      for (const p of INITIAL_POSTS) {
        await saveToFirestore('posts', p.id, p);
      }
    }

    // Check and load feedbacks
    const feedbacksSnap = await db.collection('feedbacks').get();
    if (!feedbacksSnap.empty) {
      feedbacks = [];
      feedbacksSnap.forEach(doc => feedbacks.push(doc.data() as any));
    } else {
      console.log('[Firestore Sync] "feedbacks" collection empty. Seeding initial feedbacks...');
      for (const f of INITIAL_FEEDBACKS) {
        await saveToFirestore('feedbacks', f.id, f);
      }
    }

    // Check and load categories
    const categoriesSnap = await db.collection('categories').get();
    if (!categoriesSnap.empty) {
      categories = [];
      categoriesSnap.forEach(doc => categories.push(doc.data() as any));
    } else {
      console.log('[Firestore Sync] "categories" collection empty. Seeding initial categories...');
      for (const cat of INITIAL_CATEGORIES) {
        await saveToFirestore('categories', cat.id, cat);
      }
    }

    console.log('[Firestore Sync] All collections synchronized successfully from Google Cloud!');
  } catch (error) {
    console.error('[Firestore Sync Error] Critical error during collection restoration:', error);
  }
}

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

  res.json({
    success: true,
    data: {
      totalTours,
      totalServices: services.length,
      todayBookings,
      pendingBookings,
      totalRevenue,
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
  saveToFirestore('tours', newTour.id, newTour);
  res.status(201).json({ success: true, data: newTour });
});

app.put('/api/admin/tours/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = tours.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
  tours[idx] = { ...tours[idx], ...req.body, updatedAt: new Date().toISOString() };
  saveToFirestore('tours', id, tours[idx]);
  res.json({ success: true, data: tours[idx] });
});

app.patch('/api/admin/tours/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = tours.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
  tours[idx].status = req.body.status;
  tours[idx].updatedAt = new Date().toISOString();
  saveToFirestore('tours', id, tours[idx]);
  res.json({ success: true, data: tours[idx] });
});

app.delete('/api/admin/tours/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  tours = tours.filter((t) => t.id !== id);
  deleteFromFirestore('tours', id);
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
  // Sync state from Google Cloud Firestore on startup
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
