import {
  Tour,
  ServiceItem,
  Booking,
  Customer,
  Banner,
  Post,
  CustomerFeedback,
  MarketingCampaign,
  MediaFile,
  AuditLog,
  DashboardStats,
  BookingStatus,
  TourStatus,
  SiteConfig,
  AdminUser,
  UserStatus,
  Category,
  CategoryType,
} from '../types';
import {
  INITIAL_TOURS,
  INITIAL_SERVICES,
  INITIAL_BOOKINGS,
  INITIAL_CUSTOMERS,
  INITIAL_BANNERS,
  INITIAL_POSTS,
  INITIAL_FEEDBACKS,
  INITIAL_CAMPAIGNS,
  INITIAL_MEDIA_FILES,
  INITIAL_AUDIT_LOGS,
  INITIAL_SITE_CONFIG,
  INITIAL_ADMIN_USERS,
  INITIAL_CATEGORIES,
} from '../data/mockData';

const STORAGE_KEYS = {
  TOURS: 'emic_travel_tours_v4',
  SERVICES: 'emic_travel_services_v2',
  BOOKINGS: 'emic_travel_bookings_v2',
  CUSTOMERS: 'emic_travel_customers_v2',
  BANNERS: 'emic_travel_banners_v4',
  POSTS: 'emic_travel_posts_v3',
  FEEDBACKS: 'emic_travel_feedbacks_v3',
  CAMPAIGNS: 'emic_travel_campaigns_v2',
  MEDIA: 'emic_travel_media_v2',
  AUDIT_LOGS: 'emic_travel_audit_logs_v2',
  CONFIG: 'emic_travel_config_v1',
  USERS: 'emic_travel_users_v1',
  CATEGORIES: 'emic_travel_categories_v2',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
}

class DataStore {
  private tours: Tour[];
  private services: ServiceItem[];
  private bookings: Booking[];
  private customers: Customer[];
  private banners: Banner[];
  private posts: Post[];
  private feedbacks: CustomerFeedback[];
  private campaigns: MarketingCampaign[];
  private mediaFiles: MediaFile[];
  private auditLogs: AuditLog[];
  private siteConfig: SiteConfig;
  private users: AdminUser[];
  private categories: Category[];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.categories = loadFromStorage(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    this.tours = loadFromStorage(STORAGE_KEYS.TOURS, INITIAL_TOURS);

    // Sanitize any tour categories to match the dynamic category list
    const validCategoryNames = this.categories.map((c) => c.name);
    if (validCategoryNames.length > 0) {
      let tourChanged = false;
      this.tours = this.tours.map((t) => {
        if (!validCategoryNames.includes(t.category)) {
          tourChanged = true;
          const lower = (t.category || '').toLowerCase();
          if (lower.includes('cà phê') || lower.includes('thư giãn') || lower.includes('coffee')) {
            const match = validCategoryNames.find((n) => n.includes('Cà phê')) || validCategoryNames[0];
            return { ...t, category: match };
          } else if (
            lower.includes('văn hóa') ||
            lower.includes('ẩm thực') ||
            lower.includes('jeep') ||
            lower.includes('sinh thái') ||
            lower.includes('culture')
          ) {
            const match = validCategoryNames.find((n) => n.includes('Văn hóa')) || validCategoryNames[0];
            return { ...t, category: match };
          } else {
            const match = validCategoryNames.find((n) => n.includes('Thủ công')) || validCategoryNames[0];
            return { ...t, category: match };
          }
        }
        return t;
      });
      if (tourChanged) {
        saveToStorage(STORAGE_KEYS.TOURS, this.tours);
      }
    }

    this.services = loadFromStorage(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    this.bookings = loadFromStorage(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    this.customers = loadFromStorage(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    this.banners = loadFromStorage(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
    this.posts = loadFromStorage(STORAGE_KEYS.POSTS, INITIAL_POSTS);
    this.feedbacks = loadFromStorage(STORAGE_KEYS.FEEDBACKS, INITIAL_FEEDBACKS);
    this.campaigns = loadFromStorage(STORAGE_KEYS.CAMPAIGNS, INITIAL_CAMPAIGNS);
    this.mediaFiles = loadFromStorage(STORAGE_KEYS.MEDIA, INITIAL_MEDIA_FILES);
    this.auditLogs = loadFromStorage(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    this.siteConfig = loadFromStorage(STORAGE_KEYS.CONFIG, INITIAL_SITE_CONFIG);
    this.users = loadFromStorage(STORAGE_KEYS.USERS, INITIAL_ADMIN_USERS);
  }

  public getSiteConfig(): SiteConfig {
    return { ...this.siteConfig };
  }

  public updateSiteConfig(config: Partial<SiteConfig>): SiteConfig {
    this.siteConfig = { ...this.siteConfig, ...config };
    saveToStorage(STORAGE_KEYS.CONFIG, this.siteConfig);
    this.logAudit('UPDATE', 'SiteConfig', 'main', 'Cập nhật cấu hình liên hệ website');
    this.notify();
    return this.siteConfig;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }

  private logAudit(action: AuditLog['action'], entityName: string, entityId: string, description: string): void {
    const log: AuditLog = {
      id: 'log-' + Date.now(),
      userName: 'Lê Xuân Diệu (Super Admin)',
      userRole: 'SUPER_ADMIN',
      action,
      entityName,
      entityId,
      description,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs = [log, ...this.auditLogs];
    saveToStorage(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
  }

  // --- PUBLIC API METHODS ---
  public getPublicHome() {
    return {
      banners: this.banners.filter((b) => b.isActive).sort((a, b) => a.order - b.order),
      featuredTours: this.tours.filter((t) => t.status === 'PUBLISHED' && t.isFeatured),
      allTours: this.tours.filter((t) => t.status === 'PUBLISHED'),
      services: this.services.filter((s) => s.isActive),
      posts: this.posts.filter((p) => p.status === 'PUBLISHED').slice(0, 3),
      feedbacks: this.feedbacks.filter((f) => f.isApproved && f.isFeatured),
      ecoMetrics: {
        plasticBottlesAvoided: 18450,
        organicWasteCompostedKg: 4200,
        soapRecycledKg: 850,
        treesPlanted: 1200,
      },
    };
  }

  public getPublicTours(filter?: { category?: string; search?: string; maxPrice?: number }) {
    let result = this.tours.filter((t) => t.status === 'PUBLISHED');
    if (filter?.category && filter.category !== 'ALL') {
      result = result.filter((t) => t.category === filter.category);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (t) => t.name.toLowerCase().includes(q) || t.departureLocation.toLowerCase().includes(q) || t.destinationLocation.toLowerCase().includes(q)
      );
    }
    if (filter?.maxPrice && filter.maxPrice > 0) {
      result = result.filter((t) => t.pricing.adultPrice <= filter.maxPrice!);
    }
    return result;
  }

  public getPublicTourBySlug(slug: string): Tour | undefined {
    return this.tours.find((t) => t.slug === slug && t.status === 'PUBLISHED');
  }

  public getPublicServices(): ServiceItem[] {
    return this.services.filter((s) => s.isActive);
  }

  public getPublicNews(): Post[] {
    return this.posts.filter((p) => p.status === 'PUBLISHED');
  }

  public getPublicNewsBySlug(slug: string): Post | undefined {
    return this.posts.find((p) => p.slug === slug && p.status === 'PUBLISHED');
  }

  public createPublicBooking(payload: {
    tourId?: string;
    serviceId?: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    departureDate: string;
    numAdults: number;
    numChildren: number;
    numInfants: number;
    notes?: string;
    specialRequests?: string;
    paymentMethod?: Booking['paymentMethod'];
  }): Booking {
    const bookingCode = `BK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
    let tourName = '';
    let adultPrice = 0;
    let childPrice = 0;

    if (payload.tourId) {
      const tour = this.tours.find((t) => t.id === payload.tourId);
      if (tour) {
        tourName = tour.name;
        adultPrice = tour.pricing.adultPrice;
        childPrice = tour.pricing.childPrice;
        tour.bookingCount += 1;
        saveToStorage(STORAGE_KEYS.TOURS, this.tours);
      }
    }

    let serviceName = '';
    if (payload.serviceId) {
      const srv = this.services.find((s) => s.id === payload.serviceId);
      if (srv) {
        serviceName = srv.name;
        adultPrice = srv.price;
      }
    }

    const totalAmount = payload.numAdults * adultPrice + (payload.numChildren || 0) * childPrice;
    const finalAmount = totalAmount;

    // Check or create customer
    let customer = this.customers.find(
      (c) => (payload.customerPhone && c.phone === payload.customerPhone) || c.email === payload.customerEmail
    );

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
      this.customers.unshift(customer);
    } else {
      customer.totalSpent += finalAmount;
      customer.bookingCount += 1;
      customer.lastBookingDate = new Date().toISOString();
      if (customer.totalSpent > 10000000) customer.tier = 'VIP';
      else if (customer.totalSpent > 5000000) customer.tier = 'GOLD';
      else if (customer.totalSpent > 2000000) customer.tier = 'SILVER';
    }
    saveToStorage(STORAGE_KEYS.CUSTOMERS, this.customers);

    const newBooking: Booking = {
      id: 'bk-' + Date.now(),
      bookingCode,
      tourId: payload.tourId,
      tourName: tourName || undefined,
      serviceId: payload.serviceId,
      serviceName: serviceName || undefined,
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
      paymentStatus: 'UNPAID',
      status: 'NEW',
      notes: payload.notes,
      specialRequests: payload.specialRequests,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.bookings.unshift(newBooking);
    saveToStorage(STORAGE_KEYS.BOOKINGS, this.bookings);

    this.logAudit('CREATE', 'Booking', bookingCode, `Khách hàng ${payload.customerName} đặt tour ${tourName || serviceName}`);
    this.notify();
    return newBooking;
  }

  // --- ADMIN CMS METHODS ---
  public getDashboardStats(): DashboardStats {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayBookings = this.bookings.filter((b) => b.createdAt.startsWith(todayStr)).length;
    const pendingBookings = this.bookings.filter((b) => b.status === 'NEW').length;
    const totalRevenue = this.bookings
      .filter((b) => b.status === 'CONFIRMED' || b.status === 'PAID' || b.status === 'COMPLETED')
      .reduce((acc, curr) => acc + curr.finalAmount, 0);

    const categoriesMap: Record<string, number> = {};
    this.tours.forEach((t) => {
      categoriesMap[t.category] = (categoriesMap[t.category] || 0) + 1;
    });
    const totalTours = this.tours.length;
    const tourCategoriesDistribution = Object.entries(categoriesMap).map(([category, count]) => ({
      category,
      count,
      percentage: totalTours > 0 ? Math.round((count / totalTours) * 100) : 0,
    }));

    // Monthly mock stats
    const monthlyRevenue = [
      { month: 'T10/25', revenue: 185000000, bookings: 42 },
      { month: 'T11/25', revenue: 215000000, bookings: 56 },
      { month: 'T12/25', revenue: 340000000, bookings: 78 },
      { month: 'T01/26', revenue: 380000000, bookings: 92 },
      { month: 'T02/26', revenue: 410000000, bookings: 104 },
      { month: 'T03/26', revenue: totalRevenue + 50000000, bookings: this.bookings.length + 20 },
    ];

    return {
      totalTours,
      totalServices: this.services.length,
      todayBookings: todayBookings || 3,
      pendingBookings,
      totalRevenue: totalRevenue || 428500000,
      totalCustomers: this.customers.length,
      monthlyRevenue,
      tourCategoriesDistribution,
      recentBookings: this.bookings.slice(0, 6),
    };
  }

  // Tours CRUD
  public getAllTours(): Tour[] {
    return [...this.tours];
  }

  public getTourById(id: string): Tour | undefined {
    return this.tours.find((t) => t.id === id);
  }

  public createTour(tourData: Omit<Tour, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'bookingCount' | 'rating' | 'reviewCount'>): Tour {
    const newTour: Tour = {
      ...tourData,
      id: 'tour-' + Date.now(),
      viewCount: 0,
      bookingCount: 0,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tours.unshift(newTour);
    saveToStorage(STORAGE_KEYS.TOURS, this.tours);
    this.logAudit('CREATE', 'Tour', newTour.code, `Tạo mới tour: ${newTour.name}`);
    this.notify();
    return newTour;
  }

  public updateTour(id: string, updates: Partial<Tour>): Tour | null {
    const idx = this.tours.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    this.tours[idx] = {
      ...this.tours[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.TOURS, this.tours);
    this.logAudit('UPDATE', 'Tour', this.tours[idx].code, `Cập nhật thông tin tour: ${this.tours[idx].name}`);
    this.notify();
    return this.tours[idx];
  }

  public updateTourStatus(id: string, status: TourStatus): Tour | null {
    const idx = this.tours.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    this.tours[idx].status = status;
    this.tours[idx].updatedAt = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.TOURS, this.tours);
    this.logAudit('STATUS_CHANGE', 'Tour', this.tours[idx].code, `Đổi trạng thái tour sang ${status}`);
    this.notify();
    return this.tours[idx];
  }

  public deleteTour(id: string): boolean {
    const tour = this.tours.find((t) => t.id === id);
    if (!tour) return false;
    this.tours = this.tours.filter((t) => t.id !== id);
    saveToStorage(STORAGE_KEYS.TOURS, this.tours);
    this.logAudit('DELETE', 'Tour', tour.code, `Xóa tour: ${tour.name}`);
    this.notify();
    return true;
  }

  // Services CRUD
  public getAllServices(): ServiceItem[] {
    return [...this.services];
  }

  public createService(srvData: Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt'>): ServiceItem {
    const newSrv: ServiceItem = {
      ...srvData,
      id: 'srv-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.services.unshift(newSrv);
    saveToStorage(STORAGE_KEYS.SERVICES, this.services);
    this.logAudit('CREATE', 'Service', newSrv.code, `Thêm dịch vụ: ${newSrv.name}`);
    this.notify();
    return newSrv;
  }

  public updateService(id: string, updates: Partial<ServiceItem>): ServiceItem | null {
    const idx = this.services.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    this.services[idx] = {
      ...this.services[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.SERVICES, this.services);
    this.logAudit('UPDATE', 'Service', this.services[idx].code, `Cập nhật dịch vụ: ${this.services[idx].name}`);
    this.notify();
    return this.services[idx];
  }

  public deleteService(id: string): boolean {
    const srv = this.services.find((s) => s.id === id);
    if (!srv) return false;
    this.services = this.services.filter((s) => s.id !== id);
    saveToStorage(STORAGE_KEYS.SERVICES, this.services);
    this.logAudit('DELETE', 'Service', srv.code, `Xóa dịch vụ: ${srv.name}`);
    this.notify();
    return true;
  }

  // Bookings
  public getAllBookings(): Booking[] {
    return [...this.bookings];
  }

  public updateBookingStatus(id: string, status: BookingStatus): Booking | null {
    const idx = this.bookings.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    const prevStatus = this.bookings[idx].status;
    this.bookings[idx].status = status;
    this.bookings[idx].updatedAt = new Date().toISOString();
    if (status === 'CONFIRMED' || status === 'PAID') {
      this.bookings[idx].confirmedAt = new Date().toISOString();
      this.bookings[idx].confirmedBy = 'Lê Xuân Diệu (Super Admin)';
      if (status === 'PAID') this.bookings[idx].paymentStatus = 'PAID';
    }
    saveToStorage(STORAGE_KEYS.BOOKINGS, this.bookings);
    this.logAudit(
      'STATUS_CHANGE',
      'Booking',
      this.bookings[idx].bookingCode,
      `Chuyển trạng thái booking từ ${prevStatus} sang ${status}`
    );
    this.notify();
    return this.bookings[idx];
  }

  public updateBooking(id: string, updates: Partial<Booking>): Booking | null {
    const idx = this.bookings.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    this.bookings[idx] = {
      ...this.bookings[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.BOOKINGS, this.bookings);
    this.logAudit('UPDATE', 'Booking', this.bookings[idx].bookingCode, `Cập nhật thông tin đơn hàng: ${this.bookings[idx].bookingCode}`);
    this.notify();
    return this.bookings[idx];
  }

  public sendBookingEmail(id: string): { success: boolean; message: string } {
    const booking = this.bookings.find((b) => b.id === id);
    if (!booking) return { success: false, message: 'Không tìm thấy booking' };
    this.logAudit('EMAIL', 'Booking', booking.bookingCode, `Đã gửi email xác nhận và voucher cho ${booking.customerEmail}`);
    this.notify();
    return { success: true, message: `Email xác nhận đã gửi thành công tới ${booking.customerEmail}` };
  }

  // Customers CRM
  public getAllCustomers(): Customer[] {
    return [...this.customers];
  }

  public updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
    const idx = this.customers.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.customers[idx] = { ...this.customers[idx], ...updates };
    saveToStorage(STORAGE_KEYS.CUSTOMERS, this.customers);
    this.logAudit('UPDATE', 'Customer', this.customers[idx].phone, `Cập nhật hồ sơ khách hàng ${this.customers[idx].fullName}`);
    this.notify();
    return this.customers[idx];
  }

  // CMS: Banners, Posts, Feedbacks
  public getAllBanners(): Banner[] {
    return [...this.banners].sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  public createBanner(data: Omit<Banner, 'id'>): Banner {
    const newBanner: Banner = {
      ...data,
      id: 'ban-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.banners.push(newBanner);
    saveToStorage(STORAGE_KEYS.BANNERS, this.banners);
    this.logAudit('CREATE', 'Banner', newBanner.id, `Tạo banner mới: ${newBanner.title}`);
    this.notify();
    return newBanner;
  }

  public updateBanner(id: string, updates: Partial<Banner>): Banner | null {
    const idx = this.banners.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    this.banners[idx] = {
      ...this.banners[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.BANNERS, this.banners);
    this.logAudit('UPDATE', 'Banner', id, `Cập nhật banner: ${this.banners[idx].title}`);
    this.notify();
    return this.banners[idx];
  }

  public deleteBanner(id: string): boolean {
    const banner = this.banners.find((b) => b.id === id);
    if (!banner) return false;
    this.banners = this.banners.filter((b) => b.id !== id);
    saveToStorage(STORAGE_KEYS.BANNERS, this.banners);
    this.logAudit('DELETE', 'Banner', id, `Xóa banner: ${banner.title}`);
    this.notify();
    return true;
  }

  public toggleBannerStatus(id: string, active: boolean): Banner | null {
    return this.updateBanner(id, { isActive: active });
  }

  public updateBanners(banners: Banner[]): Banner[] {
    this.banners = banners;
    saveToStorage(STORAGE_KEYS.BANNERS, this.banners);
    this.logAudit('UPDATE', 'Banner', 'HOME_BANNERS', 'Cập nhật danh sách banner trang chủ');
    this.notify();
    return this.banners;
  }

  public getAllPosts(): Post[] {
    return [...this.posts];
  }

  public createPost(data: Omit<Post, 'id' | 'viewCount' | 'publishedAt'>): Post {
    const newPost: Post = {
      ...data,
      id: 'post-' + Date.now(),
      viewCount: 0,
      publishedAt: new Date().toISOString(),
    };
    this.posts.unshift(newPost);
    saveToStorage(STORAGE_KEYS.POSTS, this.posts);
    this.logAudit('CREATE', 'Post', newPost.slug, `Tạo bài viết mới: ${newPost.title}`);
    this.notify();
    return newPost;
  }

  public updatePost(id: string, updates: Partial<Post>): Post | null {
    const idx = this.posts.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.posts[idx] = { ...this.posts[idx], ...updates };
    saveToStorage(STORAGE_KEYS.POSTS, this.posts);
    this.logAudit('UPDATE', 'Post', this.posts[idx].slug, `Cập nhật bài viết: ${this.posts[idx].title}`);
    this.notify();
    return this.posts[idx];
  }

  public deletePost(id: string): boolean {
    const post = this.posts.find((p) => p.id === id);
    if (!post) return false;
    this.posts = this.posts.filter((p) => p.id !== id);
    saveToStorage(STORAGE_KEYS.POSTS, this.posts);
    this.logAudit('DELETE', 'Post', post.slug, `Xóa bài viết: ${post.title}`);
    this.notify();
    return true;
  }

  public getAllFeedbacks(): CustomerFeedback[] {
    return [...this.feedbacks];
  }

  public createFeedback(data: Omit<CustomerFeedback, 'id' | 'createdAt'>): CustomerFeedback {
    const newFb: CustomerFeedback = {
      ...data,
      id: 'fb-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    this.feedbacks.unshift(newFb);
    saveToStorage(STORAGE_KEYS.FEEDBACKS, this.feedbacks);
    this.logAudit('CREATE', 'Feedback', newFb.id, `Thêm đánh giá mới từ: ${newFb.customerName}`);
    this.notify();
    return newFb;
  }

  public updateFeedback(id: string, updates: Partial<CustomerFeedback>): CustomerFeedback | null {
    const idx = this.feedbacks.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    this.feedbacks[idx] = { ...this.feedbacks[idx], ...updates };
    saveToStorage(STORAGE_KEYS.FEEDBACKS, this.feedbacks);
    this.logAudit('UPDATE', 'Feedback', id, `Cập nhật đánh giá của: ${this.feedbacks[idx].customerName}`);
    this.notify();
    return this.feedbacks[idx];
  }

  public deleteFeedback(id: string): boolean {
    const fb = this.feedbacks.find((f) => f.id === id);
    if (!fb) return false;
    this.feedbacks = this.feedbacks.filter((f) => f.id !== id);
    saveToStorage(STORAGE_KEYS.FEEDBACKS, this.feedbacks);
    this.logAudit('DELETE', 'Feedback', id, `Xóa đánh giá của: ${fb.customerName}`);
    this.notify();
    return true;
  }

  public updateFeedbackApproval(id: string, isApproved: boolean, isFeatured?: boolean): CustomerFeedback | null {
    const idx = this.feedbacks.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    this.feedbacks[idx].isApproved = isApproved;
    if (isFeatured !== undefined) this.feedbacks[idx].isFeatured = isFeatured;
    saveToStorage(STORAGE_KEYS.FEEDBACKS, this.feedbacks);
    this.logAudit('STATUS_CHANGE', 'Feedback', id, `Duyệt đánh giá của khách: ${this.feedbacks[idx].customerName}`);
    this.notify();
    return this.feedbacks[idx];
  }

  // Media
  public getAllMedia(): MediaFile[] {
    return [...this.mediaFiles];
  }

  public uploadMedia(data: { name: string; url: string; folder: MediaFile['folder']; sizeKb: number; mimeType: string }): MediaFile {
    const file: MediaFile = {
      id: 'media-' + Date.now(),
      name: data.name,
      url: data.url,
      folder: data.folder,
      sizeKb: data.sizeKb,
      mimeType: data.mimeType,
      createdAt: new Date().toISOString(),
    };
    this.mediaFiles.unshift(file);
    saveToStorage(STORAGE_KEYS.MEDIA, this.mediaFiles);
    this.logAudit('CREATE', 'Media', file.name, `Upload tệp media: ${file.name}`);
    this.notify();
    return file;
  }

  public deleteMedia(id: string): boolean {
    const file = this.mediaFiles.find((m) => m.id === id);
    if (!file) return false;
    this.mediaFiles = this.mediaFiles.filter((m) => m.id !== id);
    saveToStorage(STORAGE_KEYS.MEDIA, this.mediaFiles);
    this.logAudit('DELETE', 'Media', file.name, `Xóa tệp media: ${file.name}`);
    this.notify();
    return true;
  }

  public clearAllMedia(): void {
    this.mediaFiles = [];
    saveToStorage(STORAGE_KEYS.MEDIA, []);
    this.logAudit('DELETE', 'Media', 'All Media', 'Xóa toàn bộ thư viện media');
    this.notify();
  }

  // Marketing
  public getAllCampaigns(): MarketingCampaign[] {
    return [...this.campaigns];
  }

  public updateCampaign(id: string, updates: Partial<MarketingCampaign>): MarketingCampaign | null {
    const idx = this.campaigns.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.campaigns[idx] = { ...this.campaigns[idx], ...updates };
    saveToStorage(STORAGE_KEYS.CAMPAIGNS, this.campaigns);
    this.logAudit('UPDATE', 'Campaign', this.campaigns[idx].code, `Cập nhật chiến dịch Marketing: ${this.campaigns[idx].name}`);
    this.notify();
    return this.campaigns[idx];
  }

  public createCampaign(data: Omit<MarketingCampaign, 'id' | 'createdAt'>): MarketingCampaign {
    const newCamp: MarketingCampaign = {
      ...data,
      id: 'camp-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    this.campaigns.unshift(newCamp);
    saveToStorage(STORAGE_KEYS.CAMPAIGNS, this.campaigns);
    this.logAudit('CREATE', 'Campaign', newCamp.code, `Tạo mới chiến dịch Marketing: ${newCamp.name}`);
    this.notify();
    return newCamp;
  }

  public deleteCampaign(id: string): boolean {
    const camp = this.campaigns.find((c) => c.id === id);
    if (!camp) return false;
    this.campaigns = this.campaigns.filter((c) => c.id !== id);
    saveToStorage(STORAGE_KEYS.CAMPAIGNS, this.campaigns);
    this.logAudit('DELETE', 'Campaign', camp.code, `Xóa chiến dịch Marketing: ${camp.name}`);
    this.notify();
    return true;
  }

  // User Management (Admin & Staff)
  public getAllUsers(): AdminUser[] {
    return [...this.users];
  }

  public getUserById(id: string): AdminUser | null {
    return this.users.find((u) => u.id === id) || null;
  }

  public createUser(userData: Omit<AdminUser, 'id' | 'createdAt'>): AdminUser {
    const newUser: AdminUser = {
      ...userData,
      id: 'user-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    this.users.unshift(newUser);
    saveToStorage(STORAGE_KEYS.USERS, this.users);
    this.logAudit('CREATE', 'User', newUser.username, `Tạo tài khoản người dùng mới: ${newUser.fullName} (${newUser.role})`);
    this.notify();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<AdminUser>): AdminUser | null {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.users[idx] = { ...this.users[idx], ...updates };
    saveToStorage(STORAGE_KEYS.USERS, this.users);
    this.logAudit('UPDATE', 'User', this.users[idx].username, `Cập nhật thông tin người dùng: ${this.users[idx].fullName}`);
    this.notify();
    return this.users[idx];
  }

  public deleteUser(id: string): boolean {
    const user = this.users.find((u) => u.id === id);
    if (!user) return false;
    this.users = this.users.filter((u) => u.id !== id);
    saveToStorage(STORAGE_KEYS.USERS, this.users);
    this.logAudit('DELETE', 'User', user.username, `Xóa tài khoản người dùng: ${user.fullName}`);
    this.notify();
    return true;
  }

  public toggleUserStatus(id: string, status: UserStatus): AdminUser | null {
    const user = this.users.find((u) => u.id === id);
    if (!user) return null;
    user.status = status;
    saveToStorage(STORAGE_KEYS.USERS, this.users);
    this.logAudit('STATUS_CHANGE', 'User', user.username, `Thay đổi trạng thái tài khoản ${user.fullName} sang ${status}`);
    this.notify();
    return user;
  }

  // Categories Management
  public getAllCategories(type?: CategoryType): Category[] {
    let result = [...this.categories].sort((a, b) => a.displayOrder - b.displayOrder);
    if (type) {
      result = result.filter((c) => c.type === type);
    }
    return result;
  }

  public getCategoryById(id: string): Category | null {
    return this.categories.find((c) => c.id === id) || null;
  }

  public createCategory(data: Omit<Category, 'id' | 'createdAt'>): Category {
    const newCat: Category = {
      ...data,
      id: 'cat-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    this.categories.push(newCat);
    saveToStorage(STORAGE_KEYS.CATEGORIES, this.categories);
    this.logAudit('CREATE', 'Category', newCat.code, `Tạo danh mục mới: ${newCat.name} (${newCat.type})`);
    this.notify();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const idx = this.categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const oldName = this.categories[idx].name;
    this.categories[idx] = { ...this.categories[idx], ...updates };
    const newName = this.categories[idx].name;

    // If category name was renamed, cascade update to all matching tours
    if (newName && oldName && oldName !== newName) {
      let toursUpdated = false;
      this.tours = this.tours.map((t) => {
        if (t.category === oldName) {
          toursUpdated = true;
          return { ...t, category: newName };
        }
        return t;
      });
      if (toursUpdated) {
        saveToStorage(STORAGE_KEYS.TOURS, this.tours);
      }
    }

    saveToStorage(STORAGE_KEYS.CATEGORIES, this.categories);
    this.logAudit('UPDATE', 'Category', this.categories[idx].code, `Cập nhật danh mục: ${this.categories[idx].name}`);
    this.notify();
    return this.categories[idx];
  }

  public deleteCategory(id: string): boolean {
    const cat = this.categories.find((c) => c.id === id);
    if (!cat) return false;
    const deletedName = cat.name;
    this.categories = this.categories.filter((c) => c.id !== id);
    saveToStorage(STORAGE_KEYS.CATEGORIES, this.categories);

    // If any tour was using this deleted category, reassign to the first available category
    const fallbackCategory = this.categories[0]?.name || 'Thủ công gia đình';
    let tourUpdated = false;
    this.tours = this.tours.map((t) => {
      if (t.category === deletedName) {
        tourUpdated = true;
        return { ...t, category: fallbackCategory };
      }
      return t;
    });
    if (tourUpdated) {
      saveToStorage(STORAGE_KEYS.TOURS, this.tours);
    }

    this.logAudit('DELETE', 'Category', cat.code, `Xóa danh mục: ${cat.name}`);
    this.notify();
    return true;
  }

  public toggleCategoryStatus(id: string, active: boolean): Category | null {
    const cat = this.categories.find((c) => c.id === id);
    if (!cat) return null;
    cat.isActive = active;
    saveToStorage(STORAGE_KEYS.CATEGORIES, this.categories);
    this.logAudit('STATUS_CHANGE', 'Category', cat.code, `Thay đổi trạng thái danh mục ${cat.name} sang ${active ? 'Hoạt động' : 'Tạm ẩn'}`);
    this.notify();
    return cat;
  }

  // Audit Logs
  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  // Reset to Factory Default
  public resetData(): void {
    localStorage.removeItem(STORAGE_KEYS.TOURS);
    localStorage.removeItem(STORAGE_KEYS.SERVICES);
    localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.BANNERS);
    localStorage.removeItem(STORAGE_KEYS.POSTS);
    localStorage.removeItem(STORAGE_KEYS.FEEDBACKS);
    localStorage.removeItem(STORAGE_KEYS.CAMPAIGNS);
    localStorage.removeItem(STORAGE_KEYS.MEDIA);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);

    this.tours = [...INITIAL_TOURS];
    this.services = [...INITIAL_SERVICES];
    this.bookings = [...INITIAL_BOOKINGS];
    this.customers = [...INITIAL_CUSTOMERS];
    this.banners = [...INITIAL_BANNERS];
    this.posts = [...INITIAL_POSTS];
    this.feedbacks = [...INITIAL_FEEDBACKS];
    this.campaigns = [...INITIAL_CAMPAIGNS];
    this.mediaFiles = [...INITIAL_MEDIA_FILES];
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    this.siteConfig = { ...INITIAL_SITE_CONFIG };
    this.users = [...INITIAL_ADMIN_USERS];
    this.categories = [...INITIAL_CATEGORIES];
    this.notify();
  }
}

export const dataStore = new DataStore();
