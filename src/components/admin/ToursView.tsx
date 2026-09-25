import React, { useState, useMemo } from 'react';
import { Tour, TourStatus, TourSchedule, Category, CategoryType } from '../../types';
import {
  Compass,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle,
  Eye,
  Calendar,
  DollarSign,
  Image as ImageIcon,
  Share2,
  X,
  PlusCircle,
  FileCheck,
  AlertTriangle,
  FolderTree,
  Tag,
  Settings,
  Sparkles,
  Check,
} from 'lucide-react';
import { ImageUploadField } from '../common/ImageUploadField';
import { MultiImageUploadField } from '../common/MultiImageUploadField';

interface ToursViewProps {
  tours: Tour[];
  categories?: Category[];
  onCreateTour: (tourData: Omit<Tour, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'bookingCount' | 'rating' | 'reviewCount'>) => void;
  onUpdateTour: (id: string, updates: Partial<Tour>) => void;
  onDeleteTour: (id: string) => void;
  onUpdateStatus: (id: string, status: TourStatus) => void;
  onCreateCategory?: (cat: Omit<Category, 'id' | 'createdAt'>) => Promise<any> | any;
  onUpdateCategory?: (id: string, updates: Partial<Category>) => Promise<any> | any;
  onDeleteCategory?: (id: string) => Promise<any> | any;
}

export const ToursView: React.FC<ToursViewProps> = ({
  tours,
  categories = [],
  onCreateTour,
  onUpdateTour,
  onDeleteTour,
  onUpdateStatus,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);

  // Category Management State
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickCategoryName, setQuickCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catModalData, setCatModalData] = useState({
    name: '',
    code: '',
    type: 'TOUR' as CategoryType,
    description: '',
  });

  // Lấy trực tiếp danh sách danh mục từ danh sách Quản Lý Danh Mục (categories)
  const availableCategories = useMemo<Category[]>(() => {
    return (categories || []).filter((c: Category) => c.isActive !== false);
  }, [categories]);

  // Danh sách tên danh mục lấy từ Quản Lý Danh Mục
  const categoryNames = useMemo<string[]>(() => {
    return availableCategories.map((c: Category) => c.name);
  }, [availableCategories]);

  const handleQuickCreateCategory = async () => {
    const trimmed = quickCategoryName.trim();
    if (!trimmed) {
      alert('Vui lòng nhập tên danh mục tour');
      return;
    }

    const autoSlug = trimmed
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const newCatData = {
      code: 'CAT-' + Date.now().toString().slice(-4),
      name: trimmed,
      slug: autoSlug,
      type: 'TOUR' as CategoryType,
      description: `Danh mục: ${trimmed}`,
      color: 'emerald',
      displayOrder: (categories?.length || 0) + 1,
      isActive: true,
      itemCount: 1,
    };

    if (onCreateCategory) {
      await onCreateCategory(newCatData);
    }
    setFormData((prev) => ({ ...prev, category: trimmed }));
    setQuickCategoryName('');
    setIsQuickAddOpen(false);
  };

  const handleOpenCatModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setCatModalData({
        name: cat.name,
        code: cat.code,
        type: cat.type,
        description: cat.description || '',
      });
    } else {
      setEditingCategory(null);
      setCatModalData({
        name: '',
        code: 'CAT-' + Date.now().toString().slice(-4),
        type: 'TOUR',
        description: '',
      });
    }
    setIsCategoryManagerOpen(true);
  };

  const handleSaveCatModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catModalData.name) {
      alert('Vui lòng nhập tên danh mục');
      return;
    }

    const autoSlug = catModalData.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (editingCategory && onUpdateCategory) {
      await onUpdateCategory(editingCategory.id, {
        ...catModalData,
        slug: autoSlug,
      });
    } else if (onCreateCategory) {
      await onCreateCategory({
        ...catModalData,
        slug: autoSlug,
        color: 'emerald',
        displayOrder: (categories?.length || 0) + 1,
        isActive: true,
        itemCount: 0,
      });
      // Also update currently open tour form category
      setFormData((prev) => ({ ...prev, category: catModalData.name }));
    }
    setEditingCategory(null);
    setCatModalData({ name: '', code: '', type: 'TOUR', description: '' });
  };

  const handleDeleteCategoryItem = async (catId: string, catName: string) => {
    const toursUsingThis = tours.filter((t) => t.category === catName).length;
    if (toursUsingThis > 0) {
      if (
        !confirm(
          `Danh mục "${catName}" đang có ${toursUsingThis} tour sử dụng. Bạn vẫn muốn xóa danh mục này khỏi hệ thống?`
        )
      ) {
        return;
      }
    } else {
      if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${catName}"?`)) {
        return;
      }
    }

    if (onDeleteCategory) {
      await onDeleteCategory(catId);
    }
  };

  // Form State
  const [activeTab, setActiveTab] = useState<'general' | 'schedule' | 'pricing' | 'media' | 'seo'>('general');
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    nameEn: '',
    description: '',
    descriptionEn: '',
    slug: '',
    category: 'Thủ công gia đình',
    thumbnail: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
    album: [
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
    ],
    videoUrl: '',
    departureLocation: 'Phố cổ Hội An',
    destinationLocation: 'Thánh địa Mỹ Sơn',
    durationDays: 1,
    durationNights: 0,
    transportation: 'Xe đưa đón / Tự túc',
    minGuests: 1,
    maxGuests: 16,
    adultPrice: 390000,
    childPrice: 390000,
    infantPrice: 0,
    status: 'PUBLISHED' as TourStatus,
    isFeatured: true,
    highlights: ['Trải nghiệm thủ công mộc mạc', 'Không gian xanh mát vườn Botanica'],
    policiesIncludes: ['Đồ uống chào mừng', 'Hướng dẫn viên nhiệt tình', 'Hộp quà mang về'],
    policiesExcludes: ['Chi phí ngoài chương trình'],
    cancellation: 'Báo trước 2 giờ nếu cần đổi lịch.',
    notes: 'Phù hợp cho mọi lứa tuổi và gia đình có trẻ nhỏ.',
    schedules: [
      {
        id: 'sch-temp-1',
        dayNumber: 1,
        title: 'Trải nghiệm workshop tại vườn (khoảng 2 giờ thong thả)',
        description: 'Tự tay làm sản phẩm thủ công, thưởng thức trà thảo mộc và trò chuyện cùng host.',
        mealsIncluded: ['Đồ uống chào mừng (Welcome Drink)'],
      },
    ] as TourSchedule[],
    seoTitle: '',
    seoDescription: '',
    seoKeywords: 'botanica garden, workshop hoi an, thu cong gia dinh',
  });

  const resetForm = () => {
    setEditingTour(null);
    setFormData({
      code: `BG-WS-0${tours.length + 1}`,
      name: '',
      nameEn: '',
      description: '',
      descriptionEn: '',
      slug: '',
      category: categories?.[0]?.name || 'Thủ công gia đình',
      thumbnail: '/images/img_3.jpeg',
      album: ['/images/img_3.jpeg'],
      videoUrl: '',
      departureLocation: '208 Lê Thánh Tông, Cẩm Châu, Hội An',
      destinationLocation: 'Botanica Garden Hội An',
      durationDays: 1,
      durationNights: 0,
      transportation: 'Tự túc hoặc xe đưa đón',
      minGuests: 1,
      maxGuests: 16,
      adultPrice: 390000,
      childPrice: 390000,
      infantPrice: 0,
      status: 'PUBLISHED',
      isFeatured: true,
      highlights: ['Tự tay sáng tạo tác phẩm mang về', 'Thảo mộc tự nhiên từ vườn Botanica'],
      policiesIncludes: ['Đồ uống chào mừng', 'Nguyên vật liệu đầy đủ', 'Hướng dẫn viên tận tình'],
      policiesExcludes: ['Chi phí cá nhân ngoài chương trình'],
      cancellation: 'Báo trước 2h nếu muốn đổi lịch.',
      notes: 'Thích hợp cho cả gia đình và trẻ nhỏ từ 2 tuổi.',
      schedules: [
        {
          id: 'sch-new-1',
          dayNumber: 1,
          title: 'Trải nghiệm workshop (khoảng 2 giờ)',
          description: 'Học cách làm sản phẩm, tìm hiểu nguyên liệu thảo mộc bản địa.',
          mealsIncluded: ['Đồ uống chào mừng'],
        },
      ],
      seoTitle: '',
      seoDescription: '',
      seoKeywords: 'workshop hoi an, botanica garden',
    });
    setActiveTab('general');
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tour: Tour) => {
    setEditingTour(tour);
    setFormData({
      code: tour.code,
      name: tour.name,
      nameEn: tour.nameEn || '',
      description: tour.description || '',
      descriptionEn: tour.descriptionEn || '',
      slug: tour.slug,
      category: tour.category,
      thumbnail: tour.thumbnail,
      album: tour.album,
      videoUrl: tour.videoUrl || '',
      departureLocation: tour.departureLocation,
      destinationLocation: tour.destinationLocation,
      durationDays: tour.durationDays,
      durationNights: tour.durationNights,
      transportation: tour.transportation,
      minGuests: tour.minGuests,
      maxGuests: tour.maxGuests,
      adultPrice: tour.pricing.adultPrice,
      childPrice: tour.pricing.childPrice,
      infantPrice: tour.pricing.infantPrice,
      status: tour.status,
      isFeatured: tour.isFeatured,
      highlights: tour.highlights,
      policiesIncludes: tour.policies.includes,
      policiesExcludes: tour.policies.excludes,
      cancellation: tour.policies.cancellation,
      notes: tour.policies.notes,
      schedules: tour.schedules,
      seoTitle: tour.seo.title,
      seoDescription: tour.seo.description,
      seoKeywords: tour.seo.keywords.join(', '),
    });
    setActiveTab('general');
    setIsModalOpen(true);
  };

  const handleSaveTour = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Vui lòng nhập tên tour!');
      return;
    }

    const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Map to workshopCat for frontend tab filtering
    let workshopCat: 'family' | 'culture' | 'wellness' = 'family';
    const catLower = formData.category.toLowerCase();
    if (
      catLower.includes('văn hóa') ||
      catLower.includes('ẩm thực') ||
      catLower.includes('culture') ||
      catLower.includes('food')
    ) {
      workshopCat = 'culture';
    } else if (
      catLower.includes('cà phê') ||
      catLower.includes('thư giãn') ||
      catLower.includes('wellness') ||
      catLower.includes('thảo mộc')
    ) {
      workshopCat = 'wellness';
    } else {
      workshopCat = 'family';
    }

    const tourPayload = {
      code: formData.code,
      name: formData.name,
      nameEn: formData.nameEn || formData.name,
      description: formData.description,
      descriptionEn: formData.descriptionEn || formData.description,
      slug,
      category: formData.category,
      workshopCat,
      thumbnail: formData.thumbnail,
      album: formData.album,
      videoUrl: formData.videoUrl,
      departureLocation: formData.departureLocation,
      destinationLocation: formData.destinationLocation,
      durationDays: formData.durationDays,
      durationNights: formData.durationNights,
      transportation: formData.transportation,
      minGuests: formData.minGuests,
      maxGuests: formData.maxGuests,
      pricing: {
        adultPrice: formData.adultPrice,
        childPrice: formData.childPrice,
        infantPrice: formData.infantPrice,
      },
      schedules: formData.schedules,
      policies: {
        includes: formData.policiesIncludes,
        excludes: formData.policiesExcludes,
        cancellation: formData.cancellation,
        notes: formData.notes,
      },
      highlights: formData.highlights,
      status: formData.status,
      isFeatured: formData.isFeatured,
      seo: {
        title: formData.seoTitle || formData.name,
        description: formData.seoDescription || formData.name,
        keywords: formData.seoKeywords.split(',').map((k) => k.trim()),
      },
    };

    if (editingTour) {
      onUpdateTour(editingTour.id, tourPayload);
    } else {
      onCreateTour(tourPayload);
    }
    setIsModalOpen(false);
  };

  // Filtered tours
  const filteredTours = tours.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchCategory = categoryFilter === 'ALL' || t.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-stone-900 font-serif tracking-tight">
            Quản lý tour du lịch
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Quản lý toàn diện lịch trình, bảng giá, media và trạng thái các tour du lịch sinh thái.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleOpenCatModal()}
            className="bg-white hover:bg-stone-50 text-stone-700 font-bold px-3.5 py-2.5 rounded-xl text-xs border border-stone-200 shadow-2xs transition-all active:scale-95 flex items-center gap-1.5"
          >
            <FolderTree className="w-4 h-4 text-emerald-700" />
                          <span>Quản lý danh mục tour ({categories?.length || 0})</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Tour Mới</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo mã tour, tên tour..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-emerald-600"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-800 bg-white"
            >
              <option value="ALL">Tất cả ({tours.length})</option>
              <option value="PUBLISHED">Công khai</option>
              <option value="PENDING_REVIEW">Chờ duyệt</option>
              <option value="DRAFT">Nháp</option>
              <option value="DISCONTINUED">Ngừng bán</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <span>Danh mục:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-800 bg-white max-w-[200px]"
            >
              <option value="ALL">Tất cả danh mục ({tours.length})</option>
              {availableCategories.map((cat: Category) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tours Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Ảnh & Mã Tour</th>
                <th className="py-3 px-4">Tên Tour Du Lịch</th>
                <th className="py-3 px-4">Danh Mục</th>
                <th className="py-3 px-4">Thời Lượng</th>
                <th className="py-3 px-4">Giá Người Lớn</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {filteredTours.map((tour) => (
                <tr key={tour.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={tour.thumbnail}
                        alt={tour.name}
                        className="w-12 h-10 rounded-lg object-cover border border-stone-200 shrink-0"
                      />
                      <span className="font-mono font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                        {tour.code}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 max-w-sm">
                    <div className="font-bold text-stone-900 line-clamp-1">{tour.name}</div>
                    <div className="text-[11px] text-stone-400 truncate">
                      {tour.departureLocation} → {tour.destinationLocation}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-stone-600 whitespace-nowrap">
                    {tour.category}
                  </td>
                  <td className="py-3 px-4 text-stone-600 whitespace-nowrap">
                    {tour.durationDays} ngày {tour.durationNights > 0 ? `${tour.durationNights} đêm` : ''}
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-900 whitespace-nowrap">
                    {tour.pricing.adultPrice.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <select
                      value={tour.status}
                      onChange={(e) => onUpdateStatus(tour.id, e.target.value as TourStatus)}
                      className={`text-[11px] font-bold px-2 py-1 rounded-full border ${
                        tour.status === 'PUBLISHED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : tour.status === 'PENDING_REVIEW'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : tour.status === 'DRAFT'
                          ? 'bg-stone-100 text-stone-700 border-stone-300'
                          : 'bg-red-50 text-red-800 border-red-300'
                      }`}
                    >
                      <option value="PUBLISHED">Công khai</option>
                      <option value="PENDING_REVIEW">Chờ duyệt</option>
                      <option value="DRAFT">Nháp</option>
                      <option value="DISCONTINUED">Ngừng bán</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(tour)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                        title="Chỉnh sửa thông tin tour"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc chắn muốn xóa tour "${tour.name}"?`)) {
                            onDeleteTour(tour.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                        title="Xóa tour"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tour Create/Edit Modal with 5 Stepper Tabs */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-stone-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div>
                <h3 className="text-lg font-black font-serif text-stone-900">
                  {editingTour ? `Chỉnh Sửa Tour: ${editingTour.name}` : 'Thêm Mới Tour Du Lịch'}
                </h3>
                <p className="text-xs text-stone-500">
                  Nhập đầy đủ thông tin để đồng bộ ra giao diện người dùng và hệ thống booking.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-2 rounded-full hover:bg-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Tabs Bar */}
            <div className="flex border-b border-stone-200 bg-white px-4 text-xs font-bold overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'general'
                    ? 'border-emerald-700 text-emerald-800'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                1. Thông Tin Chung
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('schedule')}
                className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'schedule'
                    ? 'border-emerald-700 text-emerald-800'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                2. Lịch Trình Từng Ngày ({formData.schedules.length} ngày)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pricing')}
                className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'pricing'
                    ? 'border-emerald-700 text-emerald-800'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                3. Bảng Giá & Chính Sách
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('media')}
                className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'media'
                    ? 'border-emerald-700 text-emerald-800'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                4. Hình Ảnh & Media
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('seo')}
                className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'seo'
                    ? 'border-emerald-700 text-emerald-800'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                5. Cấu Hình SEO & Meta
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSaveTour} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* TAB 1: General Info */}
              {activeTab === 'general' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Mã Tour / Lớp *</label>
                      <input
                        type="text"
                        required
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Tên Tiếng Việt *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="VD: Làm Nến Thơm & Trà Thảo Mộc..."
                        className="w-full p-2.5 rounded-xl border border-stone-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Tên Tiếng Anh (English Name)</label>
                      <input
                        type="text"
                        value={formData.nameEn}
                        onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                        placeholder="Ex: Botanical Candle & Herbal Tea..."
                        className="w-full p-2.5 rounded-xl border border-stone-200 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Mô tả ngắn (Tiếng Việt)</label>
                      <textarea
                        rows={2}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Dành hai giờ thong thả tự tay làm nên một món quà thảo mộc..."
                        className="w-full p-2.5 rounded-xl border border-stone-200 text-xs resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Mô tả ngắn Tiếng Anh (English Description)</label>
                      <textarea
                        rows={2}
                        value={formData.descriptionEn}
                        onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                        placeholder="Spend two unhurried hours making something botanical by hand..."
                        className="w-full p-2.5 rounded-xl border border-stone-200 text-xs resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-stone-700">
                          Danh Mục Tour <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>{isQuickAddOpen ? 'Đóng tạo nhanh' : '+ Thêm mới'}</span>
                          </button>
                          <span className="text-stone-300 text-xs">|</span>
                          <button
                            type="button"
                            onClick={() => handleOpenCatModal()}
                            className="text-[11px] font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-0.5 hover:underline"
                          >
                            <Settings className="w-3 h-3 text-stone-500" />
                            <span>Quản lý</span>
                          </button>
                        </div>
                      </div>

                      {/* Inline Quick Category Add Form */}
                      {isQuickAddOpen && (
                        <div className="mb-2 p-3 bg-emerald-50/90 border border-emerald-300 rounded-xl space-y-2 animate-in fade-in duration-150">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-emerald-700" />
                              Tạo nhanh danh mục tour mới:
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={quickCategoryName}
                              onChange={(e) => setQuickCategoryName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleQuickCreateCategory();
                                }
                              }}
                              placeholder="Nhập tên danh mục (VD: Tour Thuyền Thúng, Trekking...)"
                              className="flex-1 px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-600"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={handleQuickCreateCategory}
                              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shrink-0 transition-colors shadow-2xs active:scale-95"
                            >
                              Tạo & Chọn ngay
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5">
                        <select
                          value={formData.category}
                          onChange={(e) => {
                            if (e.target.value === '__ADD_NEW__') {
                              setIsQuickAddOpen(true);
                            } else {
                              setFormData({ ...formData, category: e.target.value });
                            }
                          }}
                          className="w-full p-2.5 rounded-xl border border-stone-200 text-xs bg-white font-medium focus:border-emerald-600 outline-none"
                        >
                          {availableCategories.length > 0 ? (
                            availableCategories.map((cat: Category) => (
                              <option key={cat.id} value={cat.name}>
                                {cat.name}
                              </option>
                            ))
                          ) : (
                            <option value="Thủ công gia đình">Thủ công gia đình</option>
                          )}
                          {formData.category && !availableCategories.some((c: Category) => c.name === formData.category) && (
                            <option value={formData.category}>{formData.category} (Hiện tại)</option>
                          )}
                          <option value="__ADD_NEW__" className="text-emerald-700 font-bold">
                            + Thêm danh mục mới trong Quản lý danh mục...
                          </option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleOpenCatModal()}
                          title="Mở bảng quản lý danh mục"
                          className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600 shrink-0"
                        >
                          <FolderTree className="w-4 h-4 text-emerald-700" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Phương Tiện Di Chuyển</label>
                      <input
                        type="text"
                        value={formData.transportation}
                        onChange={(e) => setFormData({ ...formData, transportation: e.target.value })}
                        placeholder="Xe Jeep quân sự / Xe đạp tre / Thuyền thúng..."
                        className="w-full p-2.5 rounded-xl border border-stone-200 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Số Ngày</label>
                      <input
                        type="number"
                        min={1}
                        value={formData.durationDays}
                        onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-stone-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Số Đêm</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.durationNights}
                        onChange={(e) => setFormData({ ...formData, durationNights: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-stone-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Số khách tối thiểu</label>
                      <input
                        type="number"
                        min={1}
                        value={formData.minGuests}
                        onChange={(e) => setFormData({ ...formData, minGuests: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-stone-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Số khách tối đa</label>
                      <input
                        type="number"
                        min={1}
                        value={formData.maxGuests}
                        onChange={(e) => setFormData({ ...formData, maxGuests: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-stone-200 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Điểm Khởi Hành</label>
                      <input
                        type="text"
                        value={formData.departureLocation}
                        onChange={(e) => setFormData({ ...formData, departureLocation: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-stone-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Điểm Đến</label>
                      <input
                        type="text"
                        value={formData.destinationLocation}
                        onChange={(e) => setFormData({ ...formData, destinationLocation: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-stone-200 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Trạng Thái Xuất Bản</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as TourStatus })}
                        className="w-full p-2.5 rounded-xl border border-stone-200 text-xs bg-white font-bold text-emerald-800"
                      >
                        <option value="PUBLISHED">Công khai (Hiển thị ngay trên website)</option>
                        <option value="PENDING_REVIEW">Chờ duyệt nội bộ</option>
                        <option value="DRAFT">Lưu bản nháp</option>
                        <option value="DISCONTINUED">Tạm ngừng nhận khách</option>
                      </select>
                    </div>

                    <div className="flex items-center pt-6">
                      <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isFeatured}
                          onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        />
                        <span>Đánh dấu là Tour Nổi Bật Trang Chủ</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Schedule Timeline */}
              {activeTab === 'schedule' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <span className="text-xs font-bold text-stone-700">Lịch Trình Từng Ngày</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newDayNum = formData.schedules.length + 1;
                        setFormData({
                          ...formData,
                          schedules: [
                            ...formData.schedules,
                            {
                              id: 'sch-' + Date.now(),
                              dayNumber: newDayNum,
                              title: `Ngày ${newDayNum}: Hoạt động trải nghiệm`,
                              description: 'Chi tiết các hoạt động trong ngày...',
                              mealsIncluded: ['Ăn sáng', 'Ăn trưa'],
                            },
                          ],
                        });
                      }}
                      className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Thêm Ngày Tiếp Theo</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.schedules.map((sch, idx) => (
                      <div key={sch.id || idx} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                            Ngày {sch.dayNumber}
                          </span>
                          {formData.schedules.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  schedules: formData.schedules.filter((_, i) => i !== idx),
                                });
                              }}
                              className="text-red-500 hover:text-red-700 text-xs font-semibold"
                            >
                              Xóa ngày này
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 mb-1">Tiêu Đề Ngày</label>
                          <input
                            type="text"
                            value={sch.title}
                            onChange={(e) => {
                              const updated = [...formData.schedules];
                              updated[idx].title = e.target.value;
                              setFormData({ ...formData, schedules: updated });
                            }}
                            className="w-full p-2 rounded-lg border border-stone-200 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 mb-1">Mô Tả Hoạt Động Chi Tiết</label>
                          <textarea
                            rows={3}
                            value={sch.description}
                            onChange={(e) => {
                              const updated = [...formData.schedules];
                              updated[idx].description = e.target.value;
                              setFormData({ ...formData, schedules: updated });
                            }}
                            className="w-full p-2 rounded-lg border border-stone-200 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 mb-1">Bữa Ăn Bao Gồm (ngăn cách bằng dấu phẩy)</label>
                          <input
                            type="text"
                            value={sch.mealsIncluded.join(', ')}
                            onChange={(e) => {
                              const updated = [...formData.schedules];
                              updated[idx].mealsIncluded = e.target.value.split(',').map((m) => m.trim());
                              setFormData({ ...formData, schedules: updated });
                            }}
                            className="w-full p-2 rounded-lg border border-stone-200 text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: Pricing & Policies */}
              {activeTab === 'pricing' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Giá Người Lớn (VNĐ) *</label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={formData.adultPrice}
                        onChange={(e) => setFormData({ ...formData, adultPrice: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-bold text-emerald-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Giá Trẻ Em 5-11t (VNĐ)</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.childPrice}
                        onChange={(e) => setFormData({ ...formData, childPrice: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-stone-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Em bé dưới 5t (VNĐ)</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.infantPrice}
                        onChange={(e) => setFormData({ ...formData, infantPrice: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-stone-200 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Bao Gồm (Mỗi dòng một mục)</label>
                    <textarea
                      rows={3}
                      value={formData.policiesIncludes.join('\n')}
                      onChange={(e) => setFormData({ ...formData, policiesIncludes: e.target.value.split('\n').filter(Boolean) })}
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Không Bao Gồm (Mỗi dòng một mục)</label>
                    <textarea
                      rows={2}
                      value={formData.policiesExcludes.join('\n')}
                      onChange={(e) => setFormData({ ...formData, policiesExcludes: e.target.value.split('\n').filter(Boolean) })}
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Chính Sách Hoàn Hủy</label>
                    <input
                      type="text"
                      value={formData.cancellation}
                      onChange={(e) => setFormData({ ...formData, cancellation: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: Media */}
              {activeTab === 'media' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* Upload Ảnh Đại Diện Workshop Trực Tiếp */}
                  <ImageUploadField
                    label="Ảnh Đại Diện Workshop (Thumbnail)"
                    value={formData.thumbnail}
                    onChange={(url) => setFormData({ ...formData, thumbnail: url })}
                    folder="TOURS"
                    recommendedSize="1200x800px (Tỉ lệ 3:2 hoặc 16:9)"
                    required
                  />

                  {/* Upload Nhiều Ảnh Cho Album Workshop */}
                  <MultiImageUploadField
                    label="Album Ảnh Trải Nghiệm Workshop"
                    images={formData.album}
                    onChange={(album) => setFormData({ ...formData, album })}
                    folder="TOURS"
                    recommendedSize="1200x800px"
                    maxImages={12}
                  />

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Link Video Giới Thiệu (Youtube/Vimeo)</label>
                    <input
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      placeholder="https://youtube.com/..."
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: SEO */}
              {activeTab === 'seo' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">SEO Title (Tiêu Đề Tìm Kiếm)</label>
                    <input
                      type="text"
                      value={formData.seoTitle}
                      onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                      placeholder="Jeep Tour Hội An - Emic Travel..."
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">SEO Meta Description</label>
                    <textarea
                      rows={3}
                      value={formData.seoDescription}
                      onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                      placeholder="Mô tả tóm tắt cho Google Search..."
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Từ Khóa SEO (Keywords)</label>
                    <input
                      type="text"
                      value={formData.seoKeywords}
                      onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Hủy Bỏ
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95"
                  >
                    {editingTour ? 'Lưu Thay Đổi' : 'Tạo Tour Mới'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MANAGEMENT MODAL */}
      {isCategoryManagerOpen && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                  <FolderTree className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 font-serif">
                    Quản lý danh mục tour và workshop
                  </h3>
                  <p className="text-xs text-stone-500">
                    Tạo mới, chỉnh sửa và quản lý các nhóm tour phục vụ phân loại và bộ lọc.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCategoryManagerOpen(false);
                  setEditingCategory(null);
                }}
                className="w-8 h-8 rounded-full hover:bg-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Form Create / Edit Category */}
              <form
                onSubmit={handleSaveCatModal}
                className="bg-stone-50 border border-stone-200 p-4 rounded-2xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}</span>
                  </h4>
                  {editingCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(null);
                        setCatModalData({ name: '', code: 'CAT-' + Date.now().toString().slice(-4), type: 'TOUR', description: '' });
                      }}
                      className="text-[11px] font-semibold text-stone-500 hover:text-stone-800 underline"
                    >
                      Hủy chế độ sửa
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Tên Danh Mục <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={catModalData.name}
                      onChange={(e) => setCatModalData({ ...catModalData, name: e.target.value })}
                      placeholder="VD: Tour Trekking Rừng Dừa, Workshop Làm Nến..."
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs bg-white focus:outline-emerald-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Phân Loại
                    </label>
                    <select
                      value={catModalData.type}
                      onChange={(e) => setCatModalData({ ...catModalData, type: e.target.value as 'TOUR' | 'WORKSHOP' })}
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs bg-white font-medium focus:outline-emerald-600"
                    >
                      <option value="TOUR">Tour Du Lịch</option>
                      <option value="WORKSHOP">Workshop & Trải Nghiệm</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Mô Tả Danh Mục</label>
                  <input
                    type="text"
                    value={catModalData.description}
                    onChange={(e) => setCatModalData({ ...catModalData, description: e.target.value })}
                    placeholder="Mô tả tóm tắt ý nghĩa hoặc tiêu chí của danh mục này..."
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs bg-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-2xs transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{editingCategory ? 'Lưu Thay Đổi' : 'Tạo Danh Mục'}</span>
                  </button>
                </div>
              </form>

              {/* Existing Categories List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Danh Sách Danh Mục Tour ({categories?.length || 0})
                  </h4>
                  <span className="text-[11px] text-stone-400">
                    Lấy trực tiếp từ Danh Sách Danh Mục hệ thống
                  </span>
                </div>

                <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Tên Danh Mục</th>
                        <th className="py-2.5 px-3">Mã</th>
                        <th className="py-2.5 px-3">Phân Loại</th>
                        <th className="py-2.5 px-3 text-center">Số Tour Dùng</th>
                        <th className="py-2.5 px-3 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {(categories || []).map((cat: Category) => {
                        const tourCount = tours.filter((t) => t.category === cat.name).length;
                        const isCurrentFormCat = formData.category === cat.name;

                        return (
                          <tr
                            key={cat.id}
                            className={`hover:bg-stone-50/80 transition-colors ${
                              isCurrentFormCat ? 'bg-emerald-50/40' : ''
                            }`}
                          >
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-stone-900">{cat.name}</span>
                                {isCurrentFormCat && (
                                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">
                                    Đang chọn
                                  </span>
                                )}
                              </div>
                              {cat.description && (
                                <p className="text-[11px] text-stone-400 truncate max-w-[280px]">
                                  {cat.description}
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-mono text-stone-500 text-[11px]">{cat.code}</span>
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  cat.type === 'WORKSHOP'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {cat.type === 'WORKSHOP' ? 'Workshop' : 'Tour Du Lịch'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-lg text-[11px]">
                                {tourCount} tour
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData((prev) => ({ ...prev, category: cat.name }));
                                    setIsCategoryManagerOpen(false);
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-bold bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 rounded-lg transition-colors"
                                  title="Chọn danh mục này cho tour đang tạo/sửa"
                                >
                                  Chọn
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenCatModal(cat)}
                                  className="p-1 text-stone-400 hover:text-stone-700 rounded-md transition-colors"
                                  title="Sửa tên danh mục"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCategoryItem(cat.id, cat.name)}
                                  className="p-1 text-stone-400 hover:text-red-600 rounded-md transition-colors"
                                  title="Xóa danh mục"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
              <span className="text-xs text-stone-500">
                Tất cả thay đổi danh mục được áp dụng tự động cho danh sách tour và các bộ lọc ngoài trang chủ.
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsCategoryManagerOpen(false);
                  setEditingCategory(null);
                }}
                className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
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
