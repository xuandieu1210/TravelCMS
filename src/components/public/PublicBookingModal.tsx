import React, { useState } from 'react';
import { Tour, ServiceItem, Booking } from '../../types';
import { X, Calendar, Users, Phone, Mail, User, CheckCircle2, ShieldCheck, CreditCard, Banknote } from 'lucide-react';

interface PublicBookingModalProps {
  item: { tour?: Tour; service?: ServiceItem } | null;
  onClose: () => void;
  onSubmitBooking: (bookingData: {
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
    paymentMethod: Booking['paymentMethod'];
  }) => Promise<Booking>;
}

export const PublicBookingModal: React.FC<PublicBookingModalProps> = ({
  item,
  onClose,
  onSubmitBooking,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [departureDate, setDepartureDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10)
  );
  const [numAdults, setNumAdults] = useState(2);
  const [numChildren, setNumChildren] = useState(0);
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<Booking['paymentMethod']>('BANK_TRANSFER');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  if (!item) return null;

  const adultPrice = item.tour ? item.tour.pricing.adultPrice : item.service ? item.service.price : 0;
  const childPrice = item.tour ? item.tour.pricing.childPrice : 0;
  const totalAmount = numAdults * adultPrice + numChildren * childPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerEmail) {
      alert('Vui lòng điền đầy đủ họ tên, số điện thoại và email!');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onSubmitBooking({
        tourId: item.tour?.id,
        serviceId: item.service?.id,
        customerName,
        customerPhone,
        customerEmail,
        departureDate,
        numAdults,
        numChildren,
        numInfants: 0,
        specialRequests,
        paymentMethod,
      });
      setConfirmedBooking(result);
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi gửi đơn đặt tour, vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-2 rounded-full hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!confirmedBooking ? (
          <div>
            <div className="mb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                Đặt Trực Tuyến Xác Nhận Nhanh
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-serif text-stone-900 mt-2">
                {item.tour ? item.tour.name : item.service?.name}
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Nhân viên Emic Travel sẽ liên hệ xác nhận và gửi lịch trình chi tiết trong 15 phút.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Customer Info */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Họ và tên quý khách *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Số điện thoại / Zalo *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="0905 123 456"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Email nhận vé *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-emerald-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Date & Guests */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Ngày khởi hành
                  </label>
                  <input
                    type="date"
                    required
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Người lớn (&gt;11 tuổi)
                  </label>
                  <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setNumAdults(Math.max(1, numAdults - 1))}
                      className="px-3 py-2 bg-stone-100 hover:bg-stone-200 font-bold"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-bold text-sm">{numAdults}</span>
                    <button
                      type="button"
                      onClick={() => setNumAdults(numAdults + 1)}
                      className="px-3 py-2 bg-stone-100 hover:bg-stone-200 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Trẻ em (5-11 tuổi)
                  </label>
                  <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setNumChildren(Math.max(0, numChildren - 1))}
                      className="px-3 py-2 bg-stone-100 hover:bg-stone-200 font-bold"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-bold text-sm">{numChildren}</span>
                    <button
                      type="button"
                      onClick={() => setNumChildren(numChildren + 1)}
                      className="px-3 py-2 bg-stone-100 hover:bg-stone-200 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Yêu cầu đặc biệt (Điểm đón, ăn chay, bé nhỏ...)
                </label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Ví dụ: Đón tại khách sạn An Bàng, gia đình có 1 người ăn chay..."
                  className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:outline-emerald-600"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Hình thức thanh toán
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer ${paymentMethod === 'BANK_TRANSFER' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold' : 'border-stone-200'}`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'BANK_TRANSFER'}
                      onChange={() => setPaymentMethod('BANK_TRANSFER')}
                      className="text-emerald-600"
                    />
                    <span>Chuyển khoản VietQR</span>
                  </label>
                  <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer ${paymentMethod === 'CREDIT_CARD' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold' : 'border-stone-200'}`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'CREDIT_CARD'}
                      onChange={() => setPaymentMethod('CREDIT_CARD')}
                      className="text-emerald-600"
                    />
                    <span>Thẻ Visa / Master</span>
                  </label>
                </div>
              </div>

              {/* Summary and Total */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-500 font-medium block">Tổng tiền dự kiến</span>
                  <div className="text-xl font-black text-emerald-900">
                    {totalAmount.toLocaleString('vi-VN')} đ
                  </div>
                </div>
                <div className="text-[11px] text-stone-500 text-right">
                  <span>{numAdults} người lớn</span>
                  {numChildren > 0 && <span>, {numChildren} trẻ em</span>}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-98 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Đang xử lý đặt tour...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Xác Nhận Đặt Tour & Nhận Mã Booking</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Confirmation Success Screen */
          <div className="text-center py-4 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
                Đặt Tour Thành Công
              </span>
              <h3 className="text-2xl font-black font-serif text-stone-900 mt-2">
                Cảm Ơn Quý Khách {confirmedBooking.customerName}!
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Yêu cầu của bạn đã được ghi nhận trực tiếp vào Hệ thống Quản trị Emic Travel CMS.
              </p>
            </div>

            {/* Voucher Card */}
            <div className="bg-emerald-50/80 border-2 border-dashed border-emerald-300 rounded-2xl p-5 text-left text-xs space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-emerald-200/80">
                <span className="text-stone-500 font-medium">Mã đặt chỗ (Booking Code):</span>
                <span className="font-mono font-bold text-sm text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  {confirmedBooking.bookingCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Chương trình:</span>
                <span className="font-bold text-stone-800 text-right">{confirmedBooking.tourName || confirmedBooking.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Ngày khởi hành:</span>
                <span className="font-semibold text-stone-800">{confirmedBooking.departureDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Số lượng khách:</span>
                <span className="font-semibold text-stone-800">
                  {confirmedBooking.numAdults} người lớn {confirmedBooking.numChildren > 0 ? `, ${confirmedBooking.numChildren} trẻ em` : ''}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-emerald-200/80">
                <span className="text-stone-600 font-bold">Tổng thanh toán:</span>
                <span className="text-base font-black text-emerald-900">
                  {confirmedBooking.finalAmount.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            <div className="text-xs text-stone-500 bg-amber-50 border border-amber-200/80 p-3 rounded-xl text-left">
              💡 <strong>Lưu ý:</strong> Một email xác nhận kèm hướng dẫn thanh toán đã được chuẩn bị gửi tới <strong>{confirmedBooking.customerEmail}</strong>. Bạn có thể chuyển sang giao diện Admin CMS để xem đơn đặt này ngay lập tức!
            </div>

            <button
              onClick={onClose}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl transition-all"
            >
              Hoàn Tất
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
