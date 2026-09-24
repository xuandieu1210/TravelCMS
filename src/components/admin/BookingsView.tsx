import React, { useState } from 'react';
import { Booking, BookingStatus } from '../../types';
import {
  CalendarCheck,
  Search,
  Filter,
  FileSpreadsheet,
  Eye,
  Mail,
  CheckCircle2,
  Clock,
  Printer,
  XCircle,
  MessageSquare,
} from 'lucide-react';
import { BookingDetailModal } from './BookingDetailModal';

interface BookingsViewProps {
  bookings: Booking[];
  onUpdateStatus: (id: string, status: BookingStatus) => void;
  onSendEmail: (id: string) => Promise<{ success: boolean; message: string }>;
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  bookings,
  onUpdateStatus,
  onSendEmail,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Filter bookings (including customer notes & special requests)
  const filteredBookings = bookings.filter((b) => {
    const term = search.toLowerCase();
    const matchSearch =
      b.bookingCode.toLowerCase().includes(term) ||
      b.customerName.toLowerCase().includes(term) ||
      b.customerPhone.toLowerCase().includes(term) ||
      b.customerEmail.toLowerCase().includes(term) ||
      (b.notes && b.notes.toLowerCase().includes(term)) ||
      (b.specialRequests && b.specialRequests.toLowerCase().includes(term));
    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Mã Đơn',
      'Khách Hàng',
      'Số Điện Thoại',
      'Email',
      'Chương Trình',
      'Ngày Khởi Hành',
      'Người Lớn',
      'Trẻ Em',
      'Ghi Chú Khách Đã Nhập',
      'Tổng Tiền (VNĐ)',
      'Thanh Toán',
      'Trạng Thái',
      'Ngày Đặt',
    ];
    const rows = filteredBookings.map((b) => {
      const combinedNotes = [b.notes, b.specialRequests].filter(Boolean).join(' | ');
      return [
        b.bookingCode,
        `"${b.customerName}"`,
        b.customerPhone,
        b.customerEmail,
        `"${b.tourName || b.serviceName}"`,
        b.departureDate,
        b.numAdults,
        b.numChildren,
        `"${combinedNotes.replace(/"/g, '""')}"`,
        b.finalAmount,
        b.paymentStatus,
        b.status,
        new Date(b.createdAt).toLocaleDateString('vi-VN'),
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `EmicTravel_Bookings_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'NEW':
        return <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[10px] font-bold">Mới tiếp nhận</span>;
      case 'CONFIRMED':
        return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-bold">Đã xác nhận</span>;
      case 'PAID':
        return <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">Đã thanh toán</span>;
      case 'COMPLETED':
        return <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-[10px] font-bold">Hoàn tất tour</span>;
      case 'CANCELLED':
        return <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-[10px] font-bold">Đã hủy</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-stone-900 font-serif tracking-tight">
            Quản Lý Booking & Đơn Đặt Chỗ
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Xử lý tiếp nhận đơn đặt tour, in phiếu voucher du lịch và gửi email xác nhận cho khách hàng.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="bg-stone-900 hover:bg-stone-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Xuất Danh Sách Excel (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mã đơn, họ tên khách, số điện thoại, email..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-emerald-600"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-500">
          <Filter className="w-3.5 h-3.5" />
          <span>Lọc trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-800 bg-white"
          >
            <option value="ALL">Tất cả ({bookings.length})</option>
            <option value="NEW">Mới (NEW)</option>
            <option value="CONFIRMED">Đã xác nhận (CONFIRMED)</option>
            <option value="PAID">Đã thanh toán (PAID)</option>
            <option value="COMPLETED">Hoàn tất (COMPLETED)</option>
            <option value="CANCELLED">Đã hủy (CANCELLED)</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Mã Đặt Chỗ</th>
                <th className="py-3 px-4">Khách Hàng</th>
                <th className="py-3 px-4">Chương Trình</th>
                <th className="py-3 px-4">Ngày Đi & Số Khách</th>
                <th className="py-3 px-4 min-w-[220px]">Ghi Chú Của Khách</th>
                <th className="py-3 px-4">Tổng Tiền</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {filteredBookings.map((bk) => (
                <tr key={bk.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-emerald-950 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {bk.bookingCode}
                    </span>
                    <div className="text-[10px] text-stone-400 mt-1">
                      {new Date(bk.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-stone-900">{bk.customerName}</div>
                    <div className="text-[11px] text-stone-500">{bk.customerPhone}</div>
                    <div className="text-[10px] text-stone-400">{bk.customerEmail}</div>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="font-semibold text-stone-800 line-clamp-1">
                      {bk.tourName || bk.serviceName}
                    </div>
                    <span className="text-[10px] text-stone-400">
                      PT: {bk.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-bold text-emerald-900">{bk.departureDate}</div>
                    <div className="text-[11px] text-stone-500">
                      {bk.numAdults} người lớn {bk.numChildren > 0 ? `, ${bk.numChildren} trẻ em` : ''}
                    </div>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    {bk.notes || bk.specialRequests ? (
                      <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-2.5 text-stone-800 text-[11px] leading-relaxed shadow-2xs">
                        <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[10px] uppercase mb-1">
                          <MessageSquare className="w-3 h-3 text-amber-700 shrink-0" />
                          <span>Ghi chú từ khách:</span>
                        </div>
                        <p className="line-clamp-2 text-stone-700 font-medium">
                          {bk.notes || bk.specialRequests}
                        </p>
                        {bk.notes && bk.specialRequests && (
                          <div className="text-[10px] text-amber-800 mt-1 pt-1 border-t border-amber-200/60 line-clamp-1">
                            <span className="font-semibold">Yêu cầu thêm:</span> {bk.specialRequests}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-stone-300 italic text-[11px] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-200"></span>
                        Không có ghi chú
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-black text-stone-900">
                      {bk.finalAmount.toLocaleString('vi-VN')} đ
                    </div>
                    <span
                      className={`text-[10px] font-bold ${
                        bk.paymentStatus === 'PAID'
                          ? 'text-emerald-700'
                          : bk.paymentStatus === 'PARTIALLY_PAID'
                          ? 'text-amber-700'
                          : 'text-stone-400'
                      }`}
                    >
                      {bk.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {getStatusBadge(bk.status)}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedBooking(bk)}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xử lý</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="p-12 text-center text-stone-400 text-xs">
            Không tìm thấy booking nào phù hợp với bộ lọc tìm kiếm.
          </div>
        )}
      </div>

      {/* Booking Detail Modal with Printable Voucher and Email button */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdateStatus={(id, status) => {
            onUpdateStatus(id, status);
            setSelectedBooking({ ...selectedBooking, status });
          }}
          onSendEmail={onSendEmail}
        />
      )}
    </div>
  );
};
