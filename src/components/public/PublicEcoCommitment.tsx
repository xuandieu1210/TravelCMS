import React from 'react';
import { Leaf, Recycle, HeartHandshake, Trees, ShieldAlert, Award } from 'lucide-react';

interface PublicEcoCommitmentProps {
  metrics: {
    plasticBottlesAvoided: number;
    organicWasteCompostedKg: number;
    soapRecycledKg: number;
    treesPlanted: number;
  };
}

export const PublicEcoCommitment: React.FC<PublicEcoCommitmentProps> = ({ metrics }) => {
  return (
    <section id="eco-commitment" className="py-20 bg-emerald-950 text-white relative overflow-hidden">
      {/* Decorative background watermark */}
      <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none translate-x-20 translate-y-20">
        <Leaf className="w-96 h-96 text-emerald-400" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Leaf className="w-3.5 h-3.5" /> Triết Lý Du Lịch Bền Vững
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-serif text-white tracking-tight mb-4">
            Du Lịch Không Dấu Vết - Lan Tỏa Giá Trị Cho Cộng Đồng
          </h2>
          <p className="text-stone-300 text-base leading-relaxed">
            Tại Emic Travel, mỗi chuyến đi không chỉ mang lại niềm vui khám phá mà còn là hành động cụ thể để bảo tồn di sản thiên nhiên và tạo sinh kế bền vững cho người dân Hội An.
          </p>
        </div>

        {/* 4 Core Sustainable Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* Card 1 */}
          <div className="bg-emerald-900/60 border border-emerald-800/80 rounded-2xl p-6 backdrop-blur-xs hover:border-emerald-500/80 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-300 mb-4 group-hover:scale-110 transition-transform">
              <Recycle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Tái Chế Rác Hữu Cơ BSF</h3>
            <p className="text-sm text-stone-300 leading-relaxed">
              Ứng dụng ấu trùng ruồi lính đen xử lý toàn bộ rác hữu cơ nhà bếp khách sạn, tạo nguồn phân trùn quế màu mỡ cho nông nghiệp sạch.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-emerald-900/60 border border-emerald-800/80 rounded-2xl p-6 backdrop-blur-xs hover:border-emerald-500/80 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-300 mb-4 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Dự Án Soap For Hope</h3>
            <p className="text-sm text-stone-300 leading-relaxed">
              Thu gom bánh xà phòng dở dang từ hơn 30 khu nghỉ dưỡng, khử trùng tái chế thành xà phòng sinh học trao tặng bà con vùng cao và trường học.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-emerald-900/60 border border-emerald-800/80 rounded-2xl p-6 backdrop-blur-xs hover:border-emerald-500/80 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-300 mb-4 group-hover:scale-110 transition-transform">
              <Trees className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Trồng Cây Bản Địa</h3>
            <p className="text-sm text-stone-300 leading-relaxed">
              Mỗi tour đặt thành công đều đóng góp 1 cây xanh bản địa (dừa nước, tre ngà, cây bản địa rạch biển) phục hồi rừng ngập mặn Cẩm Thanh.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-emerald-900/60 border border-emerald-800/80 rounded-2xl p-6 backdrop-blur-xs hover:border-emerald-500/80 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-300 mb-4 group-hover:scale-110 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Sinh Kế Ngư Dân & Trẻ Em</h3>
            <p className="text-sm text-stone-300 leading-relaxed">
              Trực tiếp tạo thu nhập ổn định cho hơn 60 gia đình ngư dân làng chài Vạn Lăng và bảo trợ học bổng thường niên cho trẻ em nghèo hiếu học.
            </p>
          </div>
        </div>

        {/* Real-time Metric Numbers */}
        <div className="bg-emerald-900/40 border border-emerald-800 rounded-3xl p-8 backdrop-blur-sm">
          <div className="text-center mb-6">
            <h4 className="text-sm font-semibold tracking-widest text-emerald-300 uppercase">
              Tác Động Xanh Thực Tế Được Đo Lường Năm 2026
            </h4>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="border-r border-emerald-800/60 last:border-none p-2">
              <div className="text-3xl sm:text-4xl font-black text-amber-400 font-serif mb-1">
                {metrics.plasticBottlesAvoided.toLocaleString()}
              </div>
              <div className="text-xs text-stone-300 font-medium">Chai nhựa dùng 1 lần được cắt giảm</div>
            </div>
            <div className="border-r border-emerald-800/60 last:border-none p-2">
              <div className="text-3xl sm:text-4xl font-black text-amber-400 font-serif mb-1">
                {metrics.organicWasteCompostedKg.toLocaleString()} kg
              </div>
              <div className="text-xs text-stone-300 font-medium">Rác hữu cơ ủ phân sinh học BSF</div>
            </div>
            <div className="border-r border-emerald-800/60 last:border-none p-2">
              <div className="text-3xl sm:text-4xl font-black text-amber-400 font-serif mb-1">
                {metrics.soapRecycledKg.toLocaleString()} kg
              </div>
              <div className="text-xs text-stone-300 font-medium">Xà phòng khách sạn được tái chế</div>
            </div>
            <div className="p-2">
              <div className="text-3xl sm:text-4xl font-black text-amber-400 font-serif mb-1">
                {metrics.treesPlanted.toLocaleString()}+
              </div>
              <div className="text-xs text-stone-300 font-medium">Cây xanh được trồng phục hồi đất</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
