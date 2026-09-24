import React from 'react';
import { ServiceItem } from '../../types';
import { Check, ShieldCheck, Car, Ticket, Utensils, Sparkles } from 'lucide-react';

interface PublicServicesProps {
  services: ServiceItem[];
  onBookService: (service: ServiceItem) => void;
}

export const PublicServices: React.FC<PublicServicesProps> = ({ services, onBookService }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'VEHICLE':
        return <Car className="w-5 h-5 text-amber-600" />;
      case 'TICKET':
        return <Ticket className="w-5 h-5 text-emerald-600" />;
      case 'RESTAURANT':
        return <Utensils className="w-5 h-5 text-orange-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-teal-600" />;
    }
  };

  return (
    <section id="services" className="py-20 bg-white border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> Dịch Vụ Du Lịch Sinh Thái Hội An
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-serif text-stone-900 tracking-tight mb-4">
            Dịch Vụ Đồng Hành Chu Đáo & Đẳng Cấp
          </h2>
          <p className="text-stone-600 text-sm sm:text-base">
            Tận hưởng trọn vẹn kỳ nghỉ với đội xe Jeep chuyên nghiệp, ẩm thực hữu cơ và các hoạt động văn hóa đặc trưng phố Hội.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="bg-stone-50 rounded-2xl p-6 border border-stone-200/80 hover:border-emerald-500/50 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center mb-4 shadow-2xs">
                  {getIcon(srv.type)}
                </div>

                <div className="text-[11px] font-bold tracking-wider uppercase text-stone-400 mb-1">
                  {srv.location}
                </div>

                <h3 className="text-base font-bold text-stone-900 mb-2 leading-snug">
                  {srv.name}
                </h3>

                <p className="text-xs text-stone-600 leading-relaxed mb-4 line-clamp-3">
                  {srv.description}
                </p>

                <ul className="space-y-1 mb-6 text-xs text-stone-500">
                  {srv.highlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 block font-medium">Đơn giá</span>
                  <div className="text-base font-black text-emerald-800">
                    {srv.price.toLocaleString('vi-VN')} <span className="text-xs font-normal text-stone-500">/{srv.unit}</span>
                  </div>
                </div>

                <button
                  onClick={() => onBookService(srv)}
                  className="bg-stone-900 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
                >
                  Đặt Dịch Vụ
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
