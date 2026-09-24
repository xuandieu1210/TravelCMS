import React, { useState } from 'react';
import { AuditLog } from '../../types';
import { History, Shield, Clock, Search, Filter, User } from 'lucide-react';

interface AuditLogsViewProps {
  logs: AuditLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs }) => {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = logs.filter((l) => {
    const matchSearch =
      l.description.toLowerCase().includes(search.toLowerCase()) ||
      l.userName.toLowerCase().includes(search.toLowerCase()) ||
      l.entityName.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === 'ALL' || l.action === actionFilter;
    return matchSearch && matchAction;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-emerald-100 text-emerald-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'APPROVE':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-stone-100 text-stone-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-stone-900 font-serif tracking-tight">
            Nhật Ký Thao Tác Hệ Thống (Audit Logs)
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Lịch sử theo dõi toàn bộ hành động chỉnh sửa, thêm mới và phê duyệt của quản trị viên theo chuẩn ISO / Bền vững.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-semibold">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Bảo mật hệ thống kích hoạt</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo nội dung thao tác, tên admin, đối tượng..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-500">
          <Filter className="w-3.5 h-3.5" />
          <span>Hành động:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-800 bg-white"
          >
            <option value="ALL">Tất cả hành động</option>
            <option value="CREATE">CREATE (Tạo mới)</option>
            <option value="UPDATE">UPDATE (Cập nhật)</option>
            <option value="DELETE">DELETE (Xóa)</option>
            <option value="APPROVE">APPROVE (Phê duyệt)</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Thời Gian</th>
                <th className="py-3 px-4">Người Thực Hiện</th>
                <th className="py-3 px-4">Hành Động</th>
                <th className="py-3 px-4">Thực Thể</th>
                <th className="py-3 px-4">Chi Tiết Thao Tác</th>
                <th className="py-3 px-4">Địa Chỉ IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3 px-4 text-stone-500 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>{new Date(log.timestamp).toLocaleString('vi-VN')}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-bold text-stone-900">
                      <User className="w-3.5 h-3.5 text-amber-600" />
                      <span>{log.userName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-stone-700 whitespace-nowrap font-mono text-[11px]">
                    {log.entityName}
                  </td>
                  <td className="py-3 px-4 text-stone-800">
                    {log.description}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-stone-400 whitespace-nowrap">
                    {log.userRole}
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
