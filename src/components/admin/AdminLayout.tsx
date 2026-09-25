import React, { useState } from 'react';
import { AdminUser } from '../../types';
import {
  LayoutDashboard,
  Compass,
  Briefcase,
  FolderTree,
  CalendarCheck,
  Users,
  FileText,
  Image as ImageIcon,
  Megaphone,
  History,
  UserCheck,
  Menu,
  X,
  Bell,
  Search,
  ExternalLink,
  ChevronRight,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface AdminLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  pendingBookingsCount: number;
  onSwitchToPublic: () => void;
  onLogout: () => void;
  currentUser: AdminUser | null;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  pendingBookingsCount,
  onSwitchToPublic,
  onLogout,
  currentUser,
  children,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard },
    { id: 'tours', label: 'Quản lý tour và workshop', icon: Compass },
    { id: 'categories', label: 'Quản lý danh mục', icon: FolderTree },
    {
      id: 'bookings',
      label: 'Quản lý đơn đặt chỗ',
      icon: CalendarCheck,
      badge: pendingBookingsCount > 0 ? pendingBookingsCount : undefined,
    },
    { id: 'cms', label: 'Quản lý bài viết và nội dung', icon: FileText },
    { id: 'media', label: 'Quản lý thư viện phương tiện', icon: ImageIcon },
    { id: 'marketing', label: 'Trung tâm tiếp thị', icon: Megaphone },
    { id: 'users', label: 'Quản lý người dùng', icon: UserCheck },
    { id: 'audit-logs', label: 'Nhật ký hệ thống', icon: History },
  ];

  return (
    <div className="admin-page min-h-screen bg-stone-100 flex flex-col">
      {/* Admin Top Header */}
      <header className="bg-stone-900 text-stone-200 border-b border-stone-800 sticky top-0 z-30 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            title="Đóng / mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-black text-amber-500 font-serif tracking-wide text-lg">EMIC TRAVEL</span>
            <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/30 uppercase">
              Quản trị nội dung v2.6
            </span>
          </div>
        </div>

        {/* Global Search and Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={onSwitchToPublic}
            className="hidden sm:flex items-center gap-1.5 text-xs text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 px-3 py-1.5 rounded-lg transition-colors border border-stone-700"
          >
            <span>Xem website công khai</span>
            <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
          </button>

          {/* Notifications button */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-full text-stone-300 hover:text-white hover:bg-stone-800 relative transition-colors"
            >
              <Bell className="w-4 h-4" />
              {pendingBookingsCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-stone-900 animate-ping" />
              )}
            </button>

            {/* Notification Popover */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white text-stone-800 rounded-2xl shadow-xl border border-stone-200 p-4 z-50 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 font-bold">
                  <span>Thông báo hoạt động</span>
                  <span className="text-[11px] text-emerald-700">{pendingBookingsCount} đơn mới</span>
                </div>
                <div className="py-3 space-y-2.5">
                  {pendingBookingsCount > 0 ? (
                    <div
                      onClick={() => {
                        onSelectTab('bookings');
                        setNotificationsOpen(false);
                      }}
                      className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 cursor-pointer hover:bg-amber-100/80 transition-colors"
                    >
                      <p className="font-bold text-amber-900">Có {pendingBookingsCount} đơn đặt tour cần xác nhận!</p>
                      <p className="text-[11px] text-amber-700 mt-0.5">Nhấp vào đây để xem danh sách booking và duyệt ngay.</p>
                    </div>
                  ) : (
                    <p className="text-stone-400 text-center py-2">Không có cảnh báo mới nào.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Admin Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-stone-800">
            <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {(currentUser?.fullName || currentUser?.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-stone-200 leading-tight">
                {currentUser?.fullName || currentUser?.username || 'Người dùng'}
              </div>
              <div className="text-[10px] text-amber-400/80 leading-tight">
                {currentUser?.role === 'SUPER_ADMIN' ? 'Quản trị viên cấp cao' : currentUser?.role || 'Người dùng'}
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`bg-stone-900 border-r border-stone-800 transition-all duration-300 flex flex-col justify-between ${
            sidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/10'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-stone-950' : 'text-stone-400'}`} />
                  {!sidebarCollapsed && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}
                  {!sidebarCollapsed && item.badge !== undefined && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          {!sidebarCollapsed && (
            <div className="p-4 m-3 rounded-2xl bg-stone-800/70 border border-stone-700/60 text-stone-300 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Travelife Eco Standard</span>
              </div>
              <p className="text-[11px] text-stone-400 leading-snug">
                Hệ thống tuân thủ quy chuẩn quản lý du lịch sinh thái và bảo tồn di sản Hội An.
              </p>
            </div>
          )}
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
};
