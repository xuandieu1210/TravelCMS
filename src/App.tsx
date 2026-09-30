/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from './services/apiClient';
import {
  Tour,
  ServiceItem,
  Booking,
  Customer,
  Banner,
  Post,
  CustomerFeedback,
  DashboardStats,
  AuditLog,
  TourStatus,
  BookingStatus,
  SiteConfig,
  AdminUser,
  UserStatus,
  Category,
  MarketingCampaign,
} from './types';
import { BotanicaGardenPortal } from './components/public/BotanicaGardenPortal';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLogin } from './components/admin/AdminLogin';
import { DashboardView } from './components/admin/DashboardView';
import { CategoriesView } from './components/admin/CategoriesView';
import { ToursView } from './components/admin/ToursView';
import { ServicesView } from './components/admin/ServicesView';
import { BookingsView } from './components/admin/BookingsView';
import { CustomersView } from './components/admin/CustomersView';
import { CmsContentView } from './components/admin/CmsContentView';
import { MediaView } from './components/admin/MediaView';
import { MarketingView } from './components/admin/MarketingView';
import { UsersView } from './components/admin/UsersView';
import { AuditLogsView } from './components/admin/AuditLogsView';

const EMPTY_SITE_CONFIG: SiteConfig = {
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

export default function App() {
  const isAdminRoute = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isCheckingAdminSession, setIsCheckingAdminSession] = useState(isAdminRoute);

  // Admin Active Tab
  const [adminTab, setAdminTab] = useState<string>('dashboard');

  // Application Data States
  const [tours, setTours] = useState<Tour[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(EMPTY_SITE_CONFIG);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Load public data first; admin data requires a server-verified session.
  const loadAllData = useCallback(async () => {
    try {
      const [home, fetchedTours, fetchedServices, fetchedConfig, publicCategories] = await Promise.all([
        apiClient.getPublicHome(),
        apiClient.getPublicTours(),
        apiClient.getPublicServices(),
        apiClient.getSiteConfig(),
        apiClient.getPublicCategories(),
      ]);

      setTours(fetchedTours);
      setServices(fetchedServices);
      setBanners(home.banners || []);
      setPosts(home.posts || []);
      setFeedbacks(home.feedbacks || []);
      setSiteConfig(fetchedConfig || EMPTY_SITE_CONFIG);
      setCategories(publicCategories);

      if (!isAdminRoute || !isAdminAuthenticated) return;

      const [
        fetchedBookings,
        fetchedCustomers,
        fetchedBanners,
        fetchedFeedbacks,
        fetchedPosts,
        fetchedStats,
        fetchedLogs,
        fetchedUsers,
        fetchedCategories,
        fetchedCampaigns,
      ] = await Promise.all([
        apiClient.getAdminBookings(),
        apiClient.getAdminCustomers(),
        apiClient.getAdminBanners(),
        apiClient.getAdminFeedbacks(),
        apiClient.getAdminPosts(),
        apiClient.getAdminDashboardStats(),
        apiClient.getAdminAuditLogs(),
        apiClient.getAdminUsers(),
        apiClient.getAdminCategories(),
        apiClient.getAdminCampaigns(),
      ]);

      setBookings(fetchedBookings);
      setCustomers(fetchedCustomers);
  setBanners(fetchedBanners);
      setFeedbacks(fetchedFeedbacks);
      setPosts(fetchedPosts);
      setStats(fetchedStats);
      setAuditLogs(fetchedLogs);
      setUsers(fetchedUsers);
      setCategories(fetchedCategories);
      setCampaigns(fetchedCampaigns);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }, [isAdminRoute, isAdminAuthenticated]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    if (!isAdminRoute) return;
    let active = true;
    apiClient.getAdminSession().then((user) => {
      if (!active) return;
      setIsAdminAuthenticated(Boolean(user));
      if (user) localStorage.setItem('emic_admin_username', user.username);
      else {
        localStorage.removeItem('emic_admin_authenticated');
        localStorage.removeItem('emic_admin_username');
      }
      setIsCheckingAdminSession(false);
    });
    return () => {
      active = false;
    };
  }, [isAdminRoute]);

  // Compute Pending Bookings Count for badge notification
  const pendingBookingsCount = bookings.filter((b) => b.status === 'NEW').length;

  // Handle Workshop Booking Submission from Botanica Portal
  const handleWorkshopBooking = async (payload: {
    tourId?: string;
    tourName: string;
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    departureDate: string;
    numAdults: number;
    numChildren: number;
    notes?: string;
  }) => {
    const newBooking = await apiClient.createPublicBooking({
      tourId: payload.tourId,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone || '',
      customerEmail: payload.customerEmail || 'guest@botanicagarden.vn',
      departureDate: payload.departureDate,
      numAdults: payload.numAdults,
      numChildren: payload.numChildren,
      numInfants: 0,
      notes: payload.notes,
      paymentMethod: 'BANK_TRANSFER',
    });
    await loadAllData(); // Refresh data immediately
    return newBooking;
  };

  // ADMIN CRUD HANDLERS
  const handleCreateTour = async (
    tourData: Omit<Tour, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'bookingCount' | 'rating' | 'reviewCount'>
  ) => {
    await apiClient.createAdminTour(tourData);
    await loadAllData();
  };

  const handleUpdateTour = async (id: string, updates: Partial<Tour>) => {
    await apiClient.updateAdminTour(id, updates);
    await loadAllData();
  };

  const handleDeleteTour = async (id: string) => {
    await apiClient.deleteAdminTour(id);
    await loadAllData();
  };

  const handleUpdateTourStatus = async (id: string, status: TourStatus) => {
    await apiClient.updateAdminTour(id, { status });
    await loadAllData();
  };

  const handleCreateService = async (
    serviceData: Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    await apiClient.createAdminService(serviceData);
    await loadAllData();
  };

  const handleUpdateService = async (id: string, updates: Partial<ServiceItem>) => {
    await apiClient.updateAdminService(id, updates);
    await loadAllData();
  };

  const handleDeleteService = async (id: string) => {
    await apiClient.deleteAdminService(id);
    await loadAllData();
  };

  const handleUpdateBookingStatus = async (id: string, status: BookingStatus) => {
    await apiClient.updateAdminBookingStatus(id, status);
    await loadAllData();
  };

  const handleUpdateBooking = async (id: string, updates: Partial<Booking>) => {
    await apiClient.updateAdminBooking(id, updates);
    await loadAllData();
  };

  const handleSendBookingEmail = async (id: string) => {
    return await apiClient.sendAdminBookingEmail(id);
  };

  const handleToggleBanner = async (id: string, active: boolean) => {
    await apiClient.toggleAdminBanner(id, active);
    await loadAllData();
  };

  const handleCreateBanner = async (banner: Omit<Banner, 'id'>) => {
    await apiClient.createAdminBanner(banner);
    await loadAllData();
  };

  const handleUpdateBanner = async (id: string, updates: Partial<Banner>) => {
    await apiClient.updateAdminBanner(id, updates);
    await loadAllData();
  };

  const handleDeleteBanner = async (id: string) => {
    await apiClient.deleteAdminBanner(id);
    await loadAllData();
  };

  const handleApproveFeedback = async (id: string, isApproved: boolean) => {
    await apiClient.approveAdminFeedback(id, isApproved);
    await loadAllData();
  };

  const handleCreateFeedback = async (
    feedback: Omit<CustomerFeedback, 'id' | 'createdAt'>
  ) => {
    await apiClient.createAdminFeedback(feedback);
    await loadAllData();
  };

  const handleUpdateFeedback = async (
    id: string,
    updates: Partial<CustomerFeedback>
  ) => {
    await apiClient.editAdminFeedback(id, updates);
    await loadAllData();
  };

  const handleDeleteFeedback = async (id: string) => {
    await apiClient.deleteAdminFeedback(id);
    await loadAllData();
  };

  const handleCreatePost = async (
    post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>
  ) => {
    await apiClient.createAdminPost(post);
    await loadAllData();
  };

  const handleUpdatePost = async (id: string, postUpdates: Partial<Post>) => {
    await apiClient.updateAdminPost(id, postUpdates);
    await loadAllData();
  };

  const handleDeletePost = async (id: string) => {
    await apiClient.deleteAdminPost(id);
    await loadAllData();
  };

  const handlePostViewed = (updatedPost: Post) => {
    setPosts((currentPosts) => currentPosts.map((post) => (post.id === updatedPost.id ? updatedPost : post)));
  };

  // Marketing Campaign Handlers
  const handleCreateCampaign = async (
    campaign: Omit<MarketingCampaign, 'id' | 'createdAt'>
  ) => {
    await apiClient.createAdminCampaign(campaign);
    await loadAllData();
  };

  const handleUpdateCampaign = async (
    id: string,
    updates: Partial<MarketingCampaign>
  ) => {
    await apiClient.updateAdminCampaign(id, updates);
    await loadAllData();
  };

  const handleDeleteCampaign = async (id: string) => {
    await apiClient.deleteAdminCampaign(id);
    await loadAllData();
  };

  const handleUpdateSiteConfig = async (configUpdates: Partial<SiteConfig>) => {
    const updated = await apiClient.updateSiteConfig(configUpdates);
    setSiteConfig(updated);
    await loadAllData();
  };

  // User Management Handlers
  const handleCreateUser = async (userData: Omit<AdminUser, 'id' | 'createdAt'>) => {
    await apiClient.createAdminUser(userData);
    await loadAllData();
  };

  const handleUpdateUser = async (id: string, updates: Partial<AdminUser>) => {
    await apiClient.updateAdminUser(id, updates);
    await loadAllData();
  };

  const handleDeleteUser = async (id: string) => {
    await apiClient.deleteAdminUser(id);
    await loadAllData();
  };

  const handleToggleUserStatus = async (id: string, status: UserStatus) => {
    await apiClient.toggleAdminUserStatus(id, status);
    await loadAllData();
  };

  // Category Management Handlers
  const handleCreateCategory = async (catData: Omit<Category, 'id' | 'createdAt'>) => {
    await apiClient.createAdminCategory(catData);
    await loadAllData();
  };

  const handleUpdateCategory = async (id: string, updates: Partial<Category>) => {
    await apiClient.updateAdminCategory(id, updates);
    await loadAllData();
  };

  const handleDeleteCategory = async (id: string) => {
    await apiClient.deleteAdminCategory(id);
    await loadAllData();
  };

  const handleToggleCategoryStatus = async (id: string, active: boolean) => {
    await apiClient.toggleAdminCategoryStatus(id, active);
    await loadAllData();
  };

  const handleSwitchToPublic = () => {
    window.history.pushState({}, '', '/');
    window.location.reload();
  };

  const handleLogout = async () => {
    await apiClient.logoutAdmin();
    localStorage.removeItem('emic_admin_authenticated');
    localStorage.removeItem('emic_admin_username');
    setIsAdminAuthenticated(false);
  };

  const currentAdminUsername = localStorage.getItem('emic_admin_username');
  const currentUser = users.find((user) => user.username === currentAdminUsername) || null;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      {isAdminRoute ? (
        isCheckingAdminSession ? null : isAdminAuthenticated ? (
          <AdminLayout
            currentTab={adminTab}
            onSelectTab={setAdminTab}
            pendingBookingsCount={pendingBookingsCount}
            onSwitchToPublic={handleSwitchToPublic}
            onLogout={handleLogout}
            currentUser={currentUser}
          >
            {adminTab === 'dashboard' && stats && (
              <DashboardView
                stats={stats}
                onSelectBooking={() => setAdminTab('bookings')}
              />
            )}
            {adminTab === 'tours' && (
              <ToursView
                tours={tours}
                categories={categories}
                onCreateTour={handleCreateTour}
                onUpdateTour={handleUpdateTour}
                onDeleteTour={handleDeleteTour}
                onUpdateStatus={handleUpdateTourStatus}
                onCreateCategory={handleCreateCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
              />
            )}
            {adminTab === 'categories' && (
              <CategoriesView
                categories={categories}
                tours={tours}
                onCreateCategory={handleCreateCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
                onToggleStatus={handleToggleCategoryStatus}
              />
            )}
            {adminTab === 'bookings' && (
              <BookingsView
                bookings={bookings}
                tours={tours}
                onUpdateStatus={handleUpdateBookingStatus}
                onUpdateBooking={handleUpdateBooking}
              />
            )}
            {adminTab === 'cms' && (
              <CmsContentView
                posts={posts}
                banners={banners}
                feedbacks={feedbacks}
                tours={tours}
                siteConfig={siteConfig}
                onToggleBanner={handleToggleBanner}
                onApproveFeedback={handleApproveFeedback}
                onCreatePost={handleCreatePost}
                onUpdatePost={handleUpdatePost}
                onDeletePost={handleDeletePost}
                onCreateFeedback={handleCreateFeedback}
                onUpdateFeedback={handleUpdateFeedback}
                onDeleteFeedback={handleDeleteFeedback}
                onCreateBanner={handleCreateBanner}
                onUpdateBanner={handleUpdateBanner}
                onDeleteBanner={handleDeleteBanner}
                onUpdateSiteConfig={handleUpdateSiteConfig}
              />
            )}
            {adminTab === 'media' && <MediaView />}
            {adminTab === 'marketing' && (
              <MarketingView
                campaigns={campaigns}
                onCreateCampaign={handleCreateCampaign}
                onUpdateCampaign={handleUpdateCampaign}
                onDeleteCampaign={handleDeleteCampaign}
              />
            )}
            {adminTab === 'users' && (
              <UsersView
                users={users}
                onCreateUser={handleCreateUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
              />
            )}
            {adminTab === 'audit-logs' && (
              <AuditLogsView logs={auditLogs} />
            )}
          </AdminLayout>
        ) : (
          <AdminLogin onAuthenticated={() => setIsAdminAuthenticated(true)} />
        )
      ) : (
        <BotanicaGardenPortal
          tours={tours}
          categories={categories}
          posts={posts}
          feedbacks={feedbacks.filter((f) => f.isApproved)}
          banners={banners}
          siteConfig={siteConfig}
          onPostViewed={handlePostViewed}
          onSubmitBooking={handleWorkshopBooking}
        />
      )}

    </div>
  );
}
