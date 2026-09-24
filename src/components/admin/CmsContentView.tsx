import React, { useState, useMemo, useEffect } from 'react';
import { Banner, Post, CustomerFeedback, SiteConfig } from '../../types';
import {
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Eye,
  Star,
  X,
  Settings,
  Save,
  Check,
  MapPin,
  Compass,
  Search,
  BookOpen,
} from 'lucide-react';
import { ImageUploadField } from '../common/ImageUploadField';

interface CmsContentViewProps {
  banners: Banner[];
  posts: Post[];
  feedbacks: CustomerFeedback[];
  siteConfig?: SiteConfig;
  onToggleBanner: (id: string, active: boolean) => void;
  onApproveFeedback: (id: string, isApproved: boolean) => void;
  onCreateFeedback?: (feedback: Omit<CustomerFeedback, 'id' | 'createdAt'>) => void;
  onUpdateFeedback?: (id: string, updates: Partial<CustomerFeedback>) => void;
  onDeleteFeedback?: (id: string) => void;
  onCreatePost: (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>) => void;
  onUpdatePost?: (id: string, post: Partial<Post>) => void;
  onDeletePost: (id: string) => void;
  onUpdateSiteConfig?: (config: Partial<SiteConfig>) => Promise<void>;
  onCreateBanner?: (banner: Omit<Banner, 'id'>) => void;
  onUpdateBanner?: (id: string, banner: Partial<Banner>) => void;
  onDeleteBanner?: (id: string) => void;
}

export const CmsContentView: React.FC<CmsContentViewProps> = ({
  banners,
  posts,
  feedbacks,
  siteConfig,
  onToggleBanner,
  onApproveFeedback,
  onCreateFeedback,
  onUpdateFeedback,
  onDeleteFeedback,
  onCreatePost,
  onUpdatePost,
  onDeletePost,
  onUpdateSiteConfig,
  onCreateBanner,
  onUpdateBanner,
  onDeleteBanner,
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'banners' | 'feedbacks' | 'config'>('posts');
  const [postSearchTerm, setPostSearchTerm] = useState('');
  const [postCategoryFilter, setPostCategoryFilter] = useState('ALL');
  const [previewingPost, setPreviewingPost] = useState<Post | null>(null);

  const [configForm, setConfigForm] = useState<SiteConfig>(
    siteConfig || {
      whatsapp: '84905982919',
      messenger: '61573941593197',
      instagram: 'botanicagarden_hoian',
      facebook: 'https://www.facebook.com/profile.php?id=61573941593197',
      email: '',
      phone: '+84 905 982 919',
      maps: 'https://www.google.com/maps/search/?api=1&query=Botanica+Garden+208+Le+Thanh+Tong+Cam+Chau+Hoi+An',
      address: '208 Le Thanh Tong, Cam Chau, Hoi An',
      visitImage: '',
    }
  );
  const [isSavedConfig, setIsSavedConfig] = useState(false);

  useEffect(() => {
    if (siteConfig) {
      setConfigForm({
        whatsapp: siteConfig.whatsapp || '',
        messenger: siteConfig.messenger || '',
        instagram: siteConfig.instagram || '',
        facebook: siteConfig.facebook || '',
        email: siteConfig.email || '',
        phone: siteConfig.phone || '',
        maps: siteConfig.maps || '',
        address: siteConfig.address || '',
        visitImage: siteConfig.visitImage || '',
      });
    }
  }, [siteConfig]);

  // Post modal (create & edit)
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postFormData, setPostFormData] = useState({
    title: '',
    slug: '',
    category: 'Phát Triển Bền Vững',
    thumbnail: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    summary: '',
    content: '',
    author: 'Emic Media Team',
    status: 'PUBLISHED' as 'DRAFT' | 'PUBLISHED',
    eyebrow: '',
    imageLabel: '',
    guestReview: '',
  });

  // Feedback modal (create & edit)
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null);
  const [feedbackFormData, setFeedbackFormData] = useState({
    customerName: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    location: 'Melbourne, Australia',
    tourName: 'Lớp Làm Nến Thơm & Tranh Sỏi Thảo Mộc',
    rating: 5,
    comment: '',
    isApproved: true,
    isFeatured: true,
  });

  // Banner modal (create & edit)
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerFormData, setBannerFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=80',
    linkUrl: '#workshops',
    badgeText: '',
    buttonText: 'Choose a workshop',
    position: 'HOME_HERO',
    order: 1,
    isActive: true,
  });

  // Open Create Banner Modal
  const handleOpenCreateBanner = () => {
    setEditingBannerId(null);
    setBannerFormData({
      title: '',
      subtitle: '',
      imageUrl: '/images/img_0.jpeg',
      linkUrl: '#workshops',
      badgeText: 'HOI AN · 2 KM FROM THE OLD TOWN',
      buttonText: 'Choose a workshop',
      position: 'HOME_HERO',
      order: banners.length + 1,
      isActive: true,
    });
    setIsBannerModalOpen(true);
  };

  // Open Edit Banner Modal
  const handleOpenEditBanner = (banner: Banner) => {
    setEditingBannerId(banner.id);
    setBannerFormData({
      title: banner.title,
      subtitle: banner.subtitle,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || '#workshops',
      badgeText: banner.badgeText || 'HOI AN · 2 KM FROM THE OLD TOWN',
      buttonText: banner.buttonText || 'Choose a workshop',
      position: banner.position || 'HOME_HERO',
      order: banner.order || 1,
      isActive: banner.isActive !== false,
    });
    setIsBannerModalOpen(true);
  };

  // Submit Banner Form
  const handleSaveBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerFormData.title.trim() || !bannerFormData.subtitle.trim()) {
      alert('Vui lòng điền tiêu đề và mô tả của banner');
      return;
    }

    const submissionData = {
      ...bannerFormData,
      position: bannerFormData.position as "HOME_HERO" | "PROMOTION_BAR" | "SIDEBAR"
    };

    if (editingBannerId) {
      if (onUpdateBanner) {
        onUpdateBanner(editingBannerId, submissionData);
      }
    } else {
      if (onCreateBanner) {
        onCreateBanner(submissionData);
      }
    }

    setIsBannerModalOpen(false);
  };

  // Open Create Post Modal
  const handleOpenCreatePost = () => {
    setEditingPostId(null);
    setPostFormData({
      title: '',
      slug: '',
      category: 'Phát Triển Bền Vững',
      thumbnail: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      summary: '',
      content: '',
      author: 'Emic Media Team',
      status: 'PUBLISHED',
      eyebrow: '',
      imageLabel: '',
      guestReview: '',
    });
    setIsPostModalOpen(true);
  };

  // Open Edit Post Modal
  const handleOpenEditPost = (post: Post) => {
    setEditingPostId(post.id);
    setPostFormData({
      title: post.title,
      slug: post.slug,
      category: post.category,
      thumbnail: post.thumbnail,
      summary: post.summary,
      content: post.content,
      author: post.author,
      status: post.status,
      eyebrow: post.eyebrow || '',
      imageLabel: post.imageLabel || '',
      guestReview: post.guestReview || '',
    });
    setIsPostModalOpen(true);
  };

  // Submit Post Form
  const handleSavePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postFormData.title.trim()) return;

    if (editingPostId && onUpdatePost) {
      onUpdatePost(editingPostId, {
        title: postFormData.title,
        slug: postFormData.slug || postFormData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: postFormData.category,
        thumbnail: postFormData.thumbnail,
        summary: postFormData.summary,
        content: postFormData.content || postFormData.summary,
        author: postFormData.author,
        status: postFormData.status,
        seoTitle: postFormData.title,
        seoDescription: postFormData.summary,
        eyebrow: postFormData.eyebrow,
        imageLabel: postFormData.imageLabel,
        guestReview: postFormData.guestReview,
      });
    } else {
      onCreatePost({
        title: postFormData.title,
        slug: postFormData.slug || postFormData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: postFormData.category,
        thumbnail: postFormData.thumbnail,
        summary: postFormData.summary,
        content: postFormData.content || postFormData.summary,
        author: postFormData.author,
        status: postFormData.status,
        publishedAt: new Date().toISOString(),
        seoTitle: postFormData.title,
        seoDescription: postFormData.summary,
        eyebrow: postFormData.eyebrow,
        imageLabel: postFormData.imageLabel,
        guestReview: postFormData.guestReview,
      });
    }

    setIsPostModalOpen(false);
  };

  // Open Create Feedback Modal
  const handleOpenCreateFeedback = () => {
    setEditingFeedbackId(null);
    setFeedbackFormData({
      customerName: '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      location: 'Melbourne, Australia',
      tourName: 'Lớp Làm Nến Thơm & Tranh Sỏi Thảo Mộc',
      rating: 5,
      comment: '',
      isApproved: true,
      isFeatured: true,
    });
    setIsFeedbackModalOpen(true);
  };

  // Open Edit Feedback Modal
  const handleOpenEditFeedback = (fb: CustomerFeedback) => {
    setEditingFeedbackId(fb.id);
    setFeedbackFormData({
      customerName: fb.customerName,
      avatar: fb.avatar,
      location: fb.location,
      tourName: fb.tourName,
      rating: fb.rating,
      comment: fb.comment,
      isApproved: fb.isApproved,
      isFeatured: fb.isFeatured,
    });
    setIsFeedbackModalOpen(true);
  };

  // Submit Feedback Form
  const handleSaveFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackFormData.customerName.trim() || !feedbackFormData.comment.trim()) {
      alert('Vui lòng nhập họ tên khách hàng và nội dung đánh giá');
      return;
    }

    if (editingFeedbackId) {
      if (onUpdateFeedback) {
        onUpdateFeedback(editingFeedbackId, feedbackFormData);
      }
    } else {
      if (onCreateFeedback) {
        onCreateFeedback(feedbackFormData);
      }
    }

    setIsFeedbackModalOpen(false);
  };

  // Delete Feedback Confirmation
  const handleDeleteFeedbackConfirm = (fb: CustomerFeedback) => {
    if (confirm(`Bạn có chắc chắn muốn xóa đánh giá của khách "${fb.customerName}"?`)) {
      if (onDeleteFeedback) {
        onDeleteFeedback(fb.id);
      }
    }
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchSearch =
        !postSearchTerm ||
        p.title.toLowerCase().includes(postSearchTerm.toLowerCase()) ||
        p.summary.toLowerCase().includes(postSearchTerm.toLowerCase()) ||
        p.author.toLowerCase().includes(postSearchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(postSearchTerm.toLowerCase());
      const matchCat =
        postCategoryFilter === 'ALL' || p.category === postCategoryFilter;
      return matchSearch && matchCat;
    });
  }, [posts, postSearchTerm, postCategoryFilter]);

  const uniquePostCategories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [posts]);

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-stone-900 font-serif tracking-tight">
            Quản Lý Bài Viết & Nội Dung Website (CMS)
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Soạn thảo, quản lý bài viết blog, cập nhật banner trang chủ và duyệt đánh giá từ khách hàng.
          </p>
        </div>

        {activeTab === 'posts' && (
          <button
            onClick={handleOpenCreatePost}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Viết Bài Mới</span>
          </button>
        )}

        {activeTab === 'feedbacks' && (
          <button
            onClick={handleOpenCreateFeedback}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Đánh Giá Mới</span>
          </button>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-2 border-b border-stone-200">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'posts'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Bài Viết & Blog ({posts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('banners')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'banners'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Banner Trang Chủ ({banners.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('feedbacks')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'feedbacks'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Đánh Giá Khách Hàng ({feedbacks.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'config'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Thông Tin Liên Hệ & MXH</span>
        </button>
      </div>

      {/* TAB 1: Banners */}
      {activeTab === 'banners' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-stone-200 shadow-2xs gap-3">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Quản Lý Banner Giao Diện</h3>
              <p className="text-xs text-stone-500">Thêm, sửa, xóa, hiển thị các banner lớn ở màn hình trang chủ.</p>
            </div>
            <button
              onClick={handleOpenCreateBanner}
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Banner Mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="relative h-48 bg-stone-100">
                  <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                  <span
                    className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      b.isActive ? 'bg-emerald-600 text-white' : 'bg-stone-800/80 text-stone-300'
                    }`}
                  >
                    {b.isActive ? 'Đang hiển thị' : 'Đã ẩn'}
                  </span>
                  <span className="absolute bottom-3 left-3 bg-stone-900/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    Vị trí: #{b.order}
                  </span>
                </div>
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 block w-max mb-1.5">
                      {b.badgeText || 'HOI AN · 2 KM FROM THE OLD TOWN'}
                    </span>
                    <h4 className="text-sm font-bold text-stone-900 leading-snug">{b.title}</h4>
                    <p className="text-xs text-stone-500 line-clamp-3 mt-1 leading-relaxed">{b.subtitle}</p>
                    {b.buttonText && (
                      <div className="mt-2 text-[11px] text-stone-600 flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold">Nút CTA:</span> 
                        <span className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-800 font-medium">{b.buttonText}</span> 
                        <span className="text-stone-300">→</span> 
                        <span className="text-stone-400 font-mono text-[10px]">{b.linkUrl || '#'}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100 gap-2">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenEditBanner(b)}
                        className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="Chỉnh sửa Banner"
                      >
                        <Edit2 className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có muốn xóa banner "${b.title}"?`)) {
                            if (onDeleteBanner) onDeleteBanner(b.id);
                          }
                        }}
                        className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa Banner"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => onToggleBanner(b.id, !b.isActive)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        b.isActive
                          ? 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                      }`}
                    >
                      {b.isActive ? 'Tạm ẩn' : 'Bật hiển thị'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 1: Posts (Bài Viết & Blog - Hiển thị dữ liệu, Tìm kiếm, Lọc, Xem trước, Sửa/Xóa) */}
      {activeTab === 'posts' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
              <div className="text-[11px] text-stone-500 font-semibold uppercase">Tổng bài viết</div>
              <div className="text-xl font-black text-stone-900 mt-1">{posts.length}</div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
              <div className="text-[11px] text-emerald-700 font-semibold uppercase">Đã xuất bản</div>
              <div className="text-xl font-black text-emerald-800 mt-1">
                {posts.filter((p) => p.status === 'PUBLISHED').length}
              </div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
              <div className="text-[11px] text-amber-700 font-semibold uppercase">Bản nháp</div>
              <div className="text-xl font-black text-amber-800 mt-1">
                {posts.filter((p) => p.status === 'DRAFT').length}
              </div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
              <div className="text-[11px] text-blue-700 font-semibold uppercase">Tổng lượt đọc</div>
              <div className="text-xl font-black text-blue-800 mt-1">
                {posts.reduce((acc, p) => acc + (p.viewCount || 0), 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={postSearchTerm}
                onChange={(e) => setPostSearchTerm(e.target.value)}
                placeholder="Tìm theo tiêu đề, tóm tắt, tác giả..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-stone-50/50"
              />
            </div>
          </div>

          {/* Posts Table */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12 px-4">
                <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <p className="text-stone-500 font-medium text-xs">Không tìm thấy bài viết nào phù hợp.</p>
                {postSearchTerm && (
                  <button
                    onClick={() => {
                      setPostSearchTerm('');
                      setPostCategoryFilter('ALL');
                    }}
                    className="mt-2 text-xs font-bold text-emerald-700 hover:underline"
                  >
                    Xóa bộ lọc tìm kiếm
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200">
                      <th className="py-3 px-4">Bài Viết</th>
                      <th className="py-3 px-4">Tác Giả</th>
                      <th className="py-3 px-4">Ngày Đăng</th>
                      <th className="py-3 px-4">Lượt Đọc</th>
                      <th className="py-3 px-4">Trạng Thái</th>
                      <th className="py-3 px-4 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredPosts.map((p) => (
                      <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.thumbnail}
                              alt={p.title}
                              className="w-16 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                            />
                            <div className="min-w-0 max-w-md">
                              <h4 className="font-bold text-stone-900 line-clamp-1">{p.title}</h4>
                              <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">{p.summary}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-stone-700 whitespace-nowrap">{p.author}</td>
                        <td className="py-3 px-4 text-stone-500 whitespace-nowrap">
                          {new Date(p.publishedAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="py-3 px-4 text-stone-700 whitespace-nowrap font-medium">
                          {(p.viewCount || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              p.status === 'PUBLISHED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {p.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setPreviewingPost(p)}
                              className="p-1.5 text-stone-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Xem chi tiết nội dung bài viết"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditPost(p)}
                              className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Chỉnh sửa bài viết & ảnh"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Xóa bài viết "${p.title}"?`)) onDeletePost(p.id);
                              }}
                              className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Xóa bài viết"
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
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Feedbacks (FULL CRUD: Thêm, Sửa, Xóa Đánh Giá Khách Hàng) */}
      {activeTab === 'feedbacks' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>
              Tổng cộng <strong>{feedbacks.length}</strong> đánh giá trải nghiệm từ du khách
            </span>
            <span className="text-[11px] text-stone-400">
              {feedbacks.filter((f) => f.isApproved).length} bài đã duyệt hiển thị ngoài Website
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {feedbacks.map((fb) => (
              <div
                key={fb.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < fb.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-stone-300 fill-stone-100'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {fb.isFeatured && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                          Nổi bật
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          fb.isApproved
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {fb.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-700 italic leading-relaxed mb-4 bg-stone-50/50 p-3 rounded-xl border border-stone-100">
                    "{fb.comment}"
                  </p>

                  <div className="text-[11px] text-stone-600 bg-emerald-50/60 border border-emerald-100/80 p-2.5 rounded-xl mb-4 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="line-clamp-1">
                      <strong>Lớp:</strong> {fb.tourName}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={fb.avatar}
                      alt={fb.customerName}
                      className="w-9 h-9 rounded-full object-cover border border-stone-200 shrink-0"
                    />
                    <div>
                      <h5 className="text-xs font-bold text-stone-900">{fb.customerName}</h5>
                      <p className="text-[10px] text-stone-400 flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5 text-stone-400" />
                        <span>{fb.location}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditFeedback(fb)}
                      className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      title="Sửa đánh giá"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteFeedbackConfirm(fb)}
                      className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa đánh giá"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onApproveFeedback(fb.id, !fb.isApproved)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors ml-1 cursor-pointer ${
                        fb.isApproved
                          ? 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
                          : 'bg-emerald-700 text-white hover:bg-emerald-800'
                      }`}
                    >
                      {fb.isApproved ? 'Ẩn' : 'Duyệt'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Site Config */}
      {activeTab === 'config' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs max-w-3xl space-y-5 animate-in fade-in duration-150">
          <div>
            <h3 className="text-base font-bold text-stone-900">Cấu Hình Kênh Liên Hệ & Mạng Xã Hội</h3>
            <p className="text-xs text-stone-500 mt-1">
              Các thông tin này được đồng bộ trực tiếp ra Website Khách Hàng (Mục Đến Thăm, Chân Trang và Modal Đặt Lớp).
            </p>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (onUpdateSiteConfig) {
                await onUpdateSiteConfig(configForm);
                setIsSavedConfig(true);
                setTimeout(() => setIsSavedConfig(false), 3000);
              }
            }}
            className="space-y-4 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Số WhatsApp (Không dấu +)</label>
                <input
                  type="text"
                  value={configForm.whatsapp}
                  onChange={(e) => setConfigForm({ ...configForm, whatsapp: e.target.value })}
                  placeholder="84905982919"
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Hotline / Số Điện Thoại</label>
                <input
                  type="text"
                  value={configForm.phone}
                  onChange={(e) => setConfigForm({ ...configForm, phone: e.target.value })}
                  placeholder="+84 905 982 919"
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">ID Fanpage Messenger</label>
                <input
                  type="text"
                  value={configForm.messenger}
                  onChange={(e) => setConfigForm({ ...configForm, messenger: e.target.value })}
                  placeholder="61573941593197"
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Tài Khoản Instagram</label>
                <input
                  type="text"
                  value={configForm.instagram}
                  onChange={(e) => setConfigForm({ ...configForm, instagram: e.target.value })}
                  placeholder="botanicagarden_hoian"
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-emerald-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Đường Dẫn Facebook Fanpage</label>
              <input
                type="text"
                value={configForm.facebook}
                onChange={(e) => setConfigForm({ ...configForm, facebook: e.target.value })}
                placeholder="https://www.facebook.com/..."
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-emerald-600 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Địa Chỉ Hiển Thị</label>
              <input
                type="text"
                value={configForm.address}
                onChange={(e) => setConfigForm({ ...configForm, address: e.target.value })}
                placeholder="208 Le Thanh Tong, Cam Chau, Hoi An"
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-emerald-600 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Đường Dẫn Bản Đồ Google Maps</label>
              <input
                type="text"
                value={configForm.maps}
                onChange={(e) => setConfigForm({ ...configForm, maps: e.target.value })}
                placeholder="https://www.google.com/maps/search/..."
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-emerald-600 outline-none"
              />
            </div>

            <ImageUploadField
              label="Ảnh Ở Mục Đến Thăm (Visit Image)"
              value={configForm.visitImage || ''}
              onChange={(url) => setConfigForm({ ...configForm, visitImage: url })}
              folder="OTHER"
              recommendedSize="1200x800px (Tỉ lệ 3:2)"
            />

            <div className="pt-3 border-t border-stone-100 flex items-center gap-3">
              <button
                type="submit"
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Lưu Cấu Hình</span>
              </button>
              {isSavedConfig && (
                <span className="text-emerald-700 font-bold text-xs flex items-center gap-1 animate-in fade-in">
                  <Check className="w-4 h-4" />
                  <span>Đã lưu thành công!</span>
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* POST MODAL: Thêm / Sửa Bài Viết với Upload Ảnh Trực Tiếp */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif font-black text-stone-900 text-lg">
                {editingPostId ? 'Chỉnh Sửa Bài Viết' : 'Viết Bài Mới Cho Website'}
              </h3>
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePostSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Nhãn Phụ / Eyebrow / Label
                  </label>
                  <input
                    type="text"
                    value={postFormData.eyebrow}
                    onChange={(e) => setPostFormData({ ...postFormData, eyebrow: e.target.value })}
                    placeholder="Ví dụ: CÂU CHUYỆN ĐỊA PHƯƠNG, SLOW LIVING..."
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Tiêu Đề Bài Viết <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={postFormData.title}
                    onChange={(e) => setPostFormData({ ...postFormData, title: e.target.value })}
                    placeholder="Tiêu đề bài viết..."
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Tác Giả</label>
                  <input
                    type="text"
                    value={postFormData.author}
                    onChange={(e) => setPostFormData({ ...postFormData, author: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>

              {/* Upload Ảnh Bìa Bài Viết Trực Tiếp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <ImageUploadField
                  label="Ảnh Bìa Bài Viết (Tin Tức)"
                  value={postFormData.thumbnail}
                  onChange={(url) => setPostFormData({ ...postFormData, thumbnail: url })}
                  folder="BLOG"
                  recommendedSize="1200x800px (Tỉ lệ 3:2)"
                  required
                  className="w-full"
                />
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Chú Thích Ảnh / Image Label</label>
                  <input
                    type="text"
                    value={postFormData.imageLabel}
                    onChange={(e) => setPostFormData({ ...postFormData, imageLabel: e.target.value })}
                    placeholder="Ví dụ: Ảnh: Khách mời tại khu vườn Botanica..."
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Tóm Tắt Ngắn</label>
                <textarea
                  rows={2}
                  value={postFormData.summary}
                  onChange={(e) => setPostFormData({ ...postFormData, summary: e.target.value })}
                  placeholder="Tóm tắt hiển thị ngoài danh sách bài viết..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs resize-none focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Nội Dung Chi Tiết</label>
                <textarea
                  rows={5}
                  value={postFormData.content}
                  onChange={(e) => setPostFormData({ ...postFormData, content: e.target.value })}
                  placeholder="Nội dung bài viết..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs resize-none focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Đánh giá của khách hàng đi kèm / Guest Review</label>
                <textarea
                  rows={3}
                  value={postFormData.guestReview}
                  onChange={(e) => setPostFormData({ ...postFormData, guestReview: e.target.value })}
                  placeholder="Ví dụ: 'Buổi học hôm nay rất thú vị, người hướng dẫn siêu dễ thương...' — Sarah, Úc."
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs resize-none focus:border-emerald-600 outline-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={postFormData.status === 'PUBLISHED'}
                    onChange={(e) =>
                      setPostFormData({
                        ...postFormData,
                        status: e.target.checked ? 'PUBLISHED' : 'DRAFT',
                      })
                    }
                    className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-stone-700">Xuất bản ngay lập tức</span>
                </label>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  {editingPostId ? 'Lưu Thay Đổi' : 'Xuất Bản Bài Viết'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FEEDBACK MODAL: Thêm / Sửa Đánh Giá Khách Hàng */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif font-black text-stone-900 text-lg">
                {editingFeedbackId ? 'Chỉnh Sửa Đánh Giá Khách Hàng' : 'Thêm Đánh Giá Mới'}
              </h3>
              <button
                onClick={() => setIsFeedbackModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFeedbackSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Họ & Tên Khách Hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={feedbackFormData.customerName}
                    onChange={(e) =>
                      setFeedbackFormData({ ...feedbackFormData, customerName: e.target.value })
                    }
                    placeholder="Ví dụ: Sarah Jenkins"
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Quốc Gia / Thành Phố</label>
                  <input
                    type="text"
                    value={feedbackFormData.location}
                    onChange={(e) =>
                      setFeedbackFormData({ ...feedbackFormData, location: e.target.value })
                    }
                    placeholder="Ví dụ: Sydney, Australia"
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Tour / Lớp Workshop Đã Trải Nghiệm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={feedbackFormData.tourName}
                  onChange={(e) =>
                    setFeedbackFormData({ ...feedbackFormData, tourName: e.target.value })
                  }
                  placeholder="Ví dụ: Lớp Làm Nến Thơm & Tranh Sỏi Thảo Mộc"
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-emerald-600 outline-none"
                />
              </div>

              {/* Rating Stars Interactive Selector */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Đánh Giá Sao ({feedbackFormData.rating}/5 sao)
                </label>
                <div className="flex items-center gap-1.5 p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackFormData({ ...feedbackFormData, rating: star })}
                      className="p-1 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= feedbackFormData.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-stone-700">
                    {feedbackFormData.rating === 5
                      ? 'Tuyệt vời (5★)'
                      : feedbackFormData.rating === 4
                      ? 'Rất tốt (4★)'
                      : feedbackFormData.rating === 3
                      ? 'Hài lòng (3★)'
                      : `${feedbackFormData.rating} sao`}
                  </span>
                </div>
              </div>

              {/* Avatar Image Upload Trực Tiếp */}
              <ImageUploadField
                label="Ảnh Đại Diện Của Khách"
                value={feedbackFormData.avatar}
                onChange={(url) => setFeedbackFormData({ ...feedbackFormData, avatar: url })}
                folder="OTHER"
                aspectRatio="square"
                recommendedSize="Hình vuông (300x300px)"
              />

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Nội Dung Cảm Nhận / Đánh Giá <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={feedbackFormData.comment}
                  onChange={(e) =>
                    setFeedbackFormData({ ...feedbackFormData, comment: e.target.value })
                  }
                  placeholder="Chia sẻ chân thực của khách hàng về trải nghiệm tại vườn..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs resize-none focus:border-emerald-600 outline-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={feedbackFormData.isApproved}
                    onChange={(e) =>
                      setFeedbackFormData({
                        ...feedbackFormData,
                        isApproved: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-stone-700">Duyệt hiển thị ngoài Website</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={feedbackFormData.isFeatured}
                    onChange={(e) =>
                      setFeedbackFormData({
                        ...feedbackFormData,
                        isFeatured: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-bold text-stone-700">Đánh dấu nổi bật</span>
                </label>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsFeedbackModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  {editingFeedbackId ? 'Cập Nhật Đánh Giá' : 'Thêm Đánh Giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PREVIEW ARTICLE (Xem chi tiết nội dung bài viết) */}
      {previewingPost && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="relative h-60 w-full bg-stone-100">
              <img
                src={previewingPost.thumbnail}
                alt={previewingPost.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setPreviewingPost(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer text-base font-bold shadow-md"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-5 flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full shadow-md ${
                    previewingPost.status === 'PUBLISHED'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-600 text-white'
                  }`}
                >
                  {previewingPost.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
                </span>
              </div>
            </div>

            {previewingPost.imageLabel && (
              <p className="text-[10px] text-stone-400 font-medium italic text-right px-6 mt-1.5">
                {previewingPost.imageLabel}
              </p>
            )}

            <div className="p-6 sm:p-8 space-y-4 pt-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                <span className="font-bold text-stone-800">{previewingPost.author}</span>
                <span>•</span>
                <span>{new Date(previewingPost.publishedAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span>•</span>
                <span>{(previewingPost.viewCount || 0).toLocaleString()} lượt đọc</span>
              </div>

              <div>
                {previewingPost.eyebrow && (
                  <span className="text-[10px] font-black tracking-widest text-emerald-700 uppercase block mb-1">
                    {previewingPost.eyebrow}
                  </span>
                )}
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-serif leading-snug">
                  {previewingPost.title}
                </h2>
              </div>

              <div className="bg-amber-50/80 border-l-4 border-amber-600 p-3.5 rounded-r-xl text-xs sm:text-sm text-stone-700 italic leading-relaxed">
                {previewingPost.summary}
              </div>

              <div className="text-stone-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-3 pt-2">
                {previewingPost.content}
              </div>

              {previewingPost.guestReview && (
                <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-2xl p-4 mt-5 space-y-2">
                  <span className="text-[9px] font-black uppercase text-emerald-800 tracking-wider block">
                    Đánh giá từ du khách / Guest Review
                  </span>
                  <p className="text-xs text-stone-600 italic">
                    "{previewingPost.guestReview}"
                  </p>
                </div>
              )}

              <div className="pt-6 border-t border-stone-200 flex items-center justify-between">
                <span className="text-[11px] text-stone-400 font-mono">
                  Slug: /{previewingPost.slug}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const postToEdit = previewingPost;
                      setPreviewingPost(null);
                      handleOpenEditPost(postToEdit);
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Chỉnh sửa bài này
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewingPost(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BANNER MODAL: Thêm / Sửa Banner Giao Diện */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-3xl p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif font-black text-stone-900 text-lg">
                {editingBannerId ? 'Chỉnh Sửa Banner Giao Diện' : 'Thêm Banner Mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsBannerModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Side */}
              <form onSubmit={handleSaveBannerSubmit} className="space-y-4 text-xs lg:col-span-7">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Nhãn phụ / Eyebrow / Label (Dòng 1) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bannerFormData.badgeText}
                    onChange={(e) =>
                      setBannerFormData({ ...bannerFormData, badgeText: e.target.value })
                    }
                    placeholder="Ví dụ: HOI AN · 2 KM FROM THE OLD TOWN"
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Tiêu đề chính / Title (Dòng 2) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bannerFormData.title}
                    onChange={(e) =>
                      setBannerFormData({ ...bannerFormData, title: e.target.value })
                    }
                    placeholder="Ví dụ: Slow down in a Hoi An Botanica Garden."
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Mô tả / Description / Subtitle (Dòng 3) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={bannerFormData.subtitle}
                    onChange={(e) =>
                      setBannerFormData({ ...bannerFormData, subtitle: e.target.value })
                    }
                    placeholder="Ví dụ: Spend two unhurried hours making something Vietnamese by hand — with a warm, English-speaking host, in a green garden away from the crowds."
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-emerald-600 outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Chữ trên nút (CTA Button)</label>
                    <input
                      type="text"
                      value={bannerFormData.buttonText}
                      onChange={(e) =>
                        setBannerFormData({ ...bannerFormData, buttonText: e.target.value })
                      }
                      placeholder="Ví dụ: Choose a workshop"
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-emerald-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Đường dẫn nút (CTA Link)</label>
                    <input
                      type="text"
                      value={bannerFormData.linkUrl}
                      onChange={(e) =>
                        setBannerFormData({ ...bannerFormData, linkUrl: e.target.value })
                      }
                      placeholder="Ví dụ: #workshops"
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-emerald-600 outline-none"
                    />
                  </div>
                </div>

                <ImageUploadField
                  label="Ảnh Nền Banner / Background Image"
                  value={bannerFormData.imageUrl}
                  onChange={(url) => setBannerFormData({ ...bannerFormData, imageUrl: url })}
                  folder="OTHER"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Thứ tự hiển thị</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={bannerFormData.order}
                      onChange={(e) =>
                        setBannerFormData({ ...bannerFormData, order: Number(e.target.value) })
                      }
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-emerald-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Trạng thái</label>
                    <select
                      value={bannerFormData.isActive ? 'active' : 'inactive'}
                      onChange={(e) =>
                        setBannerFormData({
                          ...bannerFormData,
                          isActive: e.target.value === 'active',
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-emerald-600 outline-none bg-white"
                    >
                      <option value="active">Hiển thị ngay</option>
                      <option value="inactive">Tạm ẩn</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsBannerModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 cursor-pointer text-xs"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer text-xs"
                  >
                    {editingBannerId ? 'Lưu Thay Đổi' : 'Thêm Mới Banner'}
                  </button>
                </div>
              </form>

              {/* Real-time Preview Side */}
              <div className="lg:col-span-5 space-y-3">
                <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  Xem Trước Trực Quan (Live Preview)
                </div>
                <div
                  className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-stone-900 text-white p-6 flex flex-col justify-end bg-cover bg-center border border-stone-200 shadow-sm"
                  style={{
                    backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.2)), url('${
                      bannerFormData.imageUrl || '/images/img_0.jpeg'
                    }')`,
                  }}
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">
                      {bannerFormData.badgeText || 'LABEL / EYEBROW'}
                    </span>
                    <h4 className="text-base font-serif font-bold leading-tight">
                      {bannerFormData.title || 'Tiêu Đề Banner...'}
                    </h4>
                    <p className="text-[11px] text-stone-300 line-clamp-3 leading-relaxed">
                      {bannerFormData.subtitle || 'Mô tả chi tiết banner...'}
                    </p>
                    {(bannerFormData.buttonText || bannerFormData.linkUrl) && (
                      <div className="pt-1.5">
                        <button
                          type="button"
                          className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] pointer-events-none"
                        >
                          {bannerFormData.buttonText || 'Button'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-stone-400 italic text-center">
                  Giao diện mô phỏng chính xác khung cảnh Hero Banner ngoài trang chủ.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
