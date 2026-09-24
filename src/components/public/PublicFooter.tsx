import React from 'react';
import { Compass, Mail, Phone, MapPin, Leaf, ShieldCheck, Heart } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer id="about" className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800 text-xs">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-black font-serif text-white">EMIC</span>{' '}
                <span className="text-xl font-light font-serif text-amber-500">TRAVEL</span>
                <p className="text-[10px] text-emerald-400 tracking-wider uppercase">Thành viên EMIC Hospitality</p>
              </div>
            </div>

            <p className="text-stone-400 leading-relaxed pr-4">
              Thành lập từ năm 2016, Emic Travel là đơn vị tiên phong kiến tạo các tour du lịch sinh thái trải nghiệm, bảo tồn di sản Chăm Pa & phố cổ, kết hợp chương trình phát triển cộng đồng bền vững tại Hội An.
            </p>

            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <Leaf className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Hướng tới chứng chỉ Bền vững Quốc tế Travelife</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-4">Tour Nổi Bật</h4>
            <ul className="space-y-2.5 text-stone-400">
              <li><a href="#tours" className="hover:text-emerald-400 transition-colors">Jeep Tour Mỹ Sơn</a></li>
              <li><a href="#tours" className="hover:text-emerald-400 transition-colors">Thuyền Thúng Rừng Dừa</a></li>
              <li><a href="#tours" className="hover:text-emerald-400 transition-colors">Workshop Tái Chế BSF</a></li>
              <li><a href="#tours" className="hover:text-emerald-400 transition-colors">Khám Phá Nông Thôn Cẩm Kim</a></li>
              <li><a href="#tours" className="hover:text-emerald-400 transition-colors">Làng Rau Trà Quế & Cooking</a></li>
            </ul>
          </div>

          {/* Sustainable Projects */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-4">Chương Trình Xanh</h4>
            <ul className="space-y-2.5 text-stone-400">
              <li><a href="#eco-commitment" className="hover:text-emerald-400 transition-colors">Tái chế xà phòng khách sạn</a></li>
              <li><a href="#eco-commitment" className="hover:text-emerald-400 transition-colors">Nuôi ruồi lính đen BSF</a></li>
              <li><a href="#eco-commitment" className="hover:text-emerald-400 transition-colors">Trồng rừng dừa nước Cẩm Thanh</a></li>
              <li><a href="#eco-commitment" className="hover:text-emerald-400 transition-colors">Học bổng trẻ em nghèo Hội An</a></li>
              <li><a href="#eco-commitment" className="hover:text-emerald-400 transition-colors">Cam kết Zero-Plastic</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-4">Liên Hệ Trực Tiếp</h4>
            <ul className="space-y-3 text-stone-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Số 188 Trần Nhân Tông, Cẩm Châu, TP. Hội An, Quảng Nam</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-white font-bold">0905 123 456</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>info@emictravel.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-4">
          <p>© 2026 EMIC TRAVEL. All rights reserved. Hệ thống quản trị bởi Emic Travel CMS.</p>
          <div className="flex items-center gap-1 text-stone-400">
            <span>Thiết kế vì môi trường bền vững</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>Hội An, Việt Nam</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
