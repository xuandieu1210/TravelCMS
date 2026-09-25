import React, { useState } from 'react';
import { Compass, Phone, Menu, X, Leaf, HeartHandshake } from 'lucide-react';

interface PublicHeaderProps {
  onOpenBooking: () => void;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({ onOpenBooking }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-emerald-100 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-md shadow-emerald-900/10">
              <Compass className="w-7 h-7 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-emerald-950 font-serif">EMIC</span>
                <span className="text-2xl font-light tracking-wide text-amber-600 font-serif">TRAVEL</span>
              </div>
              <p className="text-[11px] text-emerald-800/80 font-medium tracking-wider uppercase flex items-center gap-1">
                <Leaf className="w-3 h-3 text-emerald-600" /> Du Lịch Sinh Thái Hội An
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-700">
            <a href="#home" className="hover:text-emerald-700 transition-colors">Trang Chủ</a>
            <a href="#tours" className="hover:text-emerald-700 transition-colors">Tour Sinh Thái</a>
            <a href="#services" className="hover:text-emerald-700 transition-colors">Dịch Vụ</a>
            <a href="#eco-commitment" className="hover:text-emerald-700 transition-colors flex items-center gap-1 text-emerald-800 font-semibold">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" /> Bền Vững
            </a>
            <a href="#news" className="hover:text-emerald-700 transition-colors">Tin Tức</a>
            <a href="#about" className="hover:text-emerald-700 transition-colors">Về Emic</a>
          </nav>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-2 text-right">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Hotline tư vấn</div>
                <div className="text-sm font-bold text-stone-800">0905 123 456</div>
              </div>
            </div>

            <button
              onClick={onOpenBooking}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              Đặt Tour Ngay
            </button>

          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={onOpenBooking}
              className="bg-emerald-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold"
            >
              Đặt Tour
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-stone-700 p-2 rounded-md hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-4 pt-2 pb-6 space-y-3">
          <a
            href="#home"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-stone-800 font-medium py-2 border-b border-stone-100"
          >
            Trang Chủ
          </a>
          <a
            href="#tours"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-stone-800 font-medium py-2 border-b border-stone-100"
          >
            Tour Sinh Thái
          </a>
          <a
            href="#services"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-stone-800 font-medium py-2 border-b border-stone-100"
          >
            Dịch Vụ
          </a>
          <a
            href="#eco-commitment"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-emerald-800 font-medium py-2 border-b border-stone-100"
          >
            Cam Kết Bền Vững & Cộng Đồng
          </a>
          <a
            href="#news"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-stone-800 font-medium py-2 border-b border-stone-100"
          >
            Tin Tức & Hoạt Động
          </a>
        </div>
      )}
    </header>
  );
};
