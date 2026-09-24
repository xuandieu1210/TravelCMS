import React, { useState } from 'react';
import { Customer } from '../../types';
import { Users, Search, Award, Phone, Mail, MapPin, DollarSign, Calendar, Sparkles } from 'lucide-react';

interface CustomersViewProps {
  customers: Customer[];
}

export const CustomersView: React.FC<CustomersViewProps> = ({ customers }) => {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');

  const filtered = customers.filter((c) => {
    const matchSearch =
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchTier = tierFilter === 'ALL' || c.tier === tierFilter;
    return matchSearch && matchTier;
  });

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'VIP':
        return <span className="bg-purple-100 text-purple-900 border border-purple-200 px-2 py-0.5 rounded-full text-[10px] font-black">VIP / PLATINUM</span>;
      case 'GOLD':
        return <span className="bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-black">GOLD MEMBER</span>;
      case 'SILVER':
        return <span className="bg-stone-200 text-stone-800 border border-stone-300 px-2 py-0.5 rounded-full text-[10px] font-black">SILVER</span>;
      default:
        return <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">STANDARD</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-stone-900 font-serif tracking-tight">
            Quản Lý Khách Hàng (CRM)
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Dữ liệu khách hàng, phân hạng thành viên, lịch sử đặt tour và chăm sóc cá nhân hóa.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-800">
          <Users className="w-4 h-4 text-emerald-700" />
          <span>Tổng số: {customers.length} khách hàng đã đăng ký</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo họ tên, số điện thoại, email..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-500">
          <span>Hạng thành viên:</span>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-800 bg-white"
          >
            <option value="ALL">Tất cả các hạng</option>
            <option value="VIP">Hạng VIP</option>
            <option value="GOLD">Hạng Gold</option>
            <option value="SILVER">Hạng Silver</option>
            <option value="STANDARD">Hạng Tiêu chuẩn</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Khách Hàng</th>
                <th className="py-3 px-4">Liên Hệ</th>
                <th className="py-3 px-4">Địa Chỉ</th>
                <th className="py-3 px-4">Hạng Khách Hàng</th>
                <th className="py-3 px-4">Số Lượt Đi</th>
                <th className="py-3 px-4">Tổng Chi Tiêu</th>
                <th className="py-3 px-4">Ghi Chú Sở Thích</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                        {c.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-stone-900">{c.fullName}</div>
                        <div className="text-[10px] text-stone-400">Tham gia: {new Date(c.createdAt).toLocaleDateString('vi-VN')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-stone-800 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-stone-400" />
                      {c.phone}
                    </div>
                    <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-stone-400" />
                      {c.email}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                      <span>{c.address || 'Chưa cập nhật'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getTierBadge(c.tier)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-stone-800 whitespace-nowrap">
                    {c.bookingCount} tour
                  </td>
                  <td className="py-3.5 px-4 font-black text-emerald-900 whitespace-nowrap">
                    {c.totalSpent.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="py-3.5 px-4 max-w-xs text-stone-600">
                    <div className="bg-stone-50 p-1.5 rounded-lg border border-stone-200/60 text-[11px] line-clamp-2">
                      {c.notes || 'Khách thích tour sinh thái & văn hóa'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
