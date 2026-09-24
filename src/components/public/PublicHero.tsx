import React, { useState } from 'react';
import { Banner } from '../../types';
import { Search, MapPin, Calendar, Compass, Shield, Award, Users } from 'lucide-react';

interface PublicHeroProps {
  banners: Banner[];
  onSearch: (filters: { category: string; search: string; maxPrice?: number }) => void;
  onExploreTours: () => void;
}

export const PublicHero: React.FC<PublicHeroProps> = ({ banners, onSearch, onExploreTours }) => {
  const currentBanner = banners[0] || {
    title: 'Hành Trình Du Lịch Xanh & Trải Nghiệm Sinh Thái Bền Vững Hội An',
    subtitle: 'Khám phá văn hóa bản địa độc đáo, gìn giữ di sản cùng Emic Travel - Tiên phong vì môi trường và cộng đồng',
    imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=80',
    badgeText: 'CAM KẾT 100% KHÔNG RÁC THẢI NHỰA',
    buttonText: 'Khám Phá Tour Ngay',
  };

  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('ALL');
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ category, search: keyword, maxPrice });
    const target = document.getElementById('tours');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative min-h-[640px] flex items-center justify-center bg-stone-900 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={currentBanner.imageUrl}
          alt={currentBanner.title}
          className="w-full h-full object-cover object-center filter brightness-60 scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-900/50 to-stone-950/40" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center z-10">
        {/* Eco Badge */}
        {currentBanner.badgeText && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/80 border border-emerald-400/40 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {currentBanner.badgeText}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white font-serif tracking-tight leading-tight sm:leading-tight mb-6">
          {currentBanner.title}
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-stone-200 font-light leading-relaxed mb-10">
          {currentBanner.subtitle}
        </p>

        {/* Action Button */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={onExploreTours}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3.5 rounded-full text-base shadow-lg shadow-emerald-950/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Compass className="w-5 h-5" />
            {currentBanner.buttonText}
          </button>
          <a
            href="#eco-commitment"
            className="bg-stone-800/80 hover:bg-stone-700/80 text-stone-200 border border-stone-600/70 font-medium px-6 py-3.5 rounded-full text-base backdrop-blur-md transition-colors"
          >
            Tìm Hiểu Triết Lý Xanh
          </a>
        </div>

        {/* Quick Search Widget */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 sm:p-5 shadow-2xl border border-stone-100 max-w-4xl mx-auto text-left">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Keyword Search */}
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                Từ khóa / Điểm đến
              </label>
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-stone-400 absolute left-3" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Mỹ Sơn, Rừng dừa, Làng rau..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-stone-200 text-stone-900 text-sm focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Category Select */}
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                Loại hình tour
              </label>
              <div className="relative flex items-center">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-stone-200 text-stone-900 text-sm focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
                >
                  <option value="ALL">Tất cả loại tour</option>
                  <option value="Jeep Tour & Khám phá">Jeep Tour Khám Phá</option>
                  <option value="Du lịch Sinh thái Bản địa">Sinh Thái Bản Địa</option>
                  <option value="Workshop Bền Vững & Giáo Dục">Workshop Tái Chế</option>
                  <option value="Văn hóa & Đời sống Bản địa">Văn Hóa Làng Nghề</option>
                  <option value="Ẩm thực & Nông nghiệp Hữu cơ">Ẩm Thực Nông Nghiệp</option>
                </select>
              </div>
            </div>

            {/* Price Filter */}
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                Ngân sách tối đa
              </label>
              <select
                value={maxPrice || ''}
                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2.5 rounded-lg border border-stone-200 text-stone-900 text-sm focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
              >
                <option value="">Tất cả mức giá</option>
                <option value="800000">Dưới 800.000 đ</option>
                <option value="1200000">Dưới 1.200.000 đ</option>
                <option value="1500000">Dưới 1.500.000 đ</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="sm:col-span-2 sm:self-end">
              <button
                type="submit"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-lg text-sm shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                Tìm Tour
              </button>
            </div>
          </form>
        </div>

        {/* Value Props Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-stone-800/80 text-stone-300 text-xs">
          <div className="flex items-center gap-2 justify-center">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Đạt chuẩn du lịch bền vững Travelife</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>100% Không đồ nhựa dùng một lần</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <Users className="w-4 h-4 text-teal-400 shrink-0" />
            <span>Ủng hộ sinh kế ngư dân & nông dân địa phương</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <Compass className="w-4 h-4 text-orange-400 shrink-0" />
            <span>Xe Jeep cổ & Hướng dẫn viên bản địa 5*</span>
          </div>
        </div>
      </div>
    </section>
  );
};
