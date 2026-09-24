import React, { useState, useMemo } from 'react';
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
    }
  );
  const [isSavedConfig, setIsSavedConfig] = useState(false);

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-150">
          {banners.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow"
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
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-stone-900">{b.title}</h4>
                  <p className="text-xs text-stone-500">{b.subtitle}</p>
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
          ))}
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
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
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

            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[11px] text-stone-400 font-medium mr-1">Chuyên mục:</span>
              <button
                type="button"
                onClick={() => setPostCategoryFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  postCategoryFilter === 'ALL'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Tất cả ({posts.length})
              </button>
              {uniquePostCategories.map((cat) => {
                const count = posts.filter((p) => p.category === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setPostCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      postCategoryFilter === cat
                        ? 'bg-emerald-800 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
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
                      <th className="py-3 px-4">Chuyên Mục</th>
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
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                            {p.category}
                          </span>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Danh Mục</label>
                  <select
                    value={postFormData.category}
                    onChange={(e) => setPostFormData({ ...postFormData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs bg-white focus:border-emerald-600 outline-none"
                  >
                    <option value="Phát Triển Bền Vững">Phát Triển Bền Vững</option>
                    <option value="Cộng Đồng & Xã Hội">Cộng Đồng & Xã Hội</option>
                    <option value="Cẩm Nang Du Lịch">Cẩm Nang Du Lịch</option>
                    <option value="Văn Hóa Phố Hội">Văn Hóa Phố Hội</option>
                  </select>
                </div>
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
              <ImageUploadField
                label="Ảnh Bìa Bài Viết (Tin Tức)"
                value={postFormData.thumbnail}
                onChange={(url) => setPostFormData({ ...postFormData, thumbnail: url })}
                folder="BLOG"
                recommendedSize="1200x800px (Tỉ lệ 3:2)"
                required
              />

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
                <span className="bg-white/95 backdrop-blur-xs text-emerald-900 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  {previewingPost.category}
                </span>
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

            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                <span className="font-bold text-stone-800">{previewingPost.author}</span>
                <span>•</span>
                <span>{new Date(previewingPost.publishedAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span>•</span>
                <span>{(previewingPost.viewCount || 0).toLocaleString()} lượt đọc</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-serif leading-snug">
                {previewingPost.title}
              </h2>

              <div className="bg-amber-50/80 border-l-4 border-amber-600 p-3.5 rounded-r-xl text-xs sm:text-sm text-stone-700 italic leading-relaxed">
                {previewingPost.summary}
              </div>

              <div className="text-stone-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-3 pt-2">
                {previewingPost.content}
              </div>

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
    </div>
  );
};
