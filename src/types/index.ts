export type TourStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'DISCONTINUED';
export type BookingStatus = 'NEW' | 'CONFIRMED' | 'PAID' | 'COMPLETED' | 'CANCELLED';
export type ServiceType = 'HOTEL' | 'RESTAURANT' | 'TICKET' | 'VEHICLE' | 'COMBO' | 'ECO_WORKSHOP' | 'OTHER';
export type CustomerTier = 'STANDARD' | 'SILVER' | 'GOLD' | 'VIP';
export type PaymentMethod = 'BANK_TRANSFER' | 'CREDIT_CARD' | 'CASH' | 'MOMO' | 'VNPAY';
export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED';
export type MarketingPlatform = 'FACEBOOK' | 'ZALO_OA' | 'GOOGLE_ADS' | 'TIKTOK';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'OPERATOR' | 'SALES' | 'ACCOUNTANT' | 'GUIDE';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type CategoryType = 'TOUR' | 'WORKSHOP' | 'SERVICE' | 'POST';

export interface Category {
  id: string;
  code: string;
  name: string;
  nameEn?: string;
  slug: string;
  type: CategoryType;
  description: string;
  icon?: string;
  image?: string;
  color?: string;
  displayOrder: number;
  isActive: boolean;
  itemCount?: number;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  permissions: string[];
  lastLogin?: string;
  createdAt: string;
}

export interface TourSchedule {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  mealsIncluded: string[]; // ['Sáng', 'Trưa', 'Tối']
  accommodation?: string;
}

export interface TourPrice {
  adultPrice: number;
  childPrice: number;
  infantPrice: number;
  singleSupplement?: number;
}

export interface Tour {
  id: string;
  code: string;
  name: string;
  nameEn?: string;
  slug: string;
  category: string;
  workshopCat?: 'family' | 'culture' | 'wellness';
  ageGroup?: 'all' | 'adult';
  priceDisplay?: string; // '390', '550', '350', 'request'
  description?: string;
  descriptionEn?: string;
  thumbnail: string;
  album: string[];
  videoUrl?: string;
  departureLocation: string;
  destinationLocation: string;
  durationDays: number;
  durationNights: number;
  transportation: string;
  minGuests: number;
  maxGuests: number;
  pricing: TourPrice;
  schedules: TourSchedule[];
  policies: {
    includes: string[];
    excludes: string[];
    cancellation: string;
    notes: string;
  };
  highlights: string[];
  status: TourStatus;
  isFeatured: boolean;
  viewCount: number;
  bookingCount: number;
  rating: number;
  reviewCount: number;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface SiteConfig {
  whatsapp: string;
  messenger: string;
  instagram: string;
  facebook: string;
  email: string;
  phone: string;
  maps: string;
  address: string;
  visitImage?: string;
}

export interface ServiceItem {
  id: string;
  code: string;
  name: string;
  slug: string;
  type: ServiceType;
  thumbnail: string;
  album: string[];
  price: number;
  unit: string; // 'khách', 'xe', 'phòng', 'vé'
  location: string;
  description: string;
  highlights: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  bookingCode: string;
  tourId?: string;
  tourName?: string;
  serviceId?: string;
  serviceName?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  departureDate: string;
  numAdults: number;
  numChildren: number;
  numInfants: number;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  notes?: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  confirmedBy?: string;
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  idCardPassport?: string;
  nationality: string;
  totalSpent: number;
  bookingCount: number;
  tier: CustomerTier;
  notes?: string;
  createdAt: string;
  lastBookingDate?: string;
}

export interface Banner {
  id: string;
  title: string; // Dòng 2: Tiêu đề chính (Headline)
  subtitle: string; // Dòng 3: Đoạn văn mô tả (Description/Subtitle)
  imageUrl: string; // Hình ảnh banner
  linkUrl: string; // Đường dẫn CTA
  badgeText?: string; // Dòng 1: Tiêu đề phụ / Tagline / Eyebrow
  buttonText: string; // Chữ trên nút CTA
  position: 'HOME_HERO' | 'PROMOTION_BAR' | 'SIDEBAR';
  order: number;
  isActive: boolean;
  badgeTextEn?: string;
  badgeTextVn?: string;
  titleEn?: string;
  titleVn?: string;
  subtitleEn?: string;
  subtitleVn?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  category: string;
  thumbnail: string;
  summary: string;
  content: string;
  author: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt: string;
  viewCount: number;
  seoTitle?: string;
  seoDescription?: string;
  eyebrow?: string;
  imageLabel?: string;
  guestReview?: string;
}

export interface CustomerFeedback {
  id: string;
  customerName: string;
  avatar: string;
  location: string;
  tourName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  code: string;
  description: string;
  bannerImage: string;
  landingPageUrl: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: 'PLANNING' | 'ACTIVE' | 'PAUSED' | 'ENDED';
  channels: {
    facebook: {
      postTitle: string;
      content: string;
      imageUrl: string;
      hashtags: string[];
      targetAudience: string;
    };
    zaloOa: {
      templateName: string;
      messageHeader: string;
      messageBody: string;
      ctaText: string;
    };
    googleAds: {
      campaignName: string;
      keywords: string[];
      headline1: string;
      headline2: string;
      description: string;
    };
    tiktok: {
      videoTopic: string;
      scriptSummary: string;
      soundTrack: string;
      hashtags: string[];
    };
  };
  createdAt: string;
  createdBy: string;
}

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  folder: 'TOURS' | 'SERVICES' | 'BLOG' | 'BANNERS' | 'MARKETING' | 'OTHER';
  sizeKb: number;
  mimeType: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userName: string;
  userRole: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'EXPORT' | 'EMAIL';
  entityName: string;
  entityId: string;
  description: string;
  timestamp: string;
}

export interface DashboardStats {
  totalTours: number;
  totalServices: number;
  todayBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  revenueChangePercent: number | null;
  totalCustomers: number;
  monthlyRevenue: { month: string; revenue: number; bookings: number }[];
  tourCategoriesDistribution: { category: string; count: number; percentage: number }[];
  recentBookings: Booking[];
}
