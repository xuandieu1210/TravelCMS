import React, { useState } from 'react';
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

interface RevenueBookingComboChartProps {
  data: { month: string; revenue: number; bookings: number }[];
}

const RevenueBookingComboChart: React.FC<RevenueBookingComboChartProps> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => data[data.length - 1]?.month || '');

  if (!data || data.length === 0) return null;

  const selectedIndex = Math.max(
    0,
    data.findIndex((item) => item.month === selectedMonth),
  );
  const activeIndex = hoveredIndex ?? selectedIndex;

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1000000) * 1.15;
  const maxBookings = Math.max(...data.map((d) => d.bookings), 10) * 1.25;

  const svgWidth = 600;
  const svgHeight = 200;
  const paddingBottom = 30;
  const paddingTop = 25;
  const usableHeight = svgHeight - paddingTop - paddingBottom;

  const points = data.map((d, i) => {
    const x = ((i + 0.5) / data.length) * svgWidth;
    const y = svgHeight - paddingBottom - (d.revenue / maxRevenue) * usableHeight;
    return { x, y, month: d.month, revenue: d.revenue, bookings: d.bookings };
  });

  const linePathD = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = points[i - 1];
    const cx = (prev.x + pt.x) / 2;
    return `${acc} C ${cx},${prev.y} ${cx},${pt.y} ${pt.x},${pt.y}`;
  }, '');

  const areaPathD = `${linePathD} L ${points[points.length - 1].x},${svgHeight - paddingBottom} L ${points[0].x},${svgHeight - paddingBottom} Z`;

  const activeItem = data[activeIndex];

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs lg:col-span-2 flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-stone-900">Doanh Thu &amp; Đơn Đặt 6 Tháng Gần Nhất</h2>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-600" /> Tăng trưởng mùa cao điểm
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Xu hướng tăng trưởng mùa cao điểm du lịch sinh thái Hội An (Cột: Số lượng Booking | Đường: Doanh thu)
          </p>
        </div>

        {/* Dynamic Month Hover Card */}
        {activeItem && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <label className="sr-only" htmlFor="revenue-month-selector">Chọn tháng xem biểu đồ</label>
            <select
              id="revenue-month-selector"
              value={selectedMonth}
              onChange={(event) => {
                setSelectedMonth(event.target.value);
                setHoveredIndex(null);
              }}
              className="bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-700 outline-none focus:border-emerald-600"
            >
              {data.map((item) => (
                <option key={item.month} value={item.month}>{item.month}</option>
              ))}
            </select>
            <div className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 flex items-center gap-3 text-xs shadow-2xs">
              <div className="text-stone-700 font-extrabold border-r border-stone-200 pr-2.5">
                {activeItem.month}
              </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block"></span>
                <span className="text-stone-500">Booking:</span>
                <span className="font-extrabold text-amber-900">{activeItem.bookings} đơn</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                <span className="text-stone-500">Doanh thu:</span>
                <span className="font-extrabold text-emerald-900">
                  {activeItem.revenue.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>
            </div>
          </div>
        )}
      </div>

      {/* Canvas Area */}
      <div className="relative mt-2 pt-6 pb-2">
        {/* Y-Axis Grid Lines & Background Labels */}
        <div className="absolute inset-x-0 top-6 bottom-8 flex flex-col justify-between pointer-events-none text-[10px] text-stone-400">
          <div className="border-b border-dashed border-stone-100 flex justify-between items-center pb-0.5">
            <span className="bg-white/90 px-1 text-amber-700 font-medium">{Math.round(maxBookings)} đơn</span>
            <span className="bg-white/90 px-1 text-emerald-700 font-medium">{(maxRevenue / 1e6).toFixed(0)}Tr đ</span>
          </div>
          <div className="border-b border-dashed border-stone-100 flex justify-between items-center pb-0.5">
            <span className="bg-white/90 px-1 text-stone-400">{Math.round(maxBookings * 0.66)} đơn</span>
            <span className="bg-white/90 px-1 text-stone-400">{((maxRevenue * 0.66) / 1e6).toFixed(0)}Tr đ</span>
          </div>
          <div className="border-b border-dashed border-stone-100 flex justify-between items-center pb-0.5">
            <span className="bg-white/90 px-1 text-stone-400">{Math.round(maxBookings * 0.33)} đơn</span>
            <span className="bg-white/90 px-1 text-stone-400">{((maxRevenue * 0.33) / 1e6).toFixed(0)}Tr đ</span>
          </div>
          <div className="border-b border-stone-200 flex justify-between items-center pt-0.5">
            <span className="bg-white/90 px-1 text-stone-400">0 đơn</span>
            <span className="bg-white/90 px-1 text-stone-400">0 đ</span>
          </div>
        </div>

        {/* Graphic Area */}
        <div className="relative h-52 w-full flex items-end">
          {/* Revenue Line Chart Overlay (SVG) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Gradient Fill under revenue curve */}
            <path d={areaPathD} fill="url(#revenueGradient)" />

            {/* Revenue Line */}
            <path
              d={linePathD}
              fill="none"
              stroke="#059669"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Revenue Data Point Circles & Badges */}
            {points.map((pt, idx) => {
              const isHovered = hoveredIndex === idx;
              const isSelected = activeIndex === idx;
              return (
                <g key={idx}>
                  {isSelected && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="10"
                      fill="#10b981"
                      fillOpacity="0.3"
                    />
                  )}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 6.5 : 4.5}
                    fill="#047857"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 10}
                    textAnchor="middle"
                    fill="#047857"
                    fontSize="10"
                    fontWeight="bold"
                    className="select-none"
                  >
                    {(pt.revenue / 1000000).toFixed(0)}M
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Booking Bar Chart Columns (HTML) */}
          <div className="w-full h-full flex items-end justify-between px-2 relative z-10">
            {data.map((m, idx) => {
              const bookingHeightPercent = Math.max(10, Math.min(92, Math.round((m.bookings / maxBookings) * 100)));
              const isHovered = hoveredIndex === idx;
              const isSelected = activeIndex === idx;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="flex-1 h-full flex flex-col justify-end items-center group cursor-pointer px-1 relative"
                >
                  {/* Vertical Guide Line on Hover */}
                  {isHovered && (
                    <div className="absolute inset-y-0 w-px bg-emerald-400/80 border-r border-dashed border-emerald-500 pointer-events-none" />
                  )}

                  {/* Booking Count Label */}
                  <div
                    className={`text-[10px] font-extrabold mb-1 px-1.5 py-0.5 rounded transition-all ${
                      isSelected
                        ? 'bg-amber-600 text-white scale-105 shadow-xs'
                        : 'text-amber-800 bg-amber-50/90 border border-amber-200/60'
                    }`}
                  >
                    {m.bookings} đơn
                  </div>

                  {/* Column Bar */}
                  <div
                    className={`w-full max-w-[36px] rounded-t-lg transition-all duration-300 relative shadow-xs ${
                      isSelected
                        ? 'bg-gradient-to-t from-amber-500 to-amber-400 ring-2 ring-amber-400 ring-offset-1'
                        : 'bg-amber-400/85 hover:bg-amber-500'
                    }`}
                    style={{ height: `${bookingHeightPercent}%` }}
                  >
                    <div className="w-full h-1 bg-amber-200/60 rounded-t-lg" />
                  </div>

                  {/* Month Label */}
                  <div className="mt-2 text-center">
                    <span
                      className={`text-[11px] font-bold block transition-colors ${
                        isSelected ? 'text-emerald-900 underline' : 'text-stone-600'
                      }`}
                    >
                      {m.month}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-stone-600 pt-3 border-t border-stone-100 gap-2 mt-2">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-amber-400 inline-block border border-amber-500/30 shadow-2xs"></span>
            <span className="font-semibold text-stone-700">Biểu đồ Cột: Số lượng Booking (Đơn)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 rounded-full bg-emerald-600 inline-block shadow-2xs"></span>
            <span className="font-semibold text-stone-700">Biểu đồ Đường: Doanh Thu (VNĐ)</span>
          </div>
        </div>
        <div className="text-[11px] text-stone-400 italic">
          * Đơn vị: Đơn đặt tour / Triệu VNĐ
        </div>
      </div>
    </div>
  );
};

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
            Bảng điều khiển tổng quan
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Dữ liệu vận hành hệ thống Emic Travel theo thời gian thực.
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
          onClick={() => onNavigateTab('customers')}
          className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs hover:border-indigo-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase">Khách Hàng</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-900">{stats.totalCustomers}</div>
          <div className="text-[10px] text-indigo-700 font-semibold mt-1">Hồ sơ khách lưu trữ</div>
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
          <div className={`text-[10px] font-semibold mt-1 flex items-center gap-1 ${
            stats.revenueChangePercent === null
              ? 'text-stone-500'
              : stats.revenueChangePercent >= 0
              ? 'text-emerald-700'
              : 'text-red-700'
          }`}>
            <TrendingUp className="w-3 h-3" />
            {stats.revenueChangePercent === null
              ? 'Chưa đủ dữ liệu so sánh'
              : `${stats.revenueChangePercent >= 0 ? '+' : ''}${stats.revenueChangePercent.toFixed(1)}% so với tháng trước`}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Bookings Combo Chart */}
        <RevenueBookingComboChart data={stats.monthlyRevenue} />

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
