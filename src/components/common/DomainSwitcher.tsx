import React from 'react';
import { Globe, ShieldCheck, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

interface DomainSwitcherProps {
  currentView: 'public' | 'admin';
  onSwitchView: (view: 'public' | 'admin') => void;
  pendingBookingsCount: number;
}

export const DomainSwitcher: React.FC<DomainSwitcherProps> = ({
  currentView,
  onSwitchView,
  pendingBookingsCount,
}) => {
  return (
    <div className="bg-stone-900 text-stone-200 text-xs border-b border-stone-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 shadow-md">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-semibold text-stone-300">EMIC TRAVEL CLOUD SYSTEM</span>
        <span className="hidden md:inline text-stone-500">|</span>
        <span className="hidden md:inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded text-[11px]">
          <CheckCircle2 className="w-3 h-3" /> REST API Live Synchronized
        </span>
      </div>

      <div className="flex items-center gap-2 bg-stone-800/80 p-1 rounded-lg border border-stone-700">
        <button
          onClick={() => onSwitchView('public')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
            currentView === 'public'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
          }`}
          title="Xem Website Khách Hàng (emictravel.aikpt.vn)"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>emictravel.aikpt.vn</span>
          <span className="hidden sm:inline text-[10px] opacity-75">(Website Khách Hàng)</span>
        </button>

        <button
          onClick={() => onSwitchView('admin')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all relative ${
            currentView === 'admin'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
          }`}
          title="Truy cập Hệ Thống Quản Trị (admin.emictravel.aikpt.vn)"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>admin.emictravel.aikpt.vn</span>
          <span className="hidden sm:inline text-[10px] opacity-75">(Hệ Thống Admin CMS)</span>
          {pendingBookingsCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-red-500 text-white rounded-full text-[10px] font-bold animate-pulse">
              {pendingBookingsCount}
            </span>
          )}
        </button>
      </div>

      <div className="hidden lg:flex items-center gap-3 text-stone-400 text-[11px]">
        <span>Kiến trúc: <strong className="text-stone-200">Headless CMS</strong></span>
        <span>•</span>
        <span>DB: <strong className="text-stone-200">Relational 3NF</strong></span>
        <button
          onClick={() => window.location.reload()}
          className="text-stone-400 hover:text-white transition-colors"
          title="Làm mới trạng thái"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
