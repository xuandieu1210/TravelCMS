import React from 'react';
import { Tour } from '../../types';
import { X, Clock, Users, MapPin, CheckCircle, AlertCircle, Calendar, Star, Compass, Shield, ArrowRight } from 'lucide-react';

interface PublicTourDetailModalProps {
  tour: Tour | null;
  onClose: () => void;
  onBook: (tour: Tour) => void;
}

export const PublicTourDetailModal: React.FC<PublicTourDetailModalProps> = ({
  tour,
  onClose,
  onBook,
}) => {
  if (!tour) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-stone-700 flex items-center justify-center shadow-md transition-transform hover:scale-105"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        <div className="relative h-72 sm:h-80 w-full overflow-hidden">
          <img
            src={tour.thumbnail}
            alt={tour.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
              {tour.category}
            </span>
            <h2 className="text-xl sm:text-3xl font-black font-serif text-white leading-tight">
              {tour.name}
            </h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-stone-200">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                {tour.departureLocation}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {tour.durationDays} ngày {tour.durationNights > 0 ? `${tour.durationNights} đêm` : ''}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {tour.rating} ({tour.reviewCount} đánh giá)
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Price & Booking Callout */}
          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-stone-500 font-medium block">Giá trọn gói / khách người lớn</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-emerald-900">
                  {tour.pricing.adultPrice.toLocaleString('vi-VN')} đ
                </span>
                <span className="text-xs text-stone-500">
                  (Trẻ em: {tour.pricing.childPrice.toLocaleString('vi-VN')} đ)
                </span>
              </div>
            </div>

            <button
              onClick={() => onBook(tour)}
              className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Đặt Tour Này Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Highlights */}
          <div>
            <h3 className="text-base font-bold text-stone-900 mb-3 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-700" />
              Điểm Nổi Bật Của Chương Trình
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tour.highlights.map((hl, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-200/60">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{hl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Schedule */}
          <div>
            <h3 className="text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              Lịch Trình Chi Tiết
            </h3>
            <div className="space-y-4">
              {tour.schedules.map((sch) => (
                <div key={sch.id} className="relative pl-6 border-l-2 border-emerald-500 pb-2">
                  <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-emerald-600 ring-4 ring-emerald-100" />
                  <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                    Ngày {sch.dayNumber}
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 mb-1">{sch.title}</h4>
                  <p className="text-xs text-stone-600 leading-relaxed mb-2">{sch.description}</p>
                  {sch.mealsIncluded.length > 0 && (
                    <div className="inline-block bg-amber-50 text-amber-800 border border-amber-200/80 text-[11px] px-2.5 py-0.5 rounded font-medium">
                      🍽️ Bữa ăn: {sch.mealsIncluded.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Includes & Excludes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-stone-100">
            <div>
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-3">
                ✓ Giá Bao Gồm
              </h4>
              <ul className="space-y-2 text-xs text-stone-600">
                {tour.policies.includes.map((inc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-3">
                ✗ Giá Không Bao Gồm
              </h4>
              <ul className="space-y-2 text-xs text-stone-600">
                {tour.policies.excludes.map((exc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                    <span>{exc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Policy notes */}
          <div className="bg-stone-50 p-4 rounded-xl text-xs text-stone-500 space-y-1">
            <p><strong>Chính sách hoàn hủy:</strong> {tour.policies.cancellation}</p>
            <p><strong>Lưu ý:</strong> {tour.policies.notes}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
