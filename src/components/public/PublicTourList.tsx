import React, { useState } from 'react';
import { Tour } from '../../types';
import { Clock, Users, Star, ArrowRight, CheckCircle, Compass, Sparkles } from 'lucide-react';

interface PublicTourListProps {
  tours: Tour[];
  onSelectTour: (tour: Tour) => void;
  onBookTour: (tour: Tour) => void;
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
}

export const PublicTourList: React.FC<PublicTourListProps> = ({
  tours,
  onSelectTour,
  onBookTour,
  activeCategory,
  onCategoryChange,
}) => {
  const categories = [
    { id: 'ALL', label: 'Tất Cả Tour' },
    { id: 'Jeep Tour & Khám phá', label: 'Jeep Tour Quân Sự' },
    { id: 'Du lịch Sinh thái Bản địa', label: 'Sinh Thái Rừng Dừa' },
    { id: 'Workshop Bền Vững & Giáo Dục', label: 'Workshop Tái Chế' },
    { id: 'Văn hóa & Đời sống Bản địa', label: 'Văn Hóa Làng Nghề' },
    { id: 'Ẩm thực & Nông nghiệp Hữu cơ', label: 'Ẩm Thực Hữu Cơ' },
  ];

  return (
    <section id="tours" className="py-20 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-3">
              <Compass className="w-3.5 h-3.5" /> Hành Trình Trải Nghiệm Độc Bản
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-serif text-stone-900 tracking-tight">
              Tour Sinh Thái & Văn Hóa Hội An
            </h2>
            <p className="text-stone-600 mt-2 text-sm sm:text-base max-w-xl">
              Được thiết kế tỉ mỉ bởi những chuyên gia bản địa của Emic Travel, tôn trọng văn hóa và gìn giữ môi trường.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-6 md:mt-0 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tour Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => (
            <div
              key={tour.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 flex flex-col group"
            >
              {/* Thumbnail Container */}
              <div className="relative h-60 overflow-hidden">
                <img
                  src={tour.thumbnail}
                  alt={tour.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <span className="bg-emerald-800/90 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-xs shadow-xs">
                    {tour.category}
                  </span>
                  {tour.isFeatured && (
                    <span className="bg-amber-500 text-stone-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <Sparkles className="w-3 h-3" /> Nổi bật
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 right-3 bg-white/95 text-stone-900 text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1 shadow-xs">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{tour.rating}</span>
                  <span className="text-stone-400 font-normal">({tour.reviewCount})</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 text-xs text-stone-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      {tour.durationDays} ngày {tour.durationNights > 0 ? `${tour.durationNights} đêm` : ''}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      Tối đa {tour.maxGuests} khách
                    </span>
                  </div>

                  <h3
                    onClick={() => onSelectTour(tour)}
                    className="text-lg font-bold text-stone-900 group-hover:text-emerald-700 transition-colors cursor-pointer line-clamp-2 leading-snug mb-3"
                  >
                    {tour.name}
                  </h3>

                  {/* Highlights snippet */}
                  <ul className="space-y-1.5 mb-6 text-xs text-stone-600">
                    {tour.highlights.slice(0, 2).map((hl, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Footer: Price & Actions */}
                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-stone-400 block font-medium">Giá từ / người lớn</span>
                    <div className="text-lg font-black text-emerald-800">
                      {tour.pricing.adultPrice.toLocaleString('vi-VN')} <span className="text-xs font-normal text-stone-600">đ</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectTour(tour)}
                      className="px-3 py-2 text-xs font-semibold text-stone-700 hover:text-emerald-700 transition-colors"
                    >
                      Chi tiết
                    </button>
                    <button
                      onClick={() => onBookTour(tour)}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs transition-transform active:scale-95 flex items-center gap-1"
                    >
                      Đặt Tour
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {tours.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
            <Compass className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-600 font-medium">Không tìm thấy tour phù hợp với tiêu chí lọc.</p>
            <button
              onClick={() => onCategoryChange('ALL')}
              className="mt-3 text-xs font-bold text-emerald-700 underline"
            >
              Xem tất cả tour
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
