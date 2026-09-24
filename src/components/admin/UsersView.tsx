import React, { useState } from 'react';
import { AdminUser, UserRole, UserStatus } from '../../types';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  KeyRound,
  Mail,
  Phone,
  Building,
  Calendar,
  X,
  Check,
  Eye,
} from 'lucide-react';

interface UsersViewProps {
  users: AdminUser[];
  onCreateUser: (userData: Omit<AdminUser, 'id' | 'createdAt'>) => void;
  onUpdateUser: (id: string, updates: Partial<AdminUser>) => void;
  onDeleteUser: (id: string) => void;
  onToggleStatus: (id: string, status: UserStatus) => void;
}

const ALL_AVAILABLE_PERMISSIONS = [
  { id: 'tours.manage', label: 'Quản lý Tour & Lớp Workshop (Thêm, Sửa, Xóa, Đổi giá)', group: 'Sản phẩm' },
  { id: 'bookings.manage', label: 'Quản lý Booking (Xác nhận, Huỷ, Đổi trạng thái, Thu tiền)', group: 'Vận hành' },
  { id: 'services.manage', label: 'Quản lý Dịch vụ du lịch (Khách sạn, xe, vé, nhà hàng)', group: 'Sản phẩm' },
  { id: 'crm.manage', label: 'Quản lý Khách hàng & CRM (Thông tin khách, phân hạng VIP)', group: 'Khách hàng' },
  { id: 'cms.manage', label: 'Quản trị CMS Nội dung (Banners, Tin tức, Đánh giá, MXH)', group: 'Nội dung' },
  { id: 'media.manage', label: 'Quản lý Thư viện Media & Tải ảnh', group: 'Nội dung' },
  { id: 'marketing.manage', label: 'Quản lý Chiến dịch Marketing Đa kênh (FB, Ads, Zalo)', group: 'Marketing' },
  { id: 'finance.manage', label: 'Quản lý Báo cáo Doanh thu & Kế toán Thu chi', group: 'Tài chính' },
  { id: 'users.manage', label: 'Quản lý Người dùng & Phân quyền Nhân sự', group: 'Hệ thống' },
  { id: 'audit.view', label: 'Xem Nhật ký Hệ thống (Audit Logs)', group: 'Hệ thống' },
];

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  onToggleStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [viewingPermissionsUser, setViewingPermissionsUser] = useState<AdminUser | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    avatar: '',
    role: 'OPERATOR' as UserRole,
    department: 'Điều Hành & Vận Hành Tour',
    status: 'ACTIVE' as UserStatus,
    permissions: ['tours.manage', 'bookings.manage'],
  });

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      fullName: '',
      email: '',
      phone: '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      role: 'OPERATOR',
      department: 'Điều Hành & Vận Hành Tour',
      status: 'ACTIVE',
      permissions: ['tours.manage', 'bookings.manage'],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar || '',
      role: user.role,
      department: user.department,
      status: user.status,
      permissions: [...user.permissions],
    });
    setIsModalOpen(true);
  };

  const handleTogglePermission = (permId: string) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(permId);
      if (exists) {
        return { ...prev, permissions: prev.permissions.filter((p) => p !== permId) };
      } else {
        return { ...prev, permissions: [...prev.permissions, permId] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.fullName || !formData.email) {
      alert('Vui lòng điền đầy đủ Tên đăng nhập, Họ tên và Email');
      return;
    }

    if (editingUser) {
      onUpdateUser(editingUser.id, formData);
    } else {
      onCreateUser(formData);
    }
    setIsModalOpen(false);
  };

  // Filters
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm);

    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;

    return matchSearch && matchRole && matchStatus;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldAlert className="w-3 h-3 text-purple-600" /> Super Admin
          </span>
        );
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <ShieldCheck className="w-3 h-3 text-blue-600" /> Quản Trị Viên
          </span>
        );
      case 'OPERATOR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Shield className="w-3 h-3 text-emerald-600" /> Điều Hành Tour
          </span>
        );
      case 'SALES':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            Kinh Doanh & Sales
          </span>
        );
      case 'ACCOUNTANT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-800 border border-stone-200">
            Kế Toán Thu Chi
          </span>
        );
      case 'GUIDE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
            Workshop Host / HDV
          </span>
        );
      default:
        return <span className="text-xs">{role}</span>;
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Đang hoạt động
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
            Ngừng hoạt động
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <Lock className="w-3 h-3 text-red-500" /> Tạm khóa
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Tổng Tài Khoản</p>
            <p className="text-2xl font-black text-stone-900 mt-1">{users.length}</p>
            <p className="text-[11px] text-stone-400 mt-0.5">Nhân sự & Quản trị</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Đang Hoạt Động</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {users.filter((u) => u.status === 'ACTIVE').length}
            </p>
            <p className="text-[11px] text-emerald-600 mt-0.5">Sẵn sàng phân công</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Quản Trị Viên (Admin)</p>
            <p className="text-2xl font-black text-blue-600 mt-1">
              {users.filter((u) => u.role === 'SUPER_ADMIN' || u.role === 'ADMIN').length}
            </p>
            <p className="text-[11px] text-stone-400 mt-0.5">Toàn quyền hệ thống</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Điều Hành & Bán Hàng</p>
            <p className="text-2xl font-black text-amber-600 mt-1">
              {users.filter((u) => u.role === 'OPERATOR' || u.role === 'SALES' || u.role === 'GUIDE').length}
            </p>
            <p className="text-[11px] text-stone-400 mt-0.5">Trực tiếp phục vụ khách</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Building className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Action and Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo họ tên, username, email, số điện thoại..."
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-stone-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl text-xs px-3 py-2 focus:outline-none text-stone-700 font-medium"
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Quản Trị Viên (Admin)</option>
              <option value="OPERATOR">Điều Hành Tour</option>
              <option value="SALES">Kinh Doanh & Sales</option>
              <option value="ACCOUNTANT">Kế Toán</option>
              <option value="GUIDE">Workshop Host / HDV</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl text-xs px-3 py-2 focus:outline-none text-stone-700 font-medium"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="SUSPENDED">Tạm khóa</option>
              <option value="INACTIVE">Ngừng hoạt động</option>
            </select>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Thêm Người Dùng Mới</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Thành Viên</th>
                <th className="py-3.5 px-4">Vai Trò & Bộ Phận</th>
                <th className="py-3.5 px-4">Thông Tin Liên Hệ</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4">Đăng Nhập Cuối</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    Không tìm thấy người dùng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-stone-50/50 transition-colors">
                    {/* User info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                          alt={user.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-stone-200 shadow-2xs"
                        />
                        <div>
                          <p className="font-bold text-stone-900 text-sm">{user.fullName}</p>
                          <p className="text-stone-400 font-mono text-[11px]">@{user.username}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role & Dept */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div>{getRoleBadge(user.role)}</div>
                        <p className="text-[11px] text-stone-500 flex items-center gap-1 font-medium">
                          <Building className="w-3 h-3 text-stone-400" /> {user.department}
                        </p>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-stone-700 font-medium">
                          <Mail className="w-3.5 h-3.5 text-stone-400" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-stone-500">
                          <Phone className="w-3.5 h-3.5 text-stone-400" />
                          <span>{user.phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(user.status)}
                    </td>

                    {/* Last login */}
                    <td className="py-3.5 px-4 text-stone-500 font-mono text-[11px]">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString('vi-VN') : 'Chưa đăng nhập'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Permissions button */}
                        <button
                          onClick={() => setViewingPermissionsUser(user)}
                          title="Xem phân quyền chi tiết"
                          className="p-1.5 text-stone-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        {/* Edit button */}
                        <button
                          onClick={() => openEditModal(user)}
                          title="Chỉnh sửa thông tin"
                          className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Toggle lock status */}
                        {user.status === 'ACTIVE' ? (
                          <button
                            onClick={() => onToggleStatus(user.id, 'SUSPENDED')}
                            title="Khóa tài khoản"
                            className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onToggleStatus(user.id, 'ACTIVE')}
                            title="Mở khóa tài khoản"
                            className="p-1.5 text-amber-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Unlock className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete button (prevent deleting super admin) */}
                        {user.role !== 'SUPER_ADMIN' && (
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc chắn muốn xóa tài khoản "${user.fullName}" không?`)) {
                                onDeleteUser(user.id);
                              }
                            }}
                            title="Xóa người dùng"
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create or Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-stone-900 text-white">
                  {editingUser ? <Edit2 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">
                    {editingUser ? `Chỉnh Sửa Người Dùng: ${editingUser.fullName}` : 'Thêm Người Dùng & Phân Quyền Mới'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Cung cấp tài khoản truy cập vào hệ thống Admin CMS Emic Travel
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Tên đăng nhập (Username) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="ví dụ: lexuandieu"
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-stone-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Họ và Tên đầy đủ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="ví dụ: Lê Xuân Diệu"
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-stone-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Email công việc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="dieu.le@emictravel.com"
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-stone-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Số điện thoại liên hệ</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0905 982 919"
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-stone-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Vai trò hệ thống</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-stone-900 outline-none bg-white font-medium"
                  >
                    <option value="SUPER_ADMIN">Super Admin (Toàn quyền)</option>
                    <option value="ADMIN">Quản Trị Viên (Admin)</option>
                    <option value="OPERATOR">Điều Hành Tour (Operator)</option>
                    <option value="SALES">Kinh Doanh & CSKH (Sales)</option>
                    <option value="ACCOUNTANT">Kế Toán & Thu Chi</option>
                    <option value="GUIDE">Workshop Host / HDV</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Bộ phận / Phòng ban</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Điều Hành & Vận Hành Tour"
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-stone-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Trạng thái tài khoản</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-stone-900 outline-none bg-white font-medium"
                  >
                    <option value="ACTIVE">Đang hoạt động (Active)</option>
                    <option value="SUSPENDED">Tạm khóa (Suspended)</option>
                    <option value="INACTIVE">Ngừng hoạt động (Inactive)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">URL Ảnh Đại Diện (Avatar)</label>
                <input
                  type="text"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-stone-900 outline-none"
                />
              </div>

              {/* Permissions Checklist */}
              <div className="pt-2 border-t border-stone-100">
                <label className="block font-bold text-stone-900 mb-2">
                  Phân Quyền Chi Tiết (Role-Based Access Control):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                  {ALL_AVAILABLE_PERMISSIONS.map((perm) => {
                    const isChecked = formData.permissions.includes(perm.id) || formData.permissions.includes('all');
                    return (
                      <label
                        key={perm.id}
                        className="flex items-start gap-2 text-stone-700 cursor-pointer hover:text-stone-900 select-none p-1.5 rounded-lg hover:bg-stone-100/70 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePermission(perm.id)}
                          className="mt-0.5 rounded text-stone-900 focus:ring-0"
                        />
                        <div>
                          <p className="font-semibold text-stone-800 leading-tight">{perm.label}</p>
                          <span className="text-[10px] text-stone-400 uppercase font-mono">{perm.group}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-stone-900 text-white font-bold hover:bg-stone-800 transition-colors shadow-xs active:scale-95"
                >
                  {editingUser ? 'Cập Nhật Người Dùng' : 'Tạo Tài Khoản Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Permissions Details */}
      {viewingPermissionsUser && (
        <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={viewingPermissionsUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover border border-stone-200"
                />
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">{viewingPermissionsUser.fullName}</h4>
                  <p className="text-xs text-stone-500">Quyền hạn trong hệ thống CMS</p>
                </div>
              </div>
              <button
                onClick={() => setViewingPermissionsUser(null)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-xs">
                <span className="text-stone-600 font-bold">Vai trò:</span>
                <span>{getRoleBadge(viewingPermissionsUser.role)}</span>
              </div>
              <div className="flex items-center justify-between bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-xs">
                <span className="text-stone-600 font-bold">Bộ phận:</span>
                <span className="font-semibold text-stone-800">{viewingPermissionsUser.department}</span>
              </div>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              <p className="text-xs font-bold text-stone-700 mb-2">Các chức năng được cấp phép:</p>
              {viewingPermissionsUser.permissions.includes('all') ? (
                <div className="p-3 bg-purple-50 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Toàn Quyền Quản Trị Hệ Thống (Super Administrator)</span>
                </div>
              ) : (
                ALL_AVAILABLE_PERMISSIONS.map((perm) => {
                  const hasPerm = viewingPermissionsUser.permissions.includes(perm.id);
                  return (
                    <div
                      key={perm.id}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                        hasPerm
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 font-medium'
                          : 'bg-stone-50/50 border-stone-200 text-stone-400 line-through opacity-60'
                      }`}
                    >
                      <span>{perm.label}</span>
                      {hasPerm ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-stone-300 shrink-0" />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setViewingPermissionsUser(null)}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
