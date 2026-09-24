import React from 'react';
import { DashboardStats, Booking } from '../../types';
import {
  Compass,
  Briefcase,
  CalendarCheck,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  ArrowUpRight,
  CheckCircle,
  Eye,
  AlertCircle,
} from 'lucide-react';

interface DashboardViewProps {
  stats: DashboardStats;
  onSelectBooking: (booking: Booking) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  onSelectBooking,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-6">
      {/* Title & Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-stone-900 font-serif tracking-tight">
            Dashboard Tổng Quan Điều Hành
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Dữ liệu vận hành hệ thống Emic Travel theo thời gian thực (Real-time synced).
          </p>
        </div>

        <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Hôm nay: {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* 6 Key Performance Indicators (KPI Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* KPI 1 */}
        <div
          onClick={() => onNavigateTab('tours')}
          className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase">Tổng Tour</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">{stats.totalTours}</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-1 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> Đang bán công khai
          </div>
        </div>

        {/* KPI 2 */}
        <div
          onClick={() => onNavigateTab('bookings')}
          className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs hover:border-amber-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase">Chờ Xử Lý</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">{stats.pendingBookings}</div>
          <div className="text-[10px] text-amber-700 font-semibold mt-1">Đơn đặt cần tiếp nhận</div>
        </div>

        {/* KPI 3 */}
        <div
          onClick={() => onNavigateTab('bookings')}
          className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs hover:border-blue-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase">Hôm Nay</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-900">{stats.todayBookings}</div>
          <div className="text-[10px] text-blue-700 font-semibold mt-1">Đơn đặt mới trong ngày</div>
        </div>

        {/* KPI 4 */}
        <div
          onClick={() => onNavigateTab('bookings')}
          className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs hover:border-amber-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase">Chờ Xử Lý</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">{stats.pendingBookings}</div>
          <div className="text-[10px] text-amber-700 font-semibold mt-1">Cần xác nhận gấp</div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase">Doanh Thu Ghi Nhận</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-900">
            {stats.totalRevenue.toLocaleString('vi-VN')} <span className="text-xs font-normal text-stone-500">đ</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18.5% so với tháng trước
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Bookings Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-stone-900">Doanh Thu & Đơn Đặt 6 Tháng Gần Nhất</h2>
              <p className="text-xs text-stone-400">Xu hướng tăng trưởng mùa cao điểm du lịch sinh thái Hội An</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              Tăng trưởng ổn định
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-4 border-b border-stone-100">
            {stats.monthlyRevenue.map((m, idx) => {
              const maxRev = 500000000;
              const heightPercent = Math.min(100, Math.round((m.revenue / maxRev) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] font-bold text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {(m.revenue / 1000000).toFixed(0)}Tr
                  </div>
                  <div className="w-full max-w-[40px] bg-emerald-100 group-hover:bg-emerald-600 rounded-t-lg transition-all relative" style={{ height: `${heightPercent}%` }}>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
                      {m.bookings} đơn
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-stone-500">{m.month}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-stone-500 pt-4">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-600 inline-block"></span>
                <span>Doanh thu VNĐ</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500 inline-block"></span>
                <span>Số lượng booking</span>
              </span>
            </div>
            <span className="text-[11px] text-stone-400">Đơn vị: Triệu VNĐ</span>
          </div>
        </div>

        {/* Tour Category Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-900 mb-1">Cơ Cấu Tour Sinh Thái</h2>
            <p className="text-xs text-stone-400 mb-6">Tỷ trọng các chương trình trải nghiệm</p>

            <div className="space-y-4">
              {stats.tourCategoriesDistribution.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-stone-700 truncate pr-2">{item.category}</span>
                    <span className="text-stone-900 font-bold">{item.percentage}% ({item.count})</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        idx === 0
                          ? 'bg-emerald-600'
                          : idx === 1
                          ? 'bg-amber-500'
                          : idx === 2
                          ? 'bg-teal-600'
                          : 'bg-indigo-600'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 bg-amber-50/70 p-3 rounded-xl border border-amber-200/60 text-xs text-amber-900">
            💡 <strong>Xu hướng nổi trội:</strong> Jeep Tour quân sự và Workshop tái chế rác hữu cơ BSF có tốc độ đặt tăng trưởng cao nhất.
          </div>
        </div>
      </div>

      {/* Urgent Recent Bookings Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-900">Booking Mới Nhất Cần Xử Lý</h2>
            <p className="text-xs text-stone-400">Đơn đặt trực tiếp từ website khách hàng</p>
          </div>
          <button
            onClick={() => onNavigateTab('bookings')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-700"
          >
            Xem tất cả &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Mã Đơn</th>
                <th className="py-3 px-4">Khách Hàng</th>
                <th className="py-3 px-4">Chương Trình</th>
                <th className="py-3 px-4">Ngày Đi</th>
                <th className="py-3 px-4">Tổng Tiền</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {stats.recentBookings.map((bk) => (
                <tr key={bk.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-emerald-900">
                    {bk.bookingCode}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-stone-900">{bk.customerName}</div>
                    <div className="text-[11px] text-stone-400">{bk.customerPhone}</div>
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate text-stone-700 font-normal">
                    {bk.tourName || bk.serviceName}
                  </td>
                  <td className="py-3 px-4 text-stone-600">{bk.departureDate}</td>
                  <td className="py-3 px-4 font-bold text-stone-900">
                    {bk.finalAmount.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        bk.status === 'NEW'
                          ? 'bg-blue-100 text-blue-800'
                          : bk.status === 'CONFIRMED'
                          ? 'bg-amber-100 text-amber-800'
                          : bk.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : bk.status === 'COMPLETED'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {bk.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSelectBooking(bk)}
                      className="bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-800 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
