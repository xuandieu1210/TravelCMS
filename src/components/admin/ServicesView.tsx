import React, { useState } from 'react';
import { ServiceItem, ServiceType } from '../../types';
import { Plus, Edit2, Trash2, CheckCircle2, Car, Ticket, Utensils, Sparkles, X, MapPin, DollarSign } from 'lucide-react';

interface ServicesViewProps {
  services: ServiceItem[];
  onCreateService: (data: Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateService: (id: string, updates: Partial<ServiceItem>) => void;
  onDeleteService: (id: string) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  services,
  onCreateService,
  onUpdateService,
  onDeleteService,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    slug: '',
    type: 'VEHICLE' as ServiceType,
    thumbnail: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    price: 1500000,
    unit: 'chuyến 4 tiếng',
    location: 'Hội An',
    description: '',
    highlights: ['Bảo dưỡng định kỳ an toàn', 'Tài xế bản địa tận tâm'],
    isActive: true,
  });

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData({
      code: `SRV-ECO-0${services.length + 1}`,
      name: '',
      slug: '',
      type: 'VEHICLE',
      thumbnail: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
      price: 1500000,
      unit: 'chuyến',
      location: 'Hội An',
      description: '',
      highlights: ['Tiêu chuẩn sinh thái', 'Chất lượng cao'],
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (srv: ServiceItem) => {
    setEditingService(srv);
    setFormData({
      code: srv.code,
      name: srv.name,
      slug: srv.slug,
      type: srv.type,
      thumbnail: srv.thumbnail,
      price: srv.price,
      unit: srv.unit,
      location: srv.location,
      description: srv.description,
      highlights: srv.highlights,
      isActive: srv.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const payload = {
      code: formData.code,
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      type: formData.type,
      thumbnail: formData.thumbnail,
      album: [],
      price: formData.price,
      unit: formData.unit,
      location: formData.location,
      description: formData.description,
      highlights: formData.highlights,
      isActive: formData.isActive,
    };

    if (editingService) {
      onUpdateService(editingService.id, payload);
    } else {
      onCreateService(payload);
    }
    setIsModalOpen(false);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'VEHICLE':
        return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">Xe / Vận chuyển</span>;
      case 'TICKET':
        return <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">Vé tham quan</span>;
      case 'RESTAURANT':
        return <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-[10px] font-bold">Nhà hàng / Ẩm thực</span>;
      case 'ECO_WORKSHOP':
        return <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded text-[10px] font-bold">Workshop Sinh thái</span>;
      default:
        return <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded text-[10px] font-bold">{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-stone-900 font-serif tracking-tight">
            Quản lý dịch vụ du lịch
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Quản lý các dịch vụ lẻ: Xe Jeep cổ, thuyền thúng rừng dừa, tiệc ẩm thực sinh thái và workshop.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Dịch Vụ Mới</span>
        </button>
      </div>

      {/* Grid of Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((srv) => (
          <div
            key={srv.id}
            className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 overflow-hidden">
                <img src={srv.thumbnail} alt={srv.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3">{getTypeBadge(srv.type)}</div>
                <div className="absolute top-3 right-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      srv.isActive ? 'bg-emerald-600 text-white' : 'bg-stone-500 text-white'
                    }`}
                  >
                    {srv.isActive ? 'Đang hoạt động' : 'Tạm ẩn'}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                  <span className="font-mono font-bold text-stone-600">{srv.code}</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {srv.location}
                  </span>
                </div>

                <h3 className="text-base font-bold text-stone-900 mb-2 leading-snug">
                  {srv.name}
                </h3>

                <p className="text-xs text-stone-600 line-clamp-2 mb-4 leading-relaxed">
                  {srv.description}
                </p>

                <div className="pt-3 border-t border-stone-100 flex items-baseline justify-between">
                  <span className="text-xs text-stone-400 font-medium">Đơn giá niêm yết:</span>
                  <div className="text-base font-black text-emerald-800">
                    {srv.price.toLocaleString('vi-VN')} đ <span className="text-xs font-normal text-stone-500">/{srv.unit}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
              <button
                onClick={() => onUpdateService(srv.id, { isActive: !srv.isActive })}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                  srv.isActive ? 'text-stone-500 hover:text-stone-800' : 'text-emerald-700 bg-emerald-50'
                }`}
              >
                {srv.isActive ? 'Ẩn dịch vụ' : 'Hiển thị'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(srv)}
                  className="p-1.5 rounded-lg text-stone-600 hover:text-amber-700 hover:bg-amber-50"
                  title="Sửa dịch vụ"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Xóa dịch vụ "${srv.name}"?`)) onDeleteService(srv.id);
                  }}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-red-700 hover:bg-red-50"
                  title="Xóa dịch vụ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add/Edit Service */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <h3 className="text-base font-bold text-stone-900">
                {editingService ? 'Chỉnh Sửa Dịch Vụ' : 'Thêm Mới Dịch Vụ Du Lịch'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Mã Dịch Vụ *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Loại Dịch Vụ</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ServiceType })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="VEHICLE">Xe đưa đón / Xe Jeep</option>
                    <option value="TICKET">Vé tham quan / Thuyền thúng</option>
                    <option value="RESTAURANT">Nhà hàng ẩm thực</option>
                    <option value="ECO_WORKSHOP">Workshop Sinh thái</option>
                    <option value="HOTEL">Khách sạn lưu trú</option>
                    <option value="COMBO">Combo trọn gói</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Tên Dịch Vụ *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Thuê xe Jeep cổ khám phá Hội An..."
                  className="w-full p-2.5 rounded-xl border border-stone-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Đơn Giá (VNĐ) *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 font-bold text-emerald-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Đơn Vị Tính</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="chuyến, người, thuyền..."
                    className="w-full p-2.5 rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Địa Điểm Phục Vụ</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Link Ảnh Đại Diện</label>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Mô Tả Dịch Vụ</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200"
                />
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl"
                >
                  Lưu Dịch Vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
