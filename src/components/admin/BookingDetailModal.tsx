import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus } from '../../types';
import {
  X,
  Printer,
  Mail,
  CheckCircle2,
  Calendar,
  User,
  Phone,
  CreditCard,
  QrCode,
  Compass,
  FileSpreadsheet,
  AlertCircle,
  Clock,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

interface BookingDetailModalProps {
  booking: Booking | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: BookingStatus) => void;
  onSendEmail: (id: string) => Promise<{ success: boolean; message: string }>;
  onUpdateBooking?: (id: string, updates: Partial<Booking>) => void;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  onClose,
  onUpdateStatus,
  onSendEmail,
  onUpdateBooking,
}) => {
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [editedPhone, setEditedPhone] = useState(booking?.customerPhone || '');
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  useEffect(() => {
    if (booking) {
      setEditedPhone(booking.customerPhone || '');
      setIsEditingPhone(false);
    }
  }, [booking]);

  if (!booking) return null;

  const handleSendEmailClick = async () => {
    setIsSending(true);
    setEmailStatus(null);
    try {
      const res = await onSendEmail(booking.id);
      setEmailStatus(res.message);
    } catch {
      setEmailStatus('Gửi email thất bại');
    } finally {
      setIsSending(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'NEW':
        return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">Mới tiếp nhận (NEW)</span>;
      case 'CONFIRMED':
        return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">Đã xác nhận (CONFIRMED)</span>;
      case 'PAID':
        return <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">Đã thanh toán (PAID)</span>;
      case 'COMPLETED':
        return <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold">Hoàn tất tour (COMPLETED)</span>;
      case 'CANCELLED':
        return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">Đã hủy (CANCELLED)</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[92vh] overflow-y-auto print:p-0 print:border-none print:shadow-none">
        {/* Header Actions (hidden on print) */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-black text-emerald-950 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
              {booking.bookingCode}
            </span>
            {getStatusBadge(booking.status)}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
              title="In phiếu xác nhận / Voucher"
            >
              <Printer className="w-4 h-4" />
              <span>In Voucher</span>
            </button>

            <button
              onClick={handleSendEmailClick}
              disabled={isSending}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Mail className="w-4 h-4" />
              <span>{isSending ? 'Đang gửi...' : 'Gửi Email Khách'}</span>
            </button>

            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {emailStatus && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2 print:hidden animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{emailStatus}</span>
          </div>
        )}

        {/* Printable Official Travel Voucher */}
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-stone-800">
            <div>
              <div className="flex items-center gap-2">
                <Compass className="w-6 h-6 text-emerald-700" />
                <span className="text-xl font-black font-serif text-emerald-950">EMIC TRAVEL</span>
                <span className="text-xs text-amber-600 font-bold uppercase tracking-wider">HỘI AN</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Du Lịch Sinh Thái Bền Vững • Giấy phép lữ hành quốc tế
              </p>
            </div>

            <div className="text-right">
              <div className="text-base font-black font-serif text-stone-900 uppercase">
                PHIẾU XÁC NHẬN DỊCH VỤ
              </div>
              <div className="text-xs text-stone-400 font-mono">CONFIRMATION VOUCHER</div>
            </div>
          </div>

          {/* Booking Summary Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
            <div>
              <span className="text-stone-400 block font-medium">Mã đặt chỗ</span>
              <span className="font-mono font-bold text-stone-900">{booking.bookingCode}</span>
            </div>
            <div>
              <span className="text-stone-400 block font-medium">Ngày đặt</span>
              <span className="font-semibold text-stone-800">
                {new Date(booking.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div>
              <span className="text-stone-400 block font-medium">Ngày khởi hành</span>
              <span className="font-bold text-emerald-800">{booking.departureDate}</span>
            </div>
            <div>
              <span className="text-stone-400 block font-medium">Số lượng khách</span>
              <span className="font-bold text-stone-800">
                {booking.numAdults} Lớn {booking.numChildren > 0 ? `, ${booking.numChildren} Bé` : ''}
              </span>
            </div>
          </div>

          {/* Tour Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
              Thông Tin Chương Trình Du Lịch
            </h4>
            <div className="p-4 rounded-xl border border-stone-200 space-y-2 text-xs">
              <div className="text-base font-bold text-stone-900">
                {booking.tourName || booking.serviceName}
              </div>
              {booking.specialRequests && (
                <div className="text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  <strong>Yêu cầu đặc biệt:</strong> {booking.specialRequests}
                </div>
              )}
            </div>
          </div>

          {/* Customer Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
              Thông Tin Khách Hàng
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-stone-200 text-xs">
              <div>
                <span className="text-stone-400 block">Họ và tên</span>
                <span className="font-bold text-stone-900">{booking.customerName}</span>
              </div>
              <div>
                <span className="text-stone-400 block">Số điện thoại</span>
                {isEditingPhone ? (
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      type="text"
                      value={editedPhone}
                      onChange={(e) => setEditedPhone(e.target.value)}
                      className="border border-stone-200 rounded px-1.5 py-0.5 text-xs w-full focus:outline-emerald-600 font-semibold"
                      placeholder="Nhập SĐT..."
                    />
                    <button
                      onClick={async () => {
                        if (onUpdateBooking) {
                          await onUpdateBooking(booking.id, { customerPhone: editedPhone });
                        }
                        setIsEditingPhone(false);
                      }}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-1.5 py-0.5 rounded text-[10px]"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => {
                        setEditedPhone(booking.customerPhone || '');
                        setIsEditingPhone(false);
                      }}
                      className="bg-stone-100 hover:bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded text-[10px]"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-semibold text-stone-800">
                      {booking.customerPhone || <span className="text-stone-400 italic font-normal">Chưa có SĐT</span>}
                    </span>
                    <button
                      onClick={() => setIsEditingPhone(true)}
                      className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold underline"
                    >
                      Cập nhật
                    </button>
                  </div>
                )}
              </div>
              <div>
                <span className="text-stone-400 block">Email</span>
                <span className="text-stone-800">{booking.customerEmail}</span>
              </div>
            </div>
          </div>

          {/* Customer Notes & Special Requests */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
              Ghi Chú Của Khách Hàng Đã Nhập
            </h4>
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-xs space-y-2 shadow-2xs">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                <MessageSquare className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Nội dung ghi chú & dặn dò từ khách:</span>
              </div>
              {booking.notes ? (
                <p className="text-stone-800 font-medium whitespace-pre-wrap leading-relaxed bg-white/70 p-3 rounded-xl border border-amber-200/50">
                  {booking.notes}
                </p>
              ) : (
                <p className="text-stone-400 italic bg-white/50 p-2.5 rounded-xl">
                  Khách không để lại ghi chú khi đặt.
                </p>
              )}

              {booking.specialRequests && (
                <div className="text-amber-900 pt-1.5 border-t border-amber-200/60 flex items-start gap-1.5">
                  <span className="font-bold shrink-0">Yêu cầu đặc biệt:</span>
                  <span>{booking.specialRequests}</span>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="p-4 rounded-xl border border-stone-200 space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Đơn giá & số lượng:</span>
              <span>
                {booking.numAdults} người lớn {booking.numChildren > 0 ? `+ ${booking.numChildren} trẻ em` : ''}
              </span>
            </div>
            {booking.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Ưu đãi giảm giá:</span>
                <span>-{booking.discountAmount.toLocaleString('vi-VN')} đ</span>
              </div>
            )}
            <div className="flex justify-between text-stone-600">
              <span>Phương thức thanh toán:</span>
              <span className="font-semibold">{booking.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Tình trạng thanh toán:</span>
              <span className="font-semibold text-emerald-800">{booking.paymentStatus}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-stone-200 text-sm font-bold">
              <span>Tổng Tiền Thanh Toán:</span>
              <span className="text-base text-emerald-900 font-black">
                {booking.finalAmount.toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>

          {/* Status Change Buttons (Hidden on Print) */}
          <div className="pt-4 border-t border-stone-200 print:hidden space-y-3">
            <span className="text-xs font-bold text-stone-700 block">Cập nhật nhanh trạng thái:</span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => onUpdateStatus(booking.id, 'CONFIRMED')}
                className={`px-3 py-1.5 rounded-lg font-bold border transition-colors ${
                  booking.status === 'CONFIRMED'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-amber-50'
                }`}
              >
                Xác nhận (CONFIRMED)
              </button>

              <button
                onClick={() => onUpdateStatus(booking.id, 'PAID')}
                className={`px-3 py-1.5 rounded-lg font-bold border transition-colors ${
                  booking.status === 'PAID'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-emerald-50'
                }`}
              >
                Đã thanh toán (PAID)
              </button>

              <button
                onClick={() => onUpdateStatus(booking.id, 'COMPLETED')}
                className={`px-3 py-1.5 rounded-lg font-bold border transition-colors ${
                  booking.status === 'COMPLETED'
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-purple-50'
                }`}
              >
                Hoàn tất (COMPLETED)
              </button>

              <button
                onClick={() => onUpdateStatus(booking.id, 'CANCELLED')}
                className={`px-3 py-1.5 rounded-lg font-bold border transition-colors ${
                  booking.status === 'CANCELLED'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-red-50'
                }`}
              >
                Hủy đơn (CANCELLED)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
