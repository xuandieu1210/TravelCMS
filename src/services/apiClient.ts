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
  TourStatus,
  BookingStatus,
  AdminUser,
  UserStatus,
  Category,
  CategoryType,
} from '../types';

const disabledLocalFallback = new Proxy({} as Record<string, (...args: any[]) => never>, {
  get: (_target, property) => () => {
    throw new Error(`API request failed and all local mock fallbacks have been removed (${String(property)}).`);
  },
});

export const apiClient = {
  // Public APIs
  async getPublicHome() {
    try {
      const res = await fetch('/api/public/home');
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.getPublicHome();
  },

  async getPublicTours(filter?: { category?: string; search?: string; maxPrice?: number }) {
    try {
      const params = new URLSearchParams();
      if (filter?.category) params.append('category', filter.category);
      if (filter?.search) params.append('search', filter.search);
      if (filter?.maxPrice) params.append('maxPrice', filter.maxPrice.toString());
      const res = await fetch(`/api/public/tours?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        return json.data as Tour[];
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.getPublicTours(filter);
  },

  async getPublicTourBySlug(slug: string) {
    try {
      const res = await fetch(`/api/public/tours/${slug}`);
      if (res.ok) {
        const json = await res.json();
        return json.data as Tour;
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.getPublicTourBySlug(slug);
  },

  async getPublicServices() {
    try {
      const res = await fetch('/api/public/services');
      if (res.ok) {
        const json = await res.json();
        return json.data as ServiceItem[];
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.getPublicServices();
  },

  async getPublicNews() {
    try {
      const res = await fetch('/api/public/news');
      if (res.ok) {
        const json = await res.json();
        return json.data as Post[];
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.getPublicNews();
  },

  async getPublicNewsBySlug(slug: string) {
    try {
      const res = await fetch(`/api/public/news/${slug}`);
      if (res.ok) {
        const json = await res.json();
        return json.data as Post;
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.getPublicNewsBySlug(slug);
  },

  async getPublicCategories(): Promise<Category[]> {
    try {
      const res = await fetch('/api/public/categories');
      if (res.ok) {
        const json = await res.json();
        return json.data as Category[];
      }
    } catch {
      // API errors must not fall back to local data.
    }
    return disabledLocalFallback.getAllCategories();
  },

  async getPublicLatestMedia(): Promise<string | null> {
    try {
      const res = await fetch('/api/public/media/latest');
      if (res.ok) {
        const json = await res.json();
        return json.data as string | null;
      }
    } catch {
      // API errors must not fall back to local data.
    }
    return null;
  },

  async createPublicBooking(payload: {
    tourId?: string;
    serviceId?: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    pickupLocation?: string;
    departureDate: string;
    preferredTimeSlot: NonNullable<Booking['preferredTimeSlot']>;
    numAdults: number;
    numChildren: number;
    numInfants: number;
    notes?: string;
    specialRequests?: string;
    paymentMethod?: Booking['paymentMethod'];
    website?: string;
    startedAt?: string;
  }) {
    try {
      const res = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data as Booking;
      }
      const errorJson = await res.json().catch(() => null);
      throw new Error(errorJson?.message || 'Could not submit your booking request.');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    }
    return disabledLocalFallback.createPublicBooking(payload);
  },

  async createPublicFeedback(payload: Omit<CustomerFeedback, 'id' | 'createdAt' | 'isApproved' | 'isFeatured'> & { website?: string; startedAt?: string }) {
    try {
      const res = await fetch('/api/public/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data as CustomerFeedback;
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.createPublicFeedback(payload);
  },

  // Admin APIs
  async getAdminDashboardStats(): Promise<DashboardStats> {
    try {
      const res = await fetch('/api/admin/dashboard/stats');
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.getDashboardStats();
  },

  async getAdminTours() {
    try {
      const res = await fetch('/api/admin/tours');
      if (res.ok) {
        const json = await res.json();
        return json.data as Tour[];
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.getAllTours();
  },

  async createAdminTour(data: Omit<Tour, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'bookingCount' | 'rating' | 'reviewCount'>) {
    try {
      const res = await fetch('/api/admin/tours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data as Tour;
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.createTour(data);
  },

  async updateAdminTour(id: string, updates: Partial<Tour>) {
    try {
      const res = await fetch(`/api/admin/tours/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data as Tour;
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.updateTour(id, updates);
  },

  async updateAdminTourStatus(id: string, status: TourStatus) {
    try {
      const res = await fetch(`/api/admin/tours/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data as Tour;
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.updateTourStatus(id, status);
  },

  async deleteAdminTour(id: string) {
    try {
      const res = await fetch(`/api/admin/tours/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch {
      // fallback
    }
    return disabledLocalFallback.deleteTour(id);
  },

  async getAdminServices() {
    try {
      const res = await fetch('/api/admin/services');
      if (res.ok) {
        const json = await res.json();
        return json.data as ServiceItem[];
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.getAllServices();
  },

  async createAdminService(data: Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data as ServiceItem;
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.createService(data);
  },

  async updateAdminService(id: string, updates: Partial<ServiceItem>) {
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data as ServiceItem;
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.updateService(id, updates);
  },

  async deleteAdminService(id: string) {
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch {
      // fallback
    }
    return disabledLocalFallback.deleteService(id);
  },

  async getAdminBookings() {
    try {
      const res = await fetch('/api/admin/bookings');
      if (res.ok) {
        const json = await res.json();
        return json.data as Booking[];
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.getAllBookings();
  },

  async updateAdminBookingStatus(id: string, status: BookingStatus) {
    try {
      const res = await fetch(`/api/admin/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data as Booking;
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.updateBookingStatus(id, status);
  },

  async updateAdminBooking(id: string, updates: Partial<Booking>) {
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data as Booking;
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.updateBooking(id, updates);
  },

  async sendAdminBookingEmail(id: string) {
    try {
      const res = await fetch(`/api/admin/bookings/${id}/send-email`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        return json;
      }
      const errorJson = await res.json().catch(() => null);
      throw new Error(errorJson?.message || 'Không thể gửi email cho khách hàng.');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    }
    return disabledLocalFallback.sendBookingEmail(id);
  },

  async getAdminCustomers() {
    try {
      const res = await fetch('/api/admin/customers');
      if (res.ok) {
        const json = await res.json();
        return json.data as Customer[];
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.getAllCustomers();
  },

  async updateAdminCustomer(id: string, updates: Partial<Customer>) {
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data as Customer;
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.updateCustomer(id, updates);
  },

  async getAdminBanners() {
    try {
      const res = await fetch('/api/admin/banners');
      if (res.ok) {
        const json = await res.json();
        return json.data as Banner[];
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.getAllBanners();
  },

  async createAdminBanner(banner: Omit<Banner, 'id'>) {
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(banner),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data as Banner;
        }
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.createBanner(banner);
  },

  async updateAdminBanner(id: string, updates: Partial<Banner>) {
    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data as Banner;
        }
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.updateBanner(id, updates);
  },

  async deleteAdminBanner(id: string) {
    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        return true;
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.deleteBanner(id);
  },

  async updateAdminBanners(banners: Banner[]) {
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(banners),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data as Banner[];
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.updateBanners(banners);
  },

  async getAdminPosts() {
    try {
      const res = await fetch('/api/admin/posts');
      if (res.ok) {
        const json = await res.json();
        return json.data as Post[];
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.getAllPosts();
  },

  async createAdminPost(post: Omit<Post, 'id' | 'viewCount' | 'publishedAt'>) {
    try {
      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data as Post;
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.createPost(post);
  },

  async updateAdminPost(id: string, post: Partial<Post>) {
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data as Post;
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.updatePost(id, post);
  },

  async deleteAdminPost(id: string) {
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        return true;
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.deletePost(id);
  },

  async getAdminFeedbacks() {
    try {
      const res = await fetch('/api/admin/feedbacks');
      if (res.ok) {
        const json = await res.json();
        return json.data as CustomerFeedback[];
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.getAllFeedbacks();
  },

  async createAdminFeedback(data: Omit<CustomerFeedback, 'id' | 'createdAt'>) {
    try {
      const res = await fetch('/api/admin/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data as CustomerFeedback;
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.createFeedback(data);
  },

  async editAdminFeedback(id: string, updates: Partial<CustomerFeedback>) {
    try {
      const res = await fetch(`/api/admin/feedbacks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data as CustomerFeedback;
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.updateFeedback(id, updates);
  },

  async deleteAdminFeedback(id: string) {
    try {
      const res = await fetch(`/api/admin/feedbacks/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch {
      // fallback
    }
    return disabledLocalFallback.deleteFeedback(id);
  },

  async updateAdminFeedback(id: string, isApproved: boolean, isFeatured?: boolean) {
    try {
      const res = await fetch(`/api/admin/feedbacks/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved, isFeatured }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data as CustomerFeedback;
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.updateFeedbackApproval(id, isApproved, isFeatured);
  },

  async uploadImage(payload: { filename: string; base64Data: string; folder?: MediaFile['folder'] }) {
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.url) {
          return json.data.url as string;
        }
      }
    } catch {
      // fallback
    }
    disabledLocalFallback.uploadMedia({
      name: payload.filename,
      url: payload.base64Data,
      folder: payload.folder || 'OTHER',
      sizeKb: Math.round((payload.base64Data.length * 0.75) / 1024),
      mimeType: 'image/jpeg',
    });
    return payload.base64Data;
  },

  async getAdminMedia() {
    try {
      const res = await fetch('/api/admin/media');
      if (res.ok) {
        const json = await res.json();
        return json.data as MediaFile[];
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.getAllMedia();
  },

  async uploadAdminMedia(fileData: { name: string; url: string; folder: MediaFile['folder']; sizeKb: number; mimeType: string }) {
    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fileData),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data as MediaFile;
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.uploadMedia(fileData);
  },

  async deleteAdminMedia(id: string) {
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch {
      // fallback
    }
    return disabledLocalFallback.deleteMedia(id);
  },

  async clearAllAdminMedia() {
    const media = await this.getAdminMedia();
    await Promise.all(media.map((file) => this.deleteAdminMedia(file.id)));
    return true;
  },

  async getAdminAuditLogs() {
    try {
      const res = await fetch('/api/admin/audit-logs');
      if (res.ok) {
        const json = await res.json();
        return json.data as AuditLog[];
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.getAuditLogs();
  },

  async getPublicBanners() {
    return this.getAdminBanners();
  },

  async getPublicPosts() {
    return this.getAdminPosts();
  },

  async getPublicFeedbacks() {
    return this.getAdminFeedbacks();
  },

  async toggleAdminBanner(id: string, active: boolean) {
    const banners = await this.getAdminBanners();
    const updated = banners.map(b => b.id === id ? { ...b, isActive: active } : b);
    return this.updateAdminBanners(updated);
  },

  async approveAdminFeedback(id: string, isApproved: boolean) {
    return this.updateAdminFeedback(id, isApproved);
  },

  async getSiteConfig() {
    try {
      const res = await fetch('/api/public/site-config');
      if (res.ok) {
        const json = await res.json();
        return json.data as import('../types').SiteConfig;
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.getSiteConfig();
  },

  async updateSiteConfig(config: Partial<import('../types').SiteConfig>) {
    try {
      const res = await fetch('/api/admin/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data as import('../types').SiteConfig;
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.updateSiteConfig(config);
  },

  // Admin Users & Staff Management
  async loginAdmin(username: string, password: string): Promise<AdminUser | null> {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data as AdminUser;
    } catch {
      return null;
    }
  },

  async getAdminSession(): Promise<AdminUser | null> {
    try {
      const res = await fetch('/api/admin/session');
      if (!res.ok) return null;
      const json = await res.json();
      return json.data as AdminUser;
    } catch {
      return null;
    }
  },

  async logoutAdmin(): Promise<void> {
    await fetch('/api/admin/logout', { method: 'POST' });
  },

  async getAdminUsers(): Promise<AdminUser[]> {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const json = await res.json();
        return json.data as AdminUser[];
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.getAllUsers();
  },

  async createAdminUser(data: Omit<AdminUser, 'id' | 'createdAt'>): Promise<AdminUser> {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data as AdminUser;
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.createUser(data);
  },

  async updateAdminUser(id: string, updates: Partial<AdminUser>): Promise<AdminUser | null> {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data as AdminUser;
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.updateUser(id, updates);
  },

  async deleteAdminUser(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch {
      // fallback
    }
    return disabledLocalFallback.deleteUser(id);
  },

  async toggleAdminUserStatus(id: string, status: UserStatus): Promise<AdminUser | null> {
    try {
      const res = await fetch(`/api/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data as AdminUser;
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.toggleUserStatus(id, status);
  },

  // Category Management
  async getAdminCategories(type?: CategoryType): Promise<Category[]> {
    try {
      const url = type ? `/api/admin/categories?type=${type}` : '/api/admin/categories';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json.data as Category[];
      }
    } catch {
      // fallback to local dataStore
    }
    return disabledLocalFallback.getAllCategories(type);
  },

  async createAdminCategory(data: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data as Category;
        }
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.createCategory(data);
  },

  async updateAdminCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data as Category;
        }
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.updateCategory(id, updates);
  },

  async deleteAdminCategory(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        return true;
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.deleteCategory(id);
  },

  async toggleAdminCategoryStatus(id: string, active: boolean): Promise<Category | null> {
    return this.updateAdminCategory(id, { isActive: active });
  },

  // Marketing Campaigns
  async getAdminCampaigns(): Promise<MarketingCampaign[]> {
    try {
      const res = await fetch('/api/admin/campaigns');
      if (res.ok) {
        const json = await res.json();
        return json.data as MarketingCampaign[];
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.getAllCampaigns();
  },

  async createAdminCampaign(data: Omit<MarketingCampaign, 'id' | 'createdAt'>): Promise<MarketingCampaign> {
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data as MarketingCampaign;
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.createCampaign(data);
  },

  async updateAdminCampaign(id: string, updates: Partial<MarketingCampaign>): Promise<MarketingCampaign | null> {
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data as MarketingCampaign;
      }
    } catch {
      // fallback
    }
    return disabledLocalFallback.updateCampaign(id, updates);
  },

  async deleteAdminCampaign(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch {
      // fallback
    }
    return disabledLocalFallback.deleteCampaign(id);
  },

  resetDemoData() {
    this.resetFactoryData();
  },

  resetFactoryData() {
    disabledLocalFallback.resetData();
  },
};
