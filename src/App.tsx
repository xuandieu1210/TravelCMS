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
import { INITIAL_SITE_CONFIG } from './data/mockData';

// Common Components
import { DomainSwitcher } from './components/common/DomainSwitcher';

// Public Portal - Botanica Garden Hoi An (Original Interface Powered by CMS DB)
import { BotanicaGardenPortal } from './components/public/BotanicaGardenPortal';

// Admin CMS Components
import { AdminLayout } from './components/admin/AdminLayout';
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

export default function App() {
  // Domain View Switcher: 'public' (emictravel.aikpt.vn) or 'admin' (admin.emictravel.aikpt.vn)
  const [currentDomainView, setCurrentDomainView] = useState<'public' | 'admin'>('public');

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
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(INITIAL_SITE_CONFIG);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Load all data from API / DataStore
  const loadAllData = useCallback(async () => {
    try {
      const [
        fetchedTours,
        fetchedServices,
        fetchedBookings,
        fetchedCustomers,
        fetchedBanners,
        fetchedPosts,
        fetchedFeedbacks,
        fetchedStats,
        fetchedLogs,
        fetchedConfig,
        fetchedUsers,
        fetchedCategories,
        fetchedCampaigns,
      ] = await Promise.all([
        apiClient.getPublicTours(),
        apiClient.getPublicServices(),
        apiClient.getAdminBookings(),
        apiClient.getAdminCustomers(),
        apiClient.getPublicBanners(),
        apiClient.getPublicPosts(),
        apiClient.getPublicFeedbacks(),
        apiClient.getAdminDashboardStats(),
        apiClient.getAdminAuditLogs(),
        apiClient.getSiteConfig(),
        apiClient.getAdminUsers(),
        apiClient.getAdminCategories(),
        apiClient.getAdminCampaigns(),
      ]);

      setTours(fetchedTours);
      setServices(fetchedServices);
      setBookings(fetchedBookings);
      setCustomers(fetchedCustomers);
      setBanners(fetchedBanners);
      setPosts(fetchedPosts);
      setFeedbacks(fetchedFeedbacks);
      setStats(fetchedStats);
      setAuditLogs(fetchedLogs);
      if (fetchedConfig) setSiteConfig(fetchedConfig);
      if (fetchedUsers) setUsers(fetchedUsers);
      if (fetchedCategories) setCategories(fetchedCategories);
      if (fetchedCampaigns) setCampaigns(fetchedCampaigns);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

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
      customerPhone: payload.customerPhone || 'N/A',
      customerEmail: payload.customerEmail || 'guest@botanicagarden.vn',
      departureDate: payload.departureDate,
      numAdults: payload.numAdults,
      numChildren: payload.numChildren,
      numInfants: 0,
      notes: payload.notes,
      paymentMethod: 'CASH',
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

  const handleSendBookingEmail = async (id: string) => {
    return await apiClient.sendAdminBookingEmail(id);
  };

  const handleToggleBanner = async (id: string, active: boolean) => {
    await apiClient.toggleAdminBanner(id, active);
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

  const handleResetFactoryData = async () => {
    await apiClient.resetDemoData();
    await loadAllData();
    alert('Đã khôi phục cơ sở dữ liệu mẫu ban đầu của Botanica Garden & Emic Travel thành công!');
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

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      {/* Top Domain Environment Switcher Bar */}
      <DomainSwitcher
        currentView={currentDomainView}
        onSwitchView={setCurrentDomainView}
        pendingBookingsCount={pendingBookingsCount}
      />

      {/* VIEW 1: PUBLIC TRAVEL PORTAL (emictravel.aikpt.vn) - GIỮ NGUYÊN GIAO DIỆN GỐC */}
      {currentDomainView === 'public' && (
        <BotanicaGardenPortal
          tours={tours}
          categories={categories}
          posts={posts}
          feedbacks={feedbacks.filter((f) => f.isApproved)}
          banners={banners}
          siteConfig={siteConfig}
          onSubmitBooking={handleWorkshopBooking}
          onOpenAdmin={() => setCurrentDomainView('admin')}
        />
      )}

      {/* VIEW 2: ENTERPRISE ADMIN CMS (admin.emictravel.aikpt.vn) */}
      {currentDomainView === 'admin' && (
        <AdminLayout
          currentTab={adminTab}
          onSelectTab={setAdminTab}
          pendingBookingsCount={pendingBookingsCount}
          onSwitchToPublic={() => setCurrentDomainView('public')}
          onResetFactoryData={handleResetFactoryData}
        >
          {adminTab === 'dashboard' && stats && (
            <DashboardView
              stats={stats}
              onSelectBooking={() => {
                setAdminTab('bookings');
              }}
              onNavigateTab={setAdminTab}
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
              onCreateCategory={handleCreateCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              onToggleStatus={handleToggleCategoryStatus}
            />
          )}

          {adminTab === 'bookings' && (
            <BookingsView
              bookings={bookings}
              onUpdateStatus={handleUpdateBookingStatus}
              onSendEmail={handleSendBookingEmail}
            />
          )}

          {adminTab === 'cms' && (
            <CmsContentView
              banners={banners}
              posts={posts}
              feedbacks={feedbacks}
              siteConfig={siteConfig}
              onToggleBanner={handleToggleBanner}
              onApproveFeedback={handleApproveFeedback}
              onCreateFeedback={handleCreateFeedback}
              onUpdateFeedback={handleUpdateFeedback}
              onDeleteFeedback={handleDeleteFeedback}
              onCreatePost={handleCreatePost}
              onUpdatePost={handleUpdatePost}
              onDeletePost={handleDeletePost}
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
              onToggleStatus={handleToggleUserStatus}
            />
          )}

          {adminTab === 'audit-logs' && (
            <AuditLogsView logs={auditLogs} />
          )}
        </AdminLayout>
      )}
    </div>
  );
}
