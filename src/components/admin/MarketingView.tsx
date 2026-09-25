import React, { useState, useMemo } from 'react';
import { MarketingCampaign } from '../../types';
import {
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Facebook,
  MessageCircle,
  Search,
  Video,
  ExternalLink,
  Calendar,
  X,
  Play,
  Pause,
  Clock,
  Filter,
  DollarSign,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { ImageUploadField } from '../common/ImageUploadField';

interface MarketingViewProps {
  campaigns: MarketingCampaign[];
  onCreateCampaign: (campaign: Omit<MarketingCampaign, 'id' | 'createdAt'>) => void;
  onUpdateCampaign: (id: string, updates: Partial<MarketingCampaign>) => void;
  onDeleteCampaign: (id: string) => void;
}

export const MarketingView: React.FC<MarketingViewProps> = ({
  campaigns,
  onCreateCampaign,
  onUpdateCampaign,
  onDeleteCampaign,
}) => {
  // Tabs & Filters
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PLANNING' | 'PAUSED' | 'ENDED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChannelTab, setActiveChannelTab] = useState<'facebook' | 'zalo' | 'google' | 'tiktok'>('facebook');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<MarketingCampaign | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [previewCampaign, setPreviewCampaign] = useState<MarketingCampaign | null>(null);

  // Form Tab State
  const [formActiveTab, setFormActiveTab] = useState<'basic' | 'facebook' | 'zalo' | 'google' | 'tiktok'>('basic');

  // Form State
  const initialFormData: Omit<MarketingCampaign, 'id' | 'createdAt'> = {
    name: '',
    code: '',
    description: '',
    bannerImage: '',
    landingPageUrl: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 10000000,
    status: 'ACTIVE',
    createdBy: 'Ban Quản Trị Marketing',
    channels: {
      facebook: {
        postTitle: '',
        content: '',
        imageUrl: '',
        hashtags: ['#BotanicaGarden', '#HoiAnEcoTour', '#DuLichBenVung'],
        targetAudience: 'Gia đình & Du khách yêu thiên nhiên, thủ công truyền thống',
      },
      zaloOa: {
        templateName: 'Thông báo ưu đãi trải nghiệm mới',
        messageHeader: 'Kính gửi Quý khách thân thiết của Botanica Garden',
        messageBody: 'Nhận ngay ưu đãi 10% khi đăng ký workshop trải nghiệm gia đình trong tháng này.',
        ctaText: 'ĐẶT WORKSHOP NGAY',
      },
      googleAds: {
        campaignName: 'Search_Botanica_HoiAn_Workshop',
        keywords: ['workshop hoi an', 'botanica garden hoi an', 'lam nen hoi an', 'trai nghiem hoi an'],
        headline1: 'Botanica Garden Hội An - Workshop Sinh Thái',
        headline2: 'Trải Nghiệm Thủ Công Bản Địa Độc Đáo',
        description: 'Tự tay làm nến thơm, tranh sỏi, cà phê muối và tìm hiểu ẩm thực truyền thống giữa khu vườn xanh mát.',
      },
      tiktok: {
        videoTopic: '1 ngày trải nghiệm yên bình tại vườn Botanica Garden Hội An',
        scriptSummary: 'POV góc nhìn thứ nhất: Dạo bước qua vườn thảo mộc, tự tay làm nến thơm và thưởng thức ly cà phê muối Hội An mát lạnh.',
        soundTrack: 'Nhạc Acoustic Hội An lofi chill',
        hashtags: ['#botanicagarden', '#hoian', '#workshophoian', '#dulichvietnam'],
      },
    },
  };

  const [formData, setFormData] = useState(initialFormData);

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingCampaign(null);
    setFormData({
      ...initialFormData,
      code: `CAMP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    });
    setFormActiveTab('basic');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (camp: MarketingCampaign) => {
    setEditingCampaign(camp);
    setFormData({
      name: camp.name,
      code: camp.code,
      description: camp.description,
      bannerImage: camp.bannerImage,
      landingPageUrl: camp.landingPageUrl,
      startDate: camp.startDate,
      endDate: camp.endDate,
      budget: camp.budget,
      status: camp.status,
      createdBy: camp.createdBy || 'Ban Quản Trị Marketing',
      channels: {
        facebook: {
          postTitle: camp.channels?.facebook?.postTitle || '',
          content: camp.channels?.facebook?.content || '',
          imageUrl: camp.channels?.facebook?.imageUrl || '',
          hashtags: camp.channels?.facebook?.hashtags || ['#BotanicaGarden'],
          targetAudience: camp.channels?.facebook?.targetAudience || '',
        },
        zaloOa: {
          templateName: camp.channels?.zaloOa?.templateName || '',
          messageHeader: camp.channels?.zaloOa?.messageHeader || '',
          messageBody: camp.channels?.zaloOa?.messageBody || '',
          ctaText: camp.channels?.zaloOa?.ctaText || 'XEM CHI TIẾT',
        },
        googleAds: {
          campaignName: camp.channels?.googleAds?.campaignName || '',
          keywords: camp.channels?.googleAds?.keywords || [],
          headline1: camp.channels?.googleAds?.headline1 || '',
          headline2: camp.channels?.googleAds?.headline2 || '',
          description: camp.channels?.googleAds?.description || '',
        },
        tiktok: {
          videoTopic: camp.channels?.tiktok?.videoTopic || '',
          scriptSummary: camp.channels?.tiktok?.scriptSummary || '',
          soundTrack: camp.channels?.tiktok?.soundTrack || '',
          hashtags: camp.channels?.tiktok?.hashtags || [],
        },
      },
    });
    setFormActiveTab('basic');
    setIsModalOpen(true);
  };

  // Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      alert('Vui lòng nhập Tên chiến dịch và Mã chiến dịch!');
      return;
    }

    if (editingCampaign) {
      onUpdateCampaign(editingCampaign.id, formData);
    } else {
      onCreateCampaign(formData);
    }
    setIsModalOpen(false);
  };

  // Quick toggle campaign status
  const handleToggleStatus = (camp: MarketingCampaign) => {
    const newStatus: MarketingCampaign['status'] =
      camp.status === 'ACTIVE' ? 'PAUSED' : camp.status === 'PAUSED' ? 'ACTIVE' : 'ACTIVE';
    onUpdateCampaign(camp.id, { status: newStatus });
  };

  // Confirm delete
  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      onDeleteCampaign(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchSearch =
        searchQuery === '' ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [campaigns, statusFilter, searchQuery]);

  // Status statistics
  const stats = useMemo(() => {
    const total = campaigns.length;
    const active = campaigns.filter((c) => c.status === 'ACTIVE').length;
    const planning = campaigns.filter((c) => c.status === 'PLANNING').length;
    const paused = campaigns.filter((c) => c.status === 'PAUSED').length;
    const totalBudget = campaigns.reduce((sum, c) => sum + (Number(c.budget) || 0), 0);
    return { total, active, planning, paused, totalBudget };
  }, [campaigns]);

  // Standard Copywriting Hub
  const channelTemplates = {
    facebook: [
      {
        id: 'fb-1',
        title: 'Bài Viết Facebook: Workshop Gia Đình & Trẻ Em Cuối Tuần',
        content: `🌿 CUỐI TUẦN NÀY, CẢ NHÀ MÌNH ĐI ĐÂU?
CÙNG VỀ VƯỜN BOTANICA GARDEN HỘI AN LÀM NẾN THƠM & VẼ TRANH SỎI! 🕯️🎨

Bạn đang tìm kiếm một không gian thanh bình, không khói bụi và tràn ngập cây cỏ để con trẻ được thỏa sức sáng tạo?
Tại Botanica Garden Hội An, bạn sẽ được:
✅ Tự tay chọn nguyên liệu sáp đậu nành & thảo mộc vườn nhà để đổ những cốc nến thơm tinh khiết
✅ Học cách xếp sỏi cuội tự nhiên thành những bức tranh nghệ thuật độc bản mang về lưu niệm
✅ Thưởng thức trà hoa thảo mộc tự hái thơm mát và ngắm nhìn khu vườn yên ả
✅ Hoàn toàn không rác thải nhựa - thân thiện môi trường

👉 Đặt lịch trải nghiệm ngay hôm nay để nhận ưu đãi nhóm gia đình!
📍 Địa chỉ: 208 Lê Thánh Tông, Cẩm Châu, Hội An
Hotline: 0905 982 919 | Website: https://emictravel.aikpt.vn
#BotanicaGarden #HoiAnEcoTour #WorkshopHoiAn #FamilyTime #SustainableTourism`,
      },
      {
        id: 'fb-2',
        title: 'Bài Viết Facebook: Nghệ Thuật Pha Chế Cà Phê Muối & Trứng',
        content: `☕ CHẠM VÀO HƯƠNG VỊ HỘI AN: WORKSHOP PHA CHẾ CÀ PHÊ MUỐI TRUYỀN THỐNG

Bạn yêu thích vị béo ngậy của lớp kem muối hòa quyện cùng hạt cà phê Robusta rang mộc đậm đà?
Hãy tham gia ngay buổi workshop pha chế độc quyền tại Botanica Garden:
✨ Tự tay cân chỉnh tỉ lệ mộc, muối hầm và sữa đặc chuẩn phong vị miền Trung
✨ Học kỹ thuật đánh bông kem mịn như mây mà không bị ngấy
✨ Tự thưởng cho mình một ly cà phê tự tay làm trong không gian vườn hoa thơm ngát

Đăng ký trải nghiệm tại: https://emictravel.aikpt.vn
#CoffeeWorkshop #BotanicaGarden #HoiAnCoffee #SaltCoffee`,
      },
    ],
    zalo: [
      {
        id: 'zalo-1',
        title: 'Tin Nhắn Zalo OA: Chăm Sóc Khách Hàng Sau Trải Nghiệm & Tặng Ưu Đãi',
        content: `Kính chào Quý khách! 🌿

Botanica Garden Hội An chân thành cảm ơn Quý khách và gia đình đã dành thời gian ghé thăm khu vườn và tham gia trải nghiệm workshop vừa qua.
Những nụ cười và tác phẩm sáng tạo của Quý khách chính là nguồn động lực to lớn giúp khu vườn ngày một xanh tươi hơn.

🎁 Botanica Garden xin gửi tặng Quý khách mã ưu đãi [BOTANICA2026] giảm 15% cho bất kỳ workshop trải nghiệm tiếp theo hoặc ưu đãi khi giới thiệu bạn bè.

Chúc Quý khách luôn ngập tràn niềm vui và bình yên!
Hotline/Zalo hỗ trợ: 0905 982 919.`,
      },
    ],
    google: [
      {
        id: 'gg-1',
        title: 'Google Search Ads: Mẫu Quảng Cáo Đạt Chuẩn CTR Cao',
        content: `Tiêu đề 1: Workshop Botanica Garden Hội An | Trải Nghiệm Sinh Thái 5 Sao
Tiêu đề 2: Lớp Học Làm Nến & Vẽ Sỏi | Đặt Trực Tuyến Xác Nhận Nhanh
Tiêu đề 3: Pha Chế Cà Phê Muối Hội An | Hoàn Toàn Không Nhựa 1 Lần

Mô tả 1: Không gian vườn thảo mộc thanh bình tại 208 Lê Thánh Tông Hội An. Hướng dẫn viên nhiệt tình, vật liệu thiên nhiên cao cấp. Giảm ngay 10% khi đặt trước 24h!
Mô tả 2: Hoạt động lý tưởng cho gia đình, cặp đôi và trẻ nhỏ. Thưởng thức trà thảo dược miễn phí. Hotline hỗ trợ 0905 982 919.

Từ khóa mục tiêu: workshop hoi an, lam nen hoi an, ca phe muoi hoi an, botanica garden hoi an, trai nghiem gia dinh hoi an`,
      },
    ],
    tiktok: [
      {
        id: 'tt-1',
        title: 'Kịch Bản Video TikTok/Reels: Trốn Phố Thị Về Với Vườn Botanica Garden',
        content: `[00:00 - 00:03] (Hook - Cảnh bước qua cổng vòm hoa xanh mướt, tiếng chim hót và tiếng gió khua lá): 
"Nếu bạn muốn tìm một nơi ở Hội An vừa chill vừa chữa lành tâm hồn, hãy lưu lại clip này ngay nhé!"

[00:04 - 00:15] Cảnh bàn gỗ mộc ngoài trời rợp bóng cây, các hũ sáp nến đậu nành và những cánh hoa khô đủ màu sắc được cẩn thận sắp đặt.

[00:16 - 00:30] Cảnh đổ lớp sáp ấm nồng hương sả chanh vào ly thủy tinh, trang trí hoa khô và nụ cười rạng rỡ của du khách khi cầm trên tay thành phẩm.

[00:31 - 00:45] Cảnh bàn uống trà thảo mộc, thưởng thức ly cà phê muối béo ngậy giữa không gian vườn xanh mướt.

[00:46 - 00:60] Call to action: "Khu vườn Botanica Garden - 208 Lê Thánh Tông Hội An. Nhớ ghé trải nghiệm khi đến Hội An nha!" (Chèn link bio website)`,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-stone-900 font-serif tracking-tight">
              Quản lý chiến dịch và tiếp thị
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
              {campaigns.length} Chiến dịch
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Lập kế hoạch, theo dõi ngân sách, biên tập kịch bản quảng cáo đa kênh (Facebook, Zalo OA, Google Ads, TikTok).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Chiến Dịch Mới</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Tổng Chiến Dịch</span>
          <div className="text-2xl font-black text-stone-900">{stats.total}</div>
          <span className="text-[10px] text-stone-500">Bao gồm tất cả giai đoạn</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
            <Play className="w-3 h-3 fill-emerald-600" />
            Đang Hoạt Động
          </span>
          <div className="text-2xl font-black text-emerald-700">{stats.active}</div>
          <span className="text-[10px] text-stone-500">Đang chạy truyền thông</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Lên Lịch / Dự Thảo
          </span>
          <div className="text-2xl font-black text-amber-700">{stats.planning}</div>
          <span className="text-[10px] text-stone-500">Chiến dịch sắp tới</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            Tổng Ngân Sách
          </span>
          <div className="text-xl font-black text-blue-700 truncate">
            {stats.totalBudget.toLocaleString('vi-VN')} đ
          </div>
          <span className="text-[10px] text-stone-500">Ngân sách toàn chiến dịch</span>
        </div>
      </div>

      {/* Campaigns Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Tất cả ({campaigns.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
              statusFilter === 'ACTIVE'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Đang chạy ({stats.active})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('PLANNING')}
            className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
              statusFilter === 'PLANNING'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Lên lịch ({stats.planning})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('PAUSED')}
            className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
              statusFilter === 'PAUSED'
                ? 'bg-stone-600 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Tạm dừng ({stats.paused})
          </button>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã chiến dịch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      {/* Campaigns Grid */}
      {filteredCampaigns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-stone-100 text-stone-400 rounded-2xl flex items-center justify-center mx-auto">
            <Megaphone className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-stone-700">Chưa có chiến dịch nào phù hợp</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Hãy bấm nút &quot;Thêm Chiến Dịch Mới&quot; để tạo chiến dịch marketing tiếp cận khách hàng.
          </p>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1.5 shadow-2xs hover:bg-emerald-800"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo chiến dịch đầu tiên</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCampaigns.map((camp) => {
            const hasBanner = camp.bannerImage && !camp.bannerImage.startsWith('{{');
            const statusConfig = {
              ACTIVE: { text: 'Đang chạy', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
              PLANNING: { text: 'Lên lịch', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
              PAUSED: { text: 'Tạm dừng', bg: 'bg-stone-100 text-stone-600 border-stone-200', dot: 'bg-stone-400' },
              ENDED: { text: 'Kết thúc', bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
            }[camp.status] || { text: camp.status, bg: 'bg-stone-100 text-stone-700 border-stone-200', dot: 'bg-stone-400' };

            return (
              <div
                key={camp.id}
                className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Banner Image */}
                  <div className="h-36 bg-stone-100 relative overflow-hidden group">
                    {hasBanner ? (
                      <img
                        src={camp.bannerImage}
                        alt={camp.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 gap-1 bg-stone-50">
                        <Megaphone className="w-8 h-8 opacity-40" />
                        <span className="text-[10px] font-bold">Chưa có banner</span>
                      </div>
                    )}

                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 shadow-2xs ${statusConfig.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                        {statusConfig.text}
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg">
                        {camp.code}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 line-clamp-1 hover:text-emerald-700 transition-colors">
                        {camp.name}
                      </h3>
                      <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                        {camp.description || 'Không có mô tả chi tiết.'}
                      </p>
                    </div>

                    {/* Metadata chips */}
                    <div className="space-y-1.5 text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          Ngân sách:
                        </span>
                        <span className="font-extrabold text-stone-900">
                          {Number(camp.budget || 0).toLocaleString('vi-VN')} đ
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-stone-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Thời gian:
                        </span>
                        <span className="font-mono text-[11px] text-stone-700">
                          {camp.startDate} → {camp.endDate}
                        </span>
                      </div>
                    </div>

                    {/* Channel Indicators */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-bold text-stone-400">Kênh truyền thông:</span>
                      <div className="flex items-center gap-1.5">
                        <span
                          title="Facebook Content"
                          className={`p-1 rounded-lg text-xs ${
                            camp.channels?.facebook?.postTitle
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-stone-100 text-stone-300'
                          }`}
                        >
                          <Facebook className="w-3.5 h-3.5" />
                        </span>
                        <span
                          title="Zalo OA"
                          className={`p-1 rounded-lg text-xs ${
                            camp.channels?.zaloOa?.messageBody
                              ? 'bg-cyan-50 text-cyan-600'
                              : 'bg-stone-100 text-stone-300'
                          }`}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </span>
                        <span
                          title="Google Ads"
                          className={`p-1 rounded-lg text-xs ${
                            camp.channels?.googleAds?.headline1
                              ? 'bg-red-50 text-red-600'
                              : 'bg-stone-100 text-stone-300'
                          }`}
                        >
                          <Search className="w-3.5 h-3.5" />
                        </span>
                        <span
                          title="TikTok Script"
                          className={`p-1 rounded-lg text-xs ${
                            camp.channels?.tiktok?.videoTopic
                              ? 'bg-stone-900 text-white'
                              : 'bg-stone-100 text-stone-300'
                          }`}
                        >
                          <Video className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-3 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {/* Toggle quick status */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(camp)}
                      title={camp.status === 'ACTIVE' ? 'Tạm dừng chiến dịch' : 'Kích hoạt chiến dịch'}
                      className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                        camp.status === 'ACTIVE'
                          ? 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100'
                          : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      {camp.status === 'ACTIVE' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>

                    {/* View copywriting */}
                    <button
                      type="button"
                      onClick={() => setPreviewCampaign(camp)}
                      title="Xem nội dung quảng cáo các kênh"
                      className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Xem nội dung</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(camp)}
                      className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-white border border-transparent hover:border-stone-200 transition-colors"
                      title="Chỉnh sửa chiến dịch"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(camp.id)}
                      className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                      title="Xóa chiến dịch"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Social Media Standard Content Engine */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-hidden mt-8">
        <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-stone-900 font-serif flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-emerald-700" />
              Thư Viện Mẫu Truyền Thông Đa Kênh Chuẩn (Content Hub)
            </h3>
            <p className="text-xs text-stone-500">
              Mẫu nội dung bài viết và kịch bản chuẩn SEO, có thể sao chép nhanh để triển khai chiến dịch.
            </p>
          </div>
        </div>

        {/* Channel Bar */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-4 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveChannelTab('facebook')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeChannelTab === 'facebook'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Facebook className="w-4 h-4" />
            <span>Facebook Post ({channelTemplates.facebook.length})</span>
          </button>

          <button
            onClick={() => setActiveChannelTab('zalo')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeChannelTab === 'zalo'
                ? 'border-cyan-600 text-cyan-600 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Zalo OA ({channelTemplates.zalo.length})</span>
          </button>

          <button
            onClick={() => setActiveChannelTab('google')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeChannelTab === 'google'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Google Search Ads ({channelTemplates.google.length})</span>
          </button>

          <button
            onClick={() => setActiveChannelTab('tiktok')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeChannelTab === 'tiktok'
                ? 'border-stone-900 text-stone-900 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>TikTok / Reels ({channelTemplates.tiktok.length})</span>
          </button>
        </div>

        {/* Content List */}
        <div className="p-5 space-y-4">
          {channelTemplates[activeChannelTab].map((tpl) => (
            <div key={tpl.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-xs font-bold text-stone-900">{tpl.title}</h4>
                <button
                  type="button"
                  onClick={() => handleCopy(tpl.content, tpl.id)}
                  className="bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 border border-stone-200 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
                >
                  {copiedKey === tpl.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Đã sao chép!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao Chép Mẫu</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="text-xs text-stone-700 font-sans whitespace-pre-wrap bg-white p-4 rounded-xl border border-stone-200/80 leading-relaxed max-h-60 overflow-y-auto">
                {tpl.content}
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE & EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">
                    {editingCampaign ? 'Chỉnh Sửa Chiến Dịch Marketing' : 'Tạo Chiến Dịch Mới'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {editingCampaign ? `Mã: ${editingCampaign.code}` : 'Thiết lập thông tin và kênh quảng cáo'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-400 hover:text-stone-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Nav Tabs */}
            <div className="flex border-b border-stone-200 bg-stone-50 px-5 text-xs font-bold overflow-x-auto">
              <button
                type="button"
                onClick={() => setFormActiveTab('basic')}
                className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  formActiveTab === 'basic' ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent text-stone-500'
                }`}
              >
                <span>1. Thông Tin Cơ Bản *</span>
              </button>
              <button
                type="button"
                onClick={() => setFormActiveTab('facebook')}
                className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  formActiveTab === 'facebook' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-stone-500'
                }`}
              >
                <Facebook className="w-3.5 h-3.5 text-blue-600" />
                <span>2. Kênh Facebook</span>
              </button>
              <button
                type="button"
                onClick={() => setFormActiveTab('zalo')}
                className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  formActiveTab === 'zalo' ? 'border-cyan-600 text-cyan-700 bg-white' : 'border-transparent text-stone-500'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5 text-cyan-600" />
                <span>3. Zalo OA</span>
              </button>
              <button
                type="button"
                onClick={() => setFormActiveTab('google')}
                className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  formActiveTab === 'google' ? 'border-red-600 text-red-700 bg-white' : 'border-transparent text-stone-500'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-red-600" />
                <span>4. Google Ads</span>
              </button>
              <button
                type="button"
                onClick={() => setFormActiveTab('tiktok')}
                className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  formActiveTab === 'tiktok' ? 'border-stone-900 text-stone-900 bg-white' : 'border-transparent text-stone-500'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-stone-900" />
                <span>5. TikTok / Reels</span>
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* TAB 1: BASIC INFO */}
              {formActiveTab === 'basic' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Tên Chiến Dịch Marketing *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="VD: Chiến Dịch Hè 2026: Trải Nghiệm Xanh Hội An"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Mã Chiến Dịch *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="VD: CAMP-SUMMER-2026"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-mono uppercase focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Trạng Thái *
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            status: e.target.value as MarketingCampaign['status'],
                          })
                        }
                        className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-bold focus:outline-none focus:border-emerald-600"
                      >
                        <option value="PLANNING">Lên lịch (PLANNING)</option>
                        <option value="ACTIVE">Đang chạy (ACTIVE)</option>
                        <option value="PAUSED">Tạm dừng (PAUSED)</option>
                        <option value="ENDED">Kết thúc (ENDED)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Ngân Sách Dự Kiến (VNĐ)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={500000}
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-mono font-bold focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Người Phụ Trách / Bộ Phận
                      </label>
                      <input
                        type="text"
                        value={formData.createdBy}
                        onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Ngày Bắt Đầu</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Ngày Kết Thúc</label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Đường Dẫn Trang Đích (Landing Page URL)
                    </label>
                    <input
                      type="url"
                      placeholder="https://emictravel.aikpt.vn/workshop..."
                      value={formData.landingPageUrl}
                      onChange={(e) => setFormData({ ...formData, landingPageUrl: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Mô Tả Mục Tiêu Chiến Dịch</label>
                    <textarea
                      rows={2}
                      placeholder="Mục tiêu tiếp cận, số lượng booking kỳ vọng, đối tượng khách hàng mục tiêu..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-emerald-600 leading-relaxed"
                    />
                  </div>

                  {/* Banner Upload with direct upload component */}
                  <ImageUploadField
                    label="Ảnh Banner Chiến Dịch"
                    value={formData.bannerImage}
                    onChange={(url) => setFormData({ ...formData, bannerImage: url })}
                    folder="MARKETING"
                    recommendedSize="1200x630px (Tỉ lệ Facebook/Social share chuẩn 1.91:1)"
                  />
                </div>
              )}

              {/* TAB 2: FACEBOOK CONTENT */}
              {formActiveTab === 'facebook' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center gap-2 text-xs text-blue-800 font-semibold">
                    <Facebook className="w-4 h-4 text-blue-600" />
                    <span>Nội dung bài viết Facebook Ads / Fanpage Organic Post</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Tiêu Đề Bài Viết Facebook</label>
                    <input
                      type="text"
                      placeholder="VD: 🔥 ƯU ĐÃI WORKSHOP GIA ĐÌNH HỘI AN CUỐI TUẦN 🔥"
                      value={formData.channels.facebook.postTitle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          channels: {
                            ...formData.channels,
                            facebook: { ...formData.channels.facebook, postTitle: e.target.value },
                          },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-bold focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Đối Tượng Nhắm Đến (Target Audience)</label>
                    <input
                      type="text"
                      placeholder="VD: Gia đình có con 5-15 tuổi tại Đà Nẵng, Hà Nội; Du khách quốc tế yêu sinh thái"
                      value={formData.channels.facebook.targetAudience}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          channels: {
                            ...formData.channels,
                            facebook: { ...formData.channels.facebook, targetAudience: e.target.value },
                          },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Nội Dung Bài Đăng (Copywriting)</label>
                    <textarea
                      rows={5}
                      placeholder="Soạn nội dung bài đăng đầy đủ kèm biểu tượng cảm xúc và lời kêu gọi hành động..."
                      value={formData.channels.facebook.content}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          channels: {
                            ...formData.channels,
                            facebook: { ...formData.channels.facebook, content: e.target.value },
                          },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-sans leading-relaxed focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Hashtags (Phân cách bằng dấu phẩy)</label>
                    <input
                      type="text"
                      placeholder="#BotanicaGarden, #HoiAn, #Workshop"
                      value={formData.channels.facebook.hashtags.join(', ')}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          channels: {
                            ...formData.channels,
                            facebook: {
                              ...formData.channels.facebook,
                              hashtags: e.target.value.split(',').map((h) => h.trim()).filter(Boolean),
                            },
                          },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: ZALO OA */}
              {formActiveTab === 'zalo' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="bg-cyan-50 border border-cyan-100 p-3 rounded-xl flex items-center gap-2 text-xs text-cyan-800 font-semibold">
                    <MessageCircle className="w-4 h-4 text-cyan-600" />
                    <span>Mẫu tin nhắn Zalo Official Account gửi thông báo & CSKH</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Tên Mẫu Tin Nhắn</label>
                    <input
                      type="text"
                      placeholder="VD: Zalo Broadcast Ưu Đãi Hè"
                      value={formData.channels.zaloOa.templateName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          channels: {
                            ...formData.channels,
                            zaloOa: { ...formData.channels.zaloOa, templateName: e.target.value },
                          },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-cyan-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Dòng Tiêu Đề Tin Nhắn (Header)</label>
                    <input
                      type="text"
                      placeholder="VD: Lời mời trải nghiệm workshop xanh từ Botanica Garden Hội An"
                      value={formData.channels.zaloOa.messageHeader}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          channels: {
                            ...formData.channels,
                            zaloOa: { ...formData.channels.zaloOa, messageHeader: e.target.value },
                          },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-bold focus:outline-none focus:border-cyan-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Nội Dung Chi Tiết (Body)</label>
                    <textarea
                      rows={4}
                      placeholder="Nội dung tin nhắn Zalo gửi tới khách hàng..."
                      value={formData.channels.zaloOa.messageBody}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          channels: {
                            ...formData.channels,
                            zaloOa: { ...formData.channels.zaloOa, messageBody: e.target.value },
                          },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-cyan-600 leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Chữ Nút Kêu Gọi Hành Động (CTA Button)</label>
                    <input
                      type="text"
                      placeholder="VD: ĐẶT WORKSHOP NGAY"
                      value={formData.channels.zaloOa.ctaText}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          channels: {
                            ...formData.channels,
                            zaloOa: { ...formData.channels.zaloOa, ctaText: e.target.value },
                          },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-bold focus:outline-none focus:border-cyan-600"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: GOOGLE ADS */}
              {formActiveTab === 'google' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-2 text-xs text-red-800 font-semibold">
                    <Search className="w-4 h-4 text-red-600" />
                    <span>Cấu hình Mẫu Google Search Ads (Responsive Search Ads)</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Tên Chiến Dịch Trên Google Ads</label>
                    <input
                      type="text"
                      placeholder="VD: Search_Workshop_Botanica_HoiAn"
                      value={formData.channels.googleAds.campaignName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          channels: {
                            ...formData.channels,
                            googleAds: { ...formData.channels.googleAds, campaignName: e.target.value },
                          },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-mono focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Tiêu Đề 1 (Tối đa 30 ký tự)</label>
                      <input
                        type="text"
                        maxLength={30}
                        placeholder="VD: Botanica Garden Hội An"
                        value={formData.channels.googleAds.headline1}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            channels: {
                              ...formData.channels,
                              googleAds: { ...formData.channels.googleAds, headline1: e.target.value },
                            },
                          })
                        }
                        className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-bold focus:outline-none focus:border-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Tiêu Đề 2 (Tối đa 30 ký tự)</label>
                      <input
                        type="text"
                        maxLength={30}
                        placeholder="VD: Workshop Trải Nghiệm Xanh"
                        value={formData.channels.googleAds.headline2}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            channels: {
                              ...formData.channels,
                              googleAds: { ...formData.channels.googleAds, headline2: e.target.value },
                            },
                          })
                        }
                        className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-bold focus:outline-none focus:border-red-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Mô Tả Quảng Cáo (Tối đa 90 ký tự)</label>
                    <textarea
                      rows={2}
                      maxLength={90}
                      placeholder="VD: Tự tay làm nến thơm, tranh sỏi và cà phê muối tại khu vườn 208 Lê Thánh Tông Hội An."
                      value={formData.channels.googleAds.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          channels: {
                            ...formData.channels,
                            googleAds: { ...formData.channels.googleAds, description: e.target.value },
                          },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Từ Khóa Mục Tiêu (Phân cách bằng dấu phẩy)</label>
                    <input
                      type="text"
                      placeholder="workshop hoi an, botanica garden, lam nen hoi an"
                      value={formData.channels.googleAds.keywords.join(', ')}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          channels: {
                            ...formData.channels,
                            googleAds: {
                              ...formData.channels.googleAds,
                              keywords: e.target.value.split(',').map((k) => k.trim()).filter(Boolean),
                            },
                          },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: TIKTOK / REELS */}
              {formActiveTab === 'tiktok' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="bg-stone-100 border border-stone-200 p-3 rounded-xl flex items-center gap-2 text-xs text-stone-800 font-semibold">
                    <Video className="w-4 h-4 text-stone-900" />
                    <span>Kịch bản video ngắn TikTok & Facebook / Instagram Reels</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Chủ Đề Video (Topic)</label>
                    <input
                      type="text"
                      placeholder="VD: 1 ngày làm nến thơm chữa lành tại Hội An"
                      value={formData.channels.tiktok.videoTopic}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          channels: {
                            ...formData.channels,
                            tiktok: { ...formData.channels.tiktok, videoTopic: e.target.value },
                          },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-bold focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Tóm Tắt Kịch Bản / Phân Cảnh (Script Concept)</label>
                    <textarea
                      rows={4}
                      placeholder="Phân cảnh 1 (0-3s): Cảnh vườn xanh... Phân cảnh 2 (4-15s): Đổ sáp nến thơm... CTA: Ghé vườn ngay..."
                      value={formData.channels.tiktok.scriptSummary}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          channels: {
                            ...formData.channels,
                            tiktok: { ...formData.channels.tiktok, scriptSummary: e.target.value },
                          },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-stone-900 leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Âm Thanh / Nhạc Nền Gợi Ý</label>
                      <input
                        type="text"
                        placeholder="VD: Nhạc Acoustic Hội An lofi chill"
                        value={formData.channels.tiktok.soundTrack}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            channels: {
                              ...formData.channels,
                              tiktok: { ...formData.channels.tiktok, soundTrack: e.target.value },
                            },
                          })
                        }
                        className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Hashtags</label>
                      <input
                        type="text"
                        placeholder="#botanicagarden, #hoian, #fyp"
                        value={formData.channels.tiktok.hashtags.join(', ')}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            channels: {
                              ...formData.channels,
                              tiktok: {
                                ...formData.channels.tiktok,
                                hashtags: e.target.value.split(',').map((h) => h.trim()).filter(Boolean),
                              },
                            },
                          })
                        }
                        className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-stone-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <div className="text-[11px] text-stone-400">
                  {editingCampaign ? 'Đang cập nhật chiến dịch' : 'Sẵn sàng lưu chiến dịch mới'}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingCampaign ? 'Lưu Thay Đổi' : 'Tạo Chiến Dịch'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW COPYWRITING MODAL */}
      {previewCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <div>
                <h3 className="text-sm font-black text-stone-900 font-serif">
                  {previewCampaign.name}
                </h3>
                <p className="text-xs text-stone-500 font-mono">
                  Mã: {previewCampaign.code} | Ngân sách: {Number(previewCampaign.budget).toLocaleString('vi-VN')} đ
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewCampaign(null)}
                className="w-8 h-8 rounded-full bg-stone-200/60 text-stone-500 hover:text-stone-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Facebook */}
              {previewCampaign.channels?.facebook?.content && (
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <Facebook className="w-4 h-4 text-blue-600" />
                      Facebook Post: {previewCampaign.channels.facebook.postTitle || 'Không có tiêu đề'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(previewCampaign.channels.facebook.content, `p-fb-${previewCampaign.id}`)}
                      className="px-2.5 py-1 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 text-[11px] font-bold rounded-lg flex items-center gap-1"
                    >
                      {copiedKey === `p-fb-${previewCampaign.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === `p-fb-${previewCampaign.id}` ? 'Đã sao chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                  <pre className="text-xs text-stone-700 font-sans whitespace-pre-wrap bg-white p-3 rounded-xl border border-stone-100 leading-relaxed">
                    {previewCampaign.channels.facebook.content}
                  </pre>
                  {previewCampaign.channels.facebook.hashtags?.length > 0 && (
                    <div className="text-[11px] text-blue-600 font-mono">
                      {previewCampaign.channels.facebook.hashtags.join(' ')}
                    </div>
                  )}
                </div>
              )}

              {/* Zalo OA */}
              {previewCampaign.channels?.zaloOa?.messageBody && (
                <div className="p-4 rounded-2xl bg-cyan-50/50 border border-cyan-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-900 flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-cyan-600" />
                      Zalo OA: {previewCampaign.channels.zaloOa.messageHeader || 'Tin nhắn'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(previewCampaign.channels.zaloOa.messageBody, `p-zalo-${previewCampaign.id}`)}
                      className="px-2.5 py-1 bg-white border border-cyan-200 text-cyan-700 hover:bg-cyan-50 text-[11px] font-bold rounded-lg flex items-center gap-1"
                    >
                      {copiedKey === `p-zalo-${previewCampaign.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === `p-zalo-${previewCampaign.id}` ? 'Đã sao chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                  <pre className="text-xs text-stone-700 font-sans whitespace-pre-wrap bg-white p-3 rounded-xl border border-stone-100 leading-relaxed">
                    {previewCampaign.channels.zaloOa.messageBody}
                  </pre>
                </div>
              )}

              {/* Google Ads */}
              {previewCampaign.channels?.googleAds?.headline1 && (
                <div className="p-4 rounded-2xl bg-red-50/50 border border-red-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                      <Search className="w-4 h-4 text-red-600" />
                      Google Ads: {previewCampaign.channels.googleAds.headline1}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          `${previewCampaign.channels.googleAds.headline1} | ${previewCampaign.channels.googleAds.headline2}\n${previewCampaign.channels.googleAds.description}`,
                          `p-gg-${previewCampaign.id}`
                        )
                      }
                      className="px-2.5 py-1 bg-white border border-red-200 text-red-700 hover:bg-red-50 text-[11px] font-bold rounded-lg flex items-center gap-1"
                    >
                      {copiedKey === `p-gg-${previewCampaign.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === `p-gg-${previewCampaign.id}` ? 'Đã sao chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-stone-100 space-y-1 text-xs">
                    <div className="font-bold text-blue-700">
                      {previewCampaign.channels.googleAds.headline1} | {previewCampaign.channels.googleAds.headline2}
                    </div>
                    <div className="text-stone-600">{previewCampaign.channels.googleAds.description}</div>
                  </div>
                </div>
              )}

              {/* TikTok / Reels */}
              {previewCampaign.channels?.tiktok?.scriptSummary && (
                <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-stone-900" />
                      TikTok Script: {previewCampaign.channels.tiktok.videoTopic}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(previewCampaign.channels.tiktok.scriptSummary, `p-tt-${previewCampaign.id}`)}
                      className="px-2.5 py-1 bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 text-[11px] font-bold rounded-lg flex items-center gap-1"
                    >
                      {copiedKey === `p-tt-${previewCampaign.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === `p-tt-${previewCampaign.id}` ? 'Đã sao chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                  <pre className="text-xs text-stone-700 font-sans whitespace-pre-wrap bg-white p-3 rounded-xl border border-stone-100 leading-relaxed">
                    {previewCampaign.channels.tiktok.scriptSummary}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Xác Nhận Xóa Chiến Dịch</h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Bạn có chắc chắn muốn xóa chiến dịch này không? Hành động này sẽ loại bỏ chiến dịch khỏi hệ thống.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa chiến dịch</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
