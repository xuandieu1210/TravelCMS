import express, { NextFunction, Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import 'dotenv/config';
import { Pool } from 'pg';
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import nodemailer, { type Transporter } from 'nodemailer';

import path from 'path';
import fs from 'fs';

const PORT = Number(process.env.PORT || 3000);
const app = express();

type RawBodyRequest = Request & { rawBody?: string };

app.use(express.json({
  limit: '50mb',
  verify: (req, _res, buffer) => {
    (req as RawBodyRequest).rawBody = buffer.toString('utf8');
  },
}));
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
let tours: any[] = [];
let services: any[] = [];
let bookings: any[] = [];
let customers: any[] = [];
let banners: any[] = [];
let posts: any[] = [];
let feedbacks: any[] = [];
let campaigns: any[] = [];
let mediaFiles: any[] = [];
let auditLogs: any[] = [];
let categories: any[] = [];
let users: any[] = [];
let siteConfig: Record<string, string> = {
  whatsapp: '',
  messenger: '',
  instagram: '',
  facebook: '',
  email: '',
  phone: '',
  maps: '',
  address: '',
  addressEn: '',
  visitImage: '',
};

const adminSessions = new Map<string, { userId: string; expiresAt: number }>();
const publicFeedbackAttempts = new Map<string, number[]>();
const publicBookingAttempts = new Map<string, number[]>();
const adminSessionCookie = 'emic_admin_session';
const adminSessionMaxAgeSeconds = 60 * 60 * 8;

const paymentConfig = {
  bankId: String(process.env.PAYMENT_BANK_ID || '').trim(),
  accountNumber: String(process.env.PAYMENT_ACCOUNT_NUMBER || '').trim(),
  accountName: String(process.env.PAYMENT_ACCOUNT_NAME || '').trim(),
  qrTemplate: String(process.env.PAYMENT_QR_TEMPLATE || 'compact2').trim(),
  transferPrefix: String(process.env.PAYMENT_TRANSFER_PREFIX || '').trim(),
  qrExpiresMinutes: Math.max(15, Number(process.env.PAYMENT_QR_EXPIRES_MINUTES || 120) || 120),
};

const cassoConfig = {
  webhookSecret: String(process.env.CASSO_WEBHOOK_SECRET || '').trim(),
};

const mailConfig = {
  host: String(process.env.SMTP_HOST || '').trim(),
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || 'false').trim().toLowerCase() === 'true',
  user: String(process.env.SMTP_USER || '').trim(),
  pass: String(process.env.SMTP_PASS || '').trim(),
  from: String(process.env.SMTP_FROM || '').trim(),
};

let cachedTransporter: Transporter | null | undefined;

function normalizeSpamText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function buildTransferNote(bookingCode: string): string {
  return [paymentConfig.transferPrefix, bookingCode].filter(Boolean).join(' ').trim() || bookingCode;
}

function generateUniqueBookingCode(): string {
  const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const randomSuffix = Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0');
    const bookingCode = `BK-${datePrefix}-${randomSuffix}`;

    if (!bookings.some((booking) => String(booking.bookingCode || '').toUpperCase() === bookingCode)) {
      return bookingCode;
    }
  }

  throw new Error('Unable to generate a unique booking code');
}

function buildPaymentQrUrl(amount: number, addInfo: string): string | undefined {
  if (!paymentConfig.bankId || !paymentConfig.accountNumber) {
    return undefined;
  }

  const params = new URLSearchParams({
    amount: String(Math.max(0, Math.round(amount))),
    addInfo,
  });

  if (paymentConfig.accountName) {
    params.set('accountName', paymentConfig.accountName);
  }

  return `https://img.vietqr.io/image/${paymentConfig.bankId}-${paymentConfig.accountNumber}-${paymentConfig.qrTemplate}.jpg?${params.toString()}`;
}

function createBookingPaymentDetails(bookingCode: string, amount: number) {
  const paymentTransferNote = buildTransferNote(bookingCode);
  const paymentQrUrl = buildPaymentQrUrl(amount, paymentTransferNote);

  return {
    paymentQrUrl,
    paymentTransferNote,
    paymentAccountName: paymentConfig.accountName || undefined,
    paymentAccountNumber: paymentConfig.accountNumber || undefined,
    paymentBankId: paymentConfig.bankId || undefined,
    paymentExpiresAt: paymentQrUrl
      ? new Date(Date.now() + paymentConfig.qrExpiresMinutes * 60 * 1000).toISOString()
      : undefined,
  };
}

function sortObjectByKey(value: any): any {
  if (Array.isArray(value)) {
    return value.map(sortObjectByKey);
  }

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort((left, right) => left.localeCompare(right))
      .reduce<Record<string, any>>((accumulator, key) => {
        accumulator[key] = sortObjectByKey(value[key]);
        return accumulator;
      }, {});
  }

  return value;
}

function parseCassoSignatureHeader(value: string | undefined): { timestamp: string; signature: string } | null {
  if (!value) {
    return null;
  }

  const parts = value.split(',').map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith('t='))?.slice(2) || '';
  const signature = parts.find((part) => part.startsWith('v1='))?.slice(3) || '';

  if (!timestamp || !signature) {
    return null;
  }

  return { timestamp, signature };
}

function verifyCassoWebhookSignature(rawBody: string | undefined, signatureHeader: string | undefined): boolean {
  if (!cassoConfig.webhookSecret) {
    return true;
  }

  const parsedSignature = parseCassoSignatureHeader(signatureHeader);
  if (!rawBody || !parsedSignature) {
    return false;
  }

  try {
    const payload = JSON.parse(rawBody);
    const sortedData = sortObjectByKey(payload?.data ?? {});
    const canonicalPayload = `${parsedSignature.timestamp}.${JSON.stringify(sortedData)}`;
    const computedSignature = createHmac('sha512', cassoConfig.webhookSecret)
      .update(canonicalPayload)
      .digest('hex');

    const expectedBuffer = Buffer.from(parsedSignature.signature, 'hex');
    const actualBuffer = Buffer.from(computedSignature, 'hex');
    return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
  } catch {
    return false;
  }
}

function extractCassoTransactions(payload: any): any[] {
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (payload?.data && typeof payload.data === 'object') {
    return [payload.data];
  }

  return [];
}

function findBookingCodeInDescription(description: string): string | null {
  const matched = description.match(/\bBK-\d{8}-\d{6}\b/i);
  return matched ? matched[0].toUpperCase() : null;
}

function getMailTransporter(): Transporter | null {
  if (!mailConfig.host || !mailConfig.user || !mailConfig.pass || !mailConfig.from) {
    return null;
  }

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.secure,
      auth: {
        user: mailConfig.user,
        pass: mailConfig.pass,
      },
    });
  }

  return cachedTransporter;
}

async function sendBookingConfirmationEmail(booking: any, reason: 'paid' | 'manual' = 'manual') {
  const transporter = getMailTransporter();
  if (!transporter) {
    return { success: false, message: 'SMTP chưa được cấu hình nên chưa thể gửi email tự động.' };
  }

  const isPaid = booking.paymentStatus === 'PAID' || reason === 'paid';
  const subject = isPaid
    ? `[${booking.bookingCode}] Xác nhận thanh toán thành công`
    : `[${booking.bookingCode}] Xác nhận yêu cầu đặt lớp`;
  const title = isPaid ? 'Thanh toán đã được xác nhận' : 'Yêu cầu đặt lớp đã được ghi nhận';
  const intro = isPaid
    ? 'Chung toi da nhan duoc thanh toan cho don dat lop cua ban thong qua chuyen khoan ngan hang.'
    : 'Chung toi da ghi nhan yeu cau dat lop cua ban va se lien he som nhat de hoan tat xac nhan.';

  const html = `
    <div style="font-family:Segoe UI,Arial,sans-serif;max-width:640px;margin:0 auto;color:#1f2937;line-height:1.6">
      <h2 style="margin-bottom:8px;color:#14532d">${title}</h2>
      <p>${intro}</p>
      <div style="border:1px solid #d1d5db;border-radius:16px;padding:20px;background:#f9fafb">
        <p><strong>Ma don:</strong> ${booking.bookingCode}</p>
        <p><strong>Lop / chuong trinh:</strong> ${booking.tourName || booking.serviceName || ''}</p>
        <p><strong>Ngay tham gia:</strong> ${booking.departureDate}</p>
        ${booking.preferredTimeSlot ? `<p><strong>Buoi tham gia:</strong> ${booking.preferredTimeSlot === 'AFTERNOON' ? 'Buoi chieu (13:00 - 17:00)' : 'Buoi sang (08:00 - 12:00)'}</p>` : ''}
        <p><strong>Khach dat:</strong> ${booking.customerName}</p>
        ${booking.pickupLocation ? `<p><strong>Diem don:</strong> ${booking.pickupLocation}</p>` : ''}
        <p><strong>So luong:</strong> ${booking.numAdults} nguoi lon${booking.numChildren > 0 ? `, ${booking.numChildren} tre em` : ''}</p>
        <p><strong>Tong tien:</strong> ${Number(booking.finalAmount || 0).toLocaleString('vi-VN')} đ</p>
        <p><strong>Trang thai thanh toan:</strong> ${booking.paymentStatus}</p>
      </div>
      <p style="margin-top:18px">Cam on ban da dat dich vu tai Botanica Garden Hoi An.</p>
    </div>
  `;

  await transporter.sendMail({
    from: mailConfig.from,
    to: booking.customerEmail,
    subject,
    html,
    text: `${title}\nMa don: ${booking.bookingCode}\nChuong trinh: ${booking.tourName || booking.serviceName || ''}\nNgay tham gia: ${booking.departureDate}${booking.preferredTimeSlot ? `\nBuoi tham gia: ${booking.preferredTimeSlot === 'AFTERNOON' ? 'Buoi chieu (13:00 - 17:00)' : 'Buoi sang (08:00 - 12:00)'}` : ''}${booking.pickupLocation ? `\nDiem don: ${booking.pickupLocation}` : ''}\nTong tien: ${Number(booking.finalAmount || 0).toLocaleString('vi-VN')} đ\nTrang thai thanh toan: ${booking.paymentStatus}`,
  });

  return { success: true, message: `Email đã được gửi tới ${booking.customerEmail}` };
}

async function applyCassoTransaction(transaction: any): Promise<'ignored' | 'partial' | 'paid'> {
  const amount = Number(transaction?.amount || 0);
  const description = String(transaction?.description || '').trim();
  const bookingCode = findBookingCodeInDescription(description);

  if (!bookingCode || amount <= 0) {
    return 'ignored';
  }

  const booking = bookings.find((candidate) => candidate.bookingCode?.toUpperCase() === bookingCode);
  if (!booking) {
    return 'ignored';
  }

  const transactionId = String(transaction?.id || transaction?.reference || transaction?.tid || '').trim();
  if (transactionId && booking.cassoTransactionId === transactionId) {
    return 'ignored';
  }

  booking.paymentReference = String(transaction?.reference || transaction?.tid || '').trim() || booking.paymentReference;
  booking.cassoTransactionId = transactionId || booking.cassoTransactionId;
  booking.paymentReceivedAt = String(transaction?.transactionDateTime || transaction?.when || new Date().toISOString());
  booking.updatedAt = new Date().toISOString();

  let result: 'ignored' | 'partial' | 'paid' = 'ignored';
  if (amount >= Number(booking.finalAmount || 0)) {
    booking.paymentStatus = 'PAID';
    booking.status = 'PAID';
    booking.confirmedAt = booking.confirmedAt || new Date().toISOString();
    booking.confirmedBy = booking.confirmedBy || 'Casso Webhook';
    result = 'paid';
  } else if (amount > 0) {
    booking.paymentStatus = 'PARTIALLY_PAID';
    if (booking.status === 'NEW') {
      booking.status = 'CONFIRMED';
    }
    result = 'partial';
  }

  await saveToFirestore('bookings', booking.id, booking);

  auditLogs.unshift({
    id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    userName: 'Casso Webhook',
    userRole: 'SYSTEM',
    action: 'STATUS_CHANGE',
    entityName: 'Booking',
    entityId: booking.bookingCode,
    description: result === 'paid'
      ? `Da ghi nhan thanh toan thanh cong cho don ${booking.bookingCode}`
      : `Da ghi nhan thanh toan mot phan cho don ${booking.bookingCode}`,
    timestamp: new Date().toISOString(),
  });

  if (result === 'paid') {
    const emailResult = await sendBookingConfirmationEmail(booking, 'paid');
    auditLogs.unshift({
      id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      userName: 'Casso Webhook',
      userRole: 'SYSTEM',
      action: 'EMAIL',
      entityName: 'Booking',
      entityId: booking.bookingCode,
      description: emailResult.success
        ? `Da gui email xac nhan thanh toan cho ${booking.customerEmail}`
        : `Khong gui duoc email xac nhan thanh toan: ${emailResult.message}`,
      timestamp: new Date().toISOString(),
    });
  }

  return result;
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(storedPassword: string | undefined, password: string): boolean {
  if (!storedPassword) return false;
  if (storedPassword.startsWith('scrypt$')) {
    const [, salt, storedHash] = storedPassword.split('$');
    if (!salt || !storedHash) return false;
    try {
      const expected = Buffer.from(storedHash, 'hex');
      const actual = scryptSync(password, salt, expected.length);
      return expected.length > 0 && timingSafeEqual(actual, expected);
    } catch {
      return false;
    }
  }

  const expected = Buffer.from(storedPassword);
  const actual = Buffer.from(password);
  return expected.length === actual.length && timingSafeEqual(actual, expected);
}

function sanitizeAdminUser(user: any) {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

function getCookieValue(cookieHeader: string | undefined, name: string): string | undefined {
  return cookieHeader
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function setAdminSessionCookie(res: Response, value: string, maxAge: number): void {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${adminSessionCookie}=${value}; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`,
  );
}

app.use('/api/admin', (req: Request, res: Response, next: NextFunction) => {
  if ((req.path === '/login' || req.path === '/logout') && req.method === 'POST') return next();

  const sessionId = getCookieValue(req.headers.cookie, adminSessionCookie);
  const session = sessionId ? adminSessions.get(sessionId) : undefined;
  if (!session || session.expiresAt <= Date.now()) {
    if (sessionId) adminSessions.delete(sessionId);
    return res.status(401).json({ success: false, message: 'Yêu cầu đăng nhập quản trị' });
  }

  const user = users.find((candidate) => candidate.id === session.userId && candidate.status === 'ACTIVE');
  if (!user) {
    adminSessions.delete(sessionId!);
    return res.status(401).json({ success: false, message: 'Phiên đăng nhập không còn hợp lệ' });
  }

  res.locals.adminUser = user;
  next();
});

async function syncAllFromFirestore() {
  if (!db) {
    throw new Error('DATABASE_URL is required; refusing to start without PostgreSQL.');
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
      ['banners', (value: any[]) => { banners = value; }],
      ['tours', (value: any[]) => { tours = value; }],
      ['services', (value: any[]) => { services = value; }],
      ['bookings', (value: any[]) => { bookings = value; }],
      ['customers', (value: any[]) => { customers = value; }],
      ['posts', (value: any[]) => { posts = value; }],
      ['feedbacks', (value: any[]) => { feedbacks = value; }],
      ['campaigns', (value: any[]) => { campaigns = value; }],
      ['media', (value: any[]) => { mediaFiles = value; }],
      ['audit_logs', (value: any[]) => { auditLogs = value; }],
      ['categories', (value: any[]) => { categories = value; }],
      ['users', (value: any[]) => { users = value; }],
      ['site_config', (value: any[]) => { siteConfig = value[0] || siteConfig; }],
    ] as const;

    for (const [collection, setStore] of stores) {
      const result = await db.query('SELECT data FROM app_records WHERE collection = $1 ORDER BY id', [collection]);
      setStore(result.rows.map((row) => row.data));
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
      feedbacks: feedbacks.filter((f) => f.isApproved),
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

// GET /api/public/news/:slug
app.get('/api/public/news/:slug', (req: Request, res: Response) => {
  const post = posts.find((item) => item.slug === req.params.slug && item.status === 'PUBLISHED');
  if (!post) return res.status(404).json({ success: false, message: 'Bài viết không tồn tại' });
  post.viewCount = (post.viewCount || 0) + 1;
  saveToFirestore('posts', post.id, post);
  res.json({ success: true, data: post });
});

app.get('/api/public/categories', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: categories.filter((category) => category.isActive).sort((a, b) => a.displayOrder - b.displayOrder),
  });
});

app.get('/api/public/site-config', (_req: Request, res: Response) => {
  res.json({ success: true, data: siteConfig });
});

app.get('/api/public/media/latest', (_req: Request, res: Response) => {
  res.json({ success: true, data: mediaFiles[0]?.url || null });
});

// POST /api/public/bookings
app.post('/api/public/bookings', (req: Request, res: Response) => {
  const payload = req.body || {};
  const requesterIp = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const recentAttempts = (publicBookingAttempts.get(requesterIp) || []).filter((timestamp) => now - timestamp < 60 * 60 * 1000);
  const startedAtMs = payload.startedAt ? Date.parse(String(payload.startedAt)) : NaN;
  const normalizedPhone = String(payload.customerPhone || '').replace(/\s+/g, '');
  const normalizedEmail = String(payload.customerEmail || '').trim().toLowerCase();
  const pickupLocation = String(payload.pickupLocation || '').trim();
  const preferredTimeSlot = String(payload.preferredTimeSlot || '').trim();
  const normalizedDate = String(payload.departureDate || '').trim();

  if (!payload.customerName || !normalizedPhone || !normalizedEmail || !payload.departureDate) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc. Email là bắt buộc để gửi mã đặt lớp và xác nhận thanh toán.' });
  }

  if (!['MORNING', 'AFTERNOON'].includes(preferredTimeSlot)) {
    return res.status(400).json({ success: false, message: 'Vui lòng chọn buổi tham gia hợp lệ.' });
  }

  if (payload.website) {
    return res.status(400).json({ success: false, message: 'Yêu cầu không hợp lệ' });
  }

  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    return res.status(400).json({ success: false, message: 'Email không hợp lệ' });
  }

  if (normalizedPhone.replace(/[^\d+]/g, '').length < 8) {
    return res.status(400).json({ success: false, message: 'Số điện thoại không hợp lệ' });
  }

  if (!Number.isNaN(startedAtMs) && now - startedAtMs < 4000) {
    return res.status(429).json({ success: false, message: 'Bạn gửi quá nhanh. Vui lòng thử lại sau vài giây.' });
  }

  if (recentAttempts.length >= 4) {
    publicBookingAttempts.set(requesterIp, recentAttempts);
    return res.status(429).json({ success: false, message: 'Bạn đã gửi quá nhiều yêu cầu trong thời gian ngắn. Vui lòng thử lại sau.' });
  }

  const hasRecentDuplicate = bookings.some((booking) => {
    const createdAtMs = Date.parse(String(booking.createdAt || ''));
    if (Number.isNaN(createdAtMs) || now - createdAtMs > 30 * 60 * 1000) {
      return false;
    }

    return String(booking.tourId || '') === String(payload.tourId || '')
      && String(booking.departureDate || '').trim() === normalizedDate
      && String(booking.customerPhone || '').replace(/\s+/g, '') === normalizedPhone
      && String(booking.customerEmail || '').trim().toLowerCase() === normalizedEmail;
  });

  if (hasRecentDuplicate) {
    return res.status(409).json({ success: false, message: 'Yêu cầu đặt tour này vừa được gửi gần đây. Vui lòng chờ xác nhận hoặc chỉnh sửa thông tin trước khi gửi lại.' });
  }

  const bookingCode = generateUniqueBookingCode();

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
  const paymentDetails = (payload.paymentMethod || 'BANK_TRANSFER') === 'BANK_TRANSFER'
    ? createBookingPaymentDetails(bookingCode, finalAmount)
    : {};

  recentAttempts.push(now);
  publicBookingAttempts.set(requesterIp, recentAttempts);

  let customer = customers.find((c) => (normalizedPhone && String(c.phone || '').replace(/\s+/g, '') === normalizedPhone) || String(c.email || '').trim().toLowerCase() === normalizedEmail);
  if (!customer) {
    customer = {
      id: 'cust-' + Date.now(),
      fullName: payload.customerName,
      phone: normalizedPhone,
      email: normalizedEmail,
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
    customer.phone = normalizedPhone;
    customer.email = normalizedEmail;
  }

  const newBooking = {
    id: 'bk-' + Date.now(),
    bookingCode,
    tourId: payload.tourId,
    tourName: tourName || undefined,
    serviceId: payload.serviceId,
    customerId: customer.id,
    customerName: payload.customerName,
    customerPhone: normalizedPhone,
    customerEmail: normalizedEmail,
    pickupLocation: pickupLocation || undefined,
    departureDate: payload.departureDate,
    preferredTimeSlot,
    numAdults: payload.numAdults,
    numChildren: payload.numChildren || 0,
    numInfants: payload.numInfants || 0,
    totalAmount,
    discountAmount: 0,
    finalAmount,
    paymentMethod: payload.paymentMethod || 'BANK_TRANSFER',
    paymentStatus: 'UNPAID' as const,
    status: 'NEW' as const,
    ...paymentDetails,
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

app.post('/api/payments/casso/webhook', async (req: Request, res: Response) => {
  const signatureHeader = req.header('X-Casso-Signature') || undefined;
  if (!verifyCassoWebhookSignature((req as RawBodyRequest).rawBody, signatureHeader)) {
    return res.status(401).json({ success: false, message: 'Invalid Casso signature' });
  }

  const transactions = extractCassoTransactions(req.body);
  if (transactions.length === 0) {
    return res.status(200).json({ success: true, handled: 0, message: 'No transaction payload' });
  }

  let handled = 0;
  for (const transaction of transactions) {
    const result = await applyCassoTransaction(transaction);
    if (result !== 'ignored') {
      handled += 1;
    }
  }

  return res.status(200).json({ success: true, handled });
});

app.post('/api/public/feedbacks', async (req: Request, res: Response) => {
  const payload = req.body || {};
  const requesterIp = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const recentAttempts = (publicFeedbackAttempts.get(requesterIp) || []).filter((timestamp) => now - timestamp < 60 * 60 * 1000);
  const startedAtMs = payload.startedAt ? Date.parse(String(payload.startedAt)) : NaN;
  const normalizedTourName = normalizeSpamText(String(payload.tourName || ''));
  const normalizedComment = normalizeSpamText(String(payload.comment || ''));

  if (!payload.customerName || !payload.comment || !payload.tourName) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin đánh giá bắt buộc' });
  }

  if (payload.website) {
    return res.status(400).json({ success: false, message: 'Yêu cầu không hợp lệ' });
  }

  if (!Number.isNaN(startedAtMs) && now - startedAtMs < 4000) {
    return res.status(429).json({ success: false, message: 'Bạn gửi quá nhanh. Vui lòng thử lại sau vài giây.' });
  }

  if (recentAttempts.length >= 3) {
    publicFeedbackAttempts.set(requesterIp, recentAttempts);
    return res.status(429).json({ success: false, message: 'Bạn đã gửi quá nhiều đánh giá trong thời gian ngắn. Vui lòng thử lại sau.' });
  }

  const hasRecentDuplicate = feedbacks.some((feedback) => {
    const createdAtMs = Date.parse(String(feedback.createdAt || ''));
    if (Number.isNaN(createdAtMs) || now - createdAtMs > 30 * 60 * 1000) {
      return false;
    }

    return normalizeSpamText(String(feedback.tourName || '')) === normalizedTourName
      && normalizeSpamText(String(feedback.comment || '')) === normalizedComment;
  });

  if (hasRecentDuplicate) {
    return res.status(409).json({ success: false, message: 'Nội dung đánh giá này vừa được gửi gần đây. Vui lòng chỉnh sửa thêm trước khi gửi lại.' });
  }

  const newFeedback = {
    id: 'fb-' + Date.now(),
    customerName: String(payload.customerName).trim(),
    avatar: String(payload.avatar || 'https://ui-avatars.com/api/?name=Botanica&background=E7F6EF&color=14532D'),
    location: String(payload.location || 'Botanica guest').trim(),
    tourName: String(payload.tourName).trim(),
    customerNameEn: payload.customerNameEn ? String(payload.customerNameEn).trim() : undefined,
    rating: Math.max(1, Math.min(5, Number(payload.rating) || 5)),
    comment: String(payload.comment).trim(),
    commentEn: payload.commentEn ? String(payload.commentEn).trim() : undefined,
    isApproved: false,
    isFeatured: false,
    createdAt: new Date().toISOString(),
  };

  recentAttempts.push(now);
  publicFeedbackAttempts.set(requesterIp, recentAttempts);

  feedbacks.unshift(newFeedback);
  await saveToFirestore('feedbacks', newFeedback.id, newFeedback);

  auditLogs.unshift({
    id: 'log-' + Date.now(),
    userName: newFeedback.customerName,
    userRole: 'PUBLIC',
    action: 'CREATE',
    entityName: 'Feedback',
    entityId: newFeedback.id,
    description: `Khách ${newFeedback.customerName} gửi đánh giá chờ duyệt cho ${newFeedback.tourName}`,
    timestamp: new Date().toISOString(),
  });

  res.status(201).json({
    success: true,
    data: newFeedback,
    message: 'Đánh giá đã được ghi nhận và đang chờ duyệt',
  });
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
  if (req.body.status === 'PAID') {
    bookings[idx].paymentStatus = 'PAID';
  }
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

app.post('/api/admin/bookings/:id/send-email', async (req: Request, res: Response) => {
  const booking = bookings.find((b) => b.id === req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Not found' });
  try {
    const result = await sendBookingConfirmationEmail(booking, 'manual');
    if (!result.success) {
      return res.status(503).json(result);
    }

    auditLogs.unshift({
      id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      userName: 'Admin',
      userRole: 'ADMIN',
      action: 'EMAIL',
      entityName: 'Booking',
      entityId: booking.bookingCode,
      description: `Da gui email thu cong cho ${booking.customerEmail}`,
      timestamp: new Date().toISOString(),
    });

    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Gửi email thất bại' });
  }
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
    (user) => user.username.toLowerCase() === username && user.status === 'ACTIVE' && verifyPassword(user.password, password),
  );

  if (idx === -1) return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' });

  const loggedInUser = users[idx];
  users[idx] = {
    ...loggedInUser,
    password: loggedInUser.password?.startsWith('scrypt$') ? loggedInUser.password : hashPassword(password),
    lastLogin: new Date().toISOString(),
  };
  if (!(await saveToFirestore('users', users[idx].id, users[idx]))) {
    return res.status(503).json({ success: false, message: 'Không thể cập nhật PostgreSQL' });
  }

  const sessionId = randomBytes(32).toString('hex');
  adminSessions.set(sessionId, {
    userId: users[idx].id,
    expiresAt: Date.now() + adminSessionMaxAgeSeconds * 1000,
  });
  setAdminSessionCookie(res, sessionId, adminSessionMaxAgeSeconds);
  res.json({ success: true, data: sanitizeAdminUser(users[idx]) });
});

app.get('/api/admin/session', (_req: Request, res: Response) => {
  res.json({ success: true, data: sanitizeAdminUser(res.locals.adminUser) });
});

app.post('/api/admin/logout', (req: Request, res: Response) => {
  const sessionId = getCookieValue(req.headers.cookie, adminSessionCookie);
  if (sessionId) adminSessions.delete(sessionId);
  setAdminSessionCookie(res, '', 0);
  res.json({ success: true });
});

app.get('/api/admin/users', (_req: Request, res: Response) => {
  res.json({ success: true, data: users.map(sanitizeAdminUser) });
});

app.post('/api/admin/users', async (req: Request, res: Response) => {
  const password = String(req.body.password || '');
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' });
  }

  const newUser = {
    ...req.body,
    password: hashPassword(password),
    id: 'user-' + Date.now(),
    createdAt: new Date().toISOString(),
  };
  users.unshift(newUser);
  if (!(await saveToFirestore('users', newUser.id, newUser))) {
    return res.status(503).json({ success: false, message: 'Không thể lưu user vào PostgreSQL' });
  }
  res.status(201).json({ success: true, data: sanitizeAdminUser(newUser) });
});

app.put('/api/admin/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = users.findIndex((user) => user.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'User không tồn tại' });
  const { password, ...updates } = req.body;
  if (password && String(password).length < 6) {
    return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' });
  }
  users[idx] = {
    ...users[idx],
    ...updates,
    ...(password ? { password: hashPassword(String(password)) } : {}),
  };
  if (!(await saveToFirestore('users', id, users[idx]))) {
    return res.status(503).json({ success: false, message: 'Không thể cập nhật user trong PostgreSQL' });
  }
  res.json({ success: true, data: sanitizeAdminUser(users[idx]) });
});

app.patch('/api/admin/users/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = users.findIndex((user) => user.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'User không tồn tại' });
  users[idx] = { ...users[idx], status: req.body.status };
  if (!(await saveToFirestore('users', id, users[idx]))) {
    return res.status(503).json({ success: false, message: 'Không thể cập nhật trạng thái user trong PostgreSQL' });
  }
  res.json({ success: true, data: sanitizeAdminUser(users[idx]) });
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
  const fallbackCat = categories[0]?.name;
  if (fallbackCat) {
    tours = tours.map((t) => (t.category === deletedName ? { ...t, category: fallbackCat } : t));
    for (const t of tours) {
      if (t.category === fallbackCat) {
        await saveToFirestore('tours', t.id, t);
      }
    }
  }

  res.json({ success: true, message: 'Category deleted' });
});

async function startServer() {
  // Restore application state from PostgreSQL before serving requests.
  await syncAllFromFirestore();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        ws: process.env.DISABLE_HMR === 'true' ? false : { port: PORT + 1 },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Emic Travel API Server] running on http://localhost:${PORT}`);
  });
}

startServer();
