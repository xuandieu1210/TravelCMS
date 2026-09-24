import React, { useState } from 'react';
import { Image as ImageIcon, Upload, Folder, Copy, Check, Trash2, ExternalLink, Sparkles } from 'lucide-react';

export const MediaView: React.FC = () => {
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [mediaItems, setMediaItems] = useState([
    {
      id: 'med-1',
      title: 'Jeep Tour Mỹ Sơn',
      folder: 'tours',
      url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
      size: '1.4 MB',
      dimensions: '1920x1080',
      date: '2026-03-20',
    },
    {
      id: 'med-2',
      title: 'Thuyền Thúng Rừng Dừa Cẩm Thanh',
      folder: 'tours',
      url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80',
      size: '1.8 MB',
      dimensions: '2048x1365',
      date: '2026-03-18',
    },
    {
      id: 'med-3',
      title: 'Workshop Tái Chế Rác Hữu Cơ BSF',
      folder: 'services',
      url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
      size: '980 KB',
      dimensions: '1600x1066',
      date: '2026-03-15',
    },
    {
      id: 'med-4',
      title: 'Đạp Xe Khám Phá Nông Thôn Cẩm Kim',
      folder: 'tours',
      url: 'https://images.unsplash.com/photo-1508873696983-2df57046475a?auto=format&fit=crop&w=1200&q=80',
      size: '1.2 MB',
      dimensions: '1800x1200',
      date: '2026-03-10',
    },
    {
      id: 'med-5',
      title: 'Trồng Cây Bản Địa Phục Hồi Sinh Thái',
      folder: 'blog',
      url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      size: '1.1 MB',
      dimensions: '1600x1066',
      date: '2026-03-05',
    },
    {
      id: 'med-6',
      title: 'Dự Án Soap For Hope Hội An',
      folder: 'blog',
      url: 'https://images.unsplash.com/photo-1607006483702-34f404d5500e?auto=format&fit=crop&w=800&q=80',
      size: '850 KB',
      dimensions: '1200x800',
      date: '2026-02-28',
    },
    {
      id: 'med-7',
      title: 'Xe Jeep Quân Sự Cổ Điển Mui Trần',
      folder: 'services',
      url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
      size: '1.3 MB',
      dimensions: '1500x1000',
      date: '2026-02-20',
    },
    {
      id: 'med-8',
      title: 'Banner Hero Du Lịch Bền Vững',
      folder: 'banners',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
      size: '2.4 MB',
      dimensions: '2560x1440',
      date: '2026-02-15',
    },
  ]);

  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageTitle, setNewImageTitle] = useState('');
  const [newImageFolder, setNewImageFolder] = useState('tours');

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl || !newImageTitle) return;

    setMediaItems([
      {
        id: 'med-' + Date.now(),
        title: newImageTitle,
        folder: newImageFolder,
        url: newImageUrl,
        size: '1.2 MB',
        dimensions: '1920x1080',
        date: new Date().toISOString().slice(0, 10),
      },
      ...mediaItems,
    ]);

    setNewImageUrl('');
    setNewImageTitle('');
  };

  const filteredMedia = mediaItems.filter(
    (m) => selectedFolder === 'all' || m.folder === selectedFolder
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-stone-900 font-serif tracking-tight">
            Quản Lý Thư Viện Media
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Lưu trữ hình ảnh, video chất lượng cao cho các tour du lịch sinh thái và bài viết.
          </p>
        </div>

        <div className="text-xs text-stone-500 font-medium">
          Dung lượng: <strong className="text-emerald-800">11.6 MB / 5 GB</strong> (Cloud Storage)
        </div>
      </div>

      {/* Upload Box */}
      <form onSubmit={handleAddMedia} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
        <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
          <Upload className="w-4 h-4 text-emerald-700" />
          <span>Thêm Ảnh / Media Mới Vào Hệ Thống</span>
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-4">
            <input
              type="text"
              required
              value={newImageTitle}
              onChange={(e) => setNewImageTitle(e.target.value)}
              placeholder="Tên gợi nhớ ảnh (vd: Jeep Tour hoàng hôn...)"
              className="w-full p-2 rounded-xl border border-stone-200 text-xs"
            />
          </div>
          <div className="sm:col-span-5">
            <input
              type="url"
              required
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Nhập URL ảnh (Unsplash, Cloudinary, AWS S3...)"
              className="w-full p-2 rounded-xl border border-stone-200 text-xs"
            />
          </div>
          <div className="sm:col-span-2">
            <select
              value={newImageFolder}
              onChange={(e) => setNewImageFolder(e.target.value)}
              className="w-full p-2 rounded-xl border border-stone-200 text-xs bg-white"
            >
              <option value="tours">Thư mục Tours</option>
              <option value="services">Thư mục Services</option>
              <option value="banners">Thư mục Banners</option>
              <option value="blog">Thư mục Blog</option>
            </select>
          </div>
          <div className="sm:col-span-1">
            <button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-3 rounded-xl text-xs transition-colors"
            >
              Lưu
            </button>
          </div>
        </div>
      </form>

      {/* Folder Navigation */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedFolder('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            selectedFolder === 'all'
              ? 'bg-emerald-700 text-white'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Folder className="w-3.5 h-3.5" />
          <span>Tất Cả ({mediaItems.length})</span>
        </button>

        <button
          onClick={() => setSelectedFolder('tours')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            selectedFolder === 'tours'
              ? 'bg-emerald-700 text-white'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Folder className="w-3.5 h-3.5" />
          <span>Tours ({mediaItems.filter((m) => m.folder === 'tours').length})</span>
        </button>

        <button
          onClick={() => setSelectedFolder('services')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            selectedFolder === 'services'
              ? 'bg-emerald-700 text-white'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Folder className="w-3.5 h-3.5" />
          <span>Dịch Vụ ({mediaItems.filter((m) => m.folder === 'services').length})</span>
        </button>

        <button
          onClick={() => setSelectedFolder('banners')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            selectedFolder === 'banners'
              ? 'bg-emerald-700 text-white'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Folder className="w-3.5 h-3.5" />
          <span>Banners ({mediaItems.filter((m) => m.folder === 'banners').length})</span>
        </button>

        <button
          onClick={() => setSelectedFolder('blog')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            selectedFolder === 'blog'
              ? 'bg-emerald-700 text-white'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Folder className="w-3.5 h-3.5" />
          <span>Blog ({mediaItems.filter((m) => m.folder === 'blog').length})</span>
        </button>
      </div>

      {/* Media Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMedia.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs group flex flex-col justify-between"
          >
            <div className="relative h-44 overflow-hidden bg-stone-100">
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 left-2 bg-stone-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                {item.folder}
              </div>
            </div>

            <div className="p-3">
              <h4 className="text-xs font-bold text-stone-900 truncate mb-1" title={item.title}>
                {item.title}
              </h4>
              <div className="flex items-center justify-between text-[10px] text-stone-400">
                <span>{item.dimensions}</span>
                <span>{item.size}</span>
              </div>
            </div>

            <div className="p-2.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
              <button
                onClick={() => handleCopyLink(item.url, item.id)}
                className="text-[11px] font-bold text-stone-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
              >
                {copiedId === item.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Đã copy!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  if (confirm(`Xóa ảnh "${item.title}"?`)) {
                    setMediaItems(mediaItems.filter((m) => m.id !== item.id));
                  }
                }}
                className="p-1 text-stone-400 hover:text-red-700 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
