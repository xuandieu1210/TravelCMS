import React, { useState } from 'react';
import { Category, CategoryType } from '../../types';
import {
  FolderTree,
  Plus,
  Search,
  Filter,
  Layers,
  Sparkles,
  Compass,
  Briefcase,
  BookOpen,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  ExternalLink,
  Tag,
  Hash,
  ArrowUpDown,
} from 'lucide-react';

interface CategoriesViewProps {
  categories: Category[];
  onCreateCategory: (cat: Omit<Category, 'id' | 'createdAt'>) => void;
  onUpdateCategory: (id: string, updates: Partial<Category>) => void;
  onDeleteCategory: (id: string) => void;
  onToggleStatus: (id: string, active: boolean) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onToggleStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'ALL' | CategoryType>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    nameEn: '',
    slug: '',
    type: 'WORKSHOP' as CategoryType,
    description: '',
    image: '',
    color: 'emerald',
    displayOrder: 1,
    isActive: true,
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      code: 'CAT-' + Date.now().toString().slice(-4),
      name: '',
      nameEn: '',
      slug: '',
      type: selectedType === 'ALL' ? 'WORKSHOP' : selectedType,
      description: '',
      image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
      color: 'emerald',
      displayOrder: categories.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      code: cat.code,
      name: cat.name,
      nameEn: cat.nameEn || '',
      slug: cat.slug,
      type: cat.type,
      description: cat.description,
      image: cat.image || '',
      color: cat.color || 'emerald',
      displayOrder: cat.displayOrder,
      isActive: cat.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      alert('Vui lòng nhập Mã danh mục và Tên danh mục');
      return;
    }

    const autoSlug =
      formData.slug ||
      formData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    if (editingCategory) {
      onUpdateCategory(editingCategory.id, {
        ...formData,
        slug: autoSlug,
      });
    } else {
      onCreateCategory({
        ...formData,
        slug: autoSlug,
        itemCount: 0,
      });
    }
    setIsModalOpen(false);
  };

  const filteredCategories = categories.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.nameEn && c.nameEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchTerm.toLowerCase());

    return matchSearch;
  });

  const getTypeBadge = (type: CategoryType) => {
    switch (type) {
      case 'WORKSHOP':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Sparkles className="w-3 h-3 text-amber-600" /> Workshop & Lớp Học
          </span>
        );
      case 'TOUR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Compass className="w-3 h-3 text-blue-600" /> Tour Du Lịch
          </span>
        );
      case 'SERVICE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <Briefcase className="w-3 h-3 text-purple-600" /> Dịch Vụ Du Lịch
          </span>
        );
      case 'POST':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <BookOpen className="w-3 h-3 text-emerald-600" /> Tin Tức & Blog
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar & Actions */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm tên danh mục..."
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-stone-400"
          />
        </div>

        <button
          onClick={openCreateModal}
          className="bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-all active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Danh Mục</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 w-16 text-center">Thứ tự</th>
                <th className="py-3.5 px-4">Danh Mục</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-400">
                    Không tìm thấy danh mục nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-stone-50/50 transition-colors">
                    {/* Display order */}
                    <td className="py-3.5 px-4 text-center font-bold text-stone-400">
                      #{cat.displayOrder}
                    </td>

                    {/* Category name & thumb */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt=""
                            className="w-11 h-11 rounded-xl object-cover border border-stone-200 shadow-2xs shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-500 shrink-0">
                            <Tag className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-stone-900 text-sm">{cat.name}</p>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded">
                              {cat.code}
                            </span>
                          </div>
                          {cat.nameEn && (
                            <p className="text-xs text-stone-500 font-medium italic">{cat.nameEn}</p>
                          )}
                          <p className="text-[11px] text-stone-400 line-clamp-1 max-w-sm mt-0.5">
                            {cat.description}
                          </p>
                        </div>
                      </div>
                    </td>



                    {/* Active toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => onToggleStatus(cat.id, !cat.isActive)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          cat.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-stone-100 text-stone-500 border border-stone-200 hover:bg-stone-200'
                        }`}
                      >
                        {cat.isActive ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Hiển thị</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Tạm ẩn</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(cat)}
                          title="Sửa danh mục"
                          className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc chắn muốn xóa danh mục "${cat.name}" không?`)) {
                              onDeleteCategory(cat.id);
                            }
                          }}
                          title="Xóa danh mục"
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-stone-900 text-white">
                  <FolderTree className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">
                    {editingCategory ? `Chỉnh Sửa Danh Mục: ${editingCategory.name}` : 'Thêm Danh Mục Mới'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Phân loại cho Tour, Workshop, Dịch vụ hoặc Bài viết
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
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Mã Danh Mục (Code) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="ví dụ: CAT-FAMILY"
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-stone-900 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Tên Danh Mục (Tiếng Việt) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ví dụ: Thủ Công & Trải Nghiệm Gia Đình"
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-stone-900 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Tên Tiếng Anh (English Name)
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="ví dụ: Family Crafts & Eco Farm"
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-stone-900 outline-none"
                />
              </div>



              <div>
                <label className="block font-bold text-stone-700 mb-1">Mô Tả Danh Mục</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả tóm tắt nội dung của danh mục..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-stone-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">URL Ảnh Đại Diện</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-stone-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Thứ Tự Hiển Thị</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-stone-900 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="category-active-chk"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-stone-900 focus:ring-0"
                />
                <label htmlFor="category-active-chk" className="font-semibold text-stone-700 cursor-pointer">
                  Kích hoạt hiển thị danh mục này trên Website công khai
                </label>
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
                  {editingCategory ? 'Cập Nhật Danh Mục' : 'Tạo Danh Mục Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
