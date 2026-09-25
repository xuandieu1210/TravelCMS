import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Upload, Folder, Copy, Check, Trash2, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { dataStore } from '../../services/dataStore';
import { MediaFile } from '../../types';

export const MediaView: React.FC = () => {
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageTitle, setNewImageTitle] = useState('');
  const [newImageFolder, setNewImageFolder] = useState<MediaFile['folder']>('TOURS');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = async () => {
    setIsLoading(true);
    try {
      const files = await apiClient.getAdminMedia();
      setMediaItems(files || []);
    } catch (err) {
      console.error('Lỗi khi tải thư viện media:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
    const unsubscribe = dataStore.subscribe(() => {
      loadMedia();
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddMediaUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl || !newImageTitle) return;

    setIsUploading(true);
    try {
      await apiClient.uploadAdminMedia({
        name: newImageTitle,
        url: newImageUrl,
        folder: newImageFolder,
        sizeKb: 500,
        mimeType: 'image/jpeg',
      });
      setNewImageUrl('');
      setNewImageTitle('');
      await loadMedia();
    } catch (err) {
      console.error('Lỗi upload media:', err);
      alert('Không thể tải lên media, vui lòng thử lại!');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        await apiClient.uploadAdminMedia({
          name: file.name,
          url: base64,
          folder: newImageFolder,
          sizeKb: Math.round(file.size / 1024),
          mimeType: file.type || 'image/jpeg',
        });
        await loadMedia();
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Lỗi khi tải tệp:', err);
      alert('Tải tệp thất bại!');
      setIsUploading(false);
    }
  };

  const handleDeleteMedia = async (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa tệp media "${name}"?`)) {
      await apiClient.deleteAdminMedia(id);
      await loadMedia();
    }
  };

  const handleClearAll = async () => {
    if (confirm('XÁC NHẬN: Bạn có chắc chắn muốn XÓA HẾT TẤT CẢ hình ảnh trong thư viện media?')) {
      await apiClient.clearAllAdminMedia();
      await loadMedia();
    }
  };

  const filteredMedia = mediaItems.filter(
    (m) => selectedFolder === 'all' || m.folder.toLowerCase() === selectedFolder.toLowerCase()
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-stone-900 font-serif tracking-tight">
            Quản lý thư viện phương tiện
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Lưu trữ hình ảnh, video chất lượng cao. Ảnh mới nhất trong media sẽ được sử dụng tự động trên portal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {mediaItems.length > 0 && (
            <button
              onClick={handleClearAll}
              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa Hết Media ({mediaItems.length})</span>
            </button>
          )}

          <div className="text-xs text-stone-500 font-medium">
            Tổng số: <strong className="text-emerald-800">{mediaItems.length} tệp</strong>
          </div>
        </div>
      </div>

      {/* Upload Box */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-emerald-700" />
            <span>Thêm / Tải Ảnh Mới Vào Thư Viện</span>
          </span>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold py-1.5 px-3 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-700" />
            <span>Tải tệp từ máy tính</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
        </div>

        <form onSubmit={handleAddMediaUrl} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-4">
            <input
              type="text"
              required
              value={newImageTitle}
              onChange={(e) => setNewImageTitle(e.target.value)}
              placeholder="Tên gợi nhớ ảnh (vd: Jeep Tour hoàng hôn...)"
              className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-emerald-600 outline-none"
            />
          </div>
          <div className="sm:col-span-5">
            <input
              type="url"
              required
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Nhập URL ảnh (Unsplash, Cloudinary, S3...)"
              className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:border-emerald-600 outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <select
              value={newImageFolder}
              onChange={(e) => setNewImageFolder(e.target.value as MediaFile['folder'])}
              className="w-full p-2.5 rounded-xl border border-stone-200 text-xs bg-white outline-none focus:border-emerald-600"
            >
              <option value="TOURS">Thư mục Tours</option>
              <option value="SERVICES">Thư mục Services</option>
              <option value="BANNERS">Thư mục Banners</option>
              <option value="BLOG">Thư mục Blog</option>
              <option value="OTHER">Thư mục Khác</option>
            </select>
          </div>
          <div className="sm:col-span-1">
            <button
              type="submit"
              disabled={isUploading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>

      {/* Folder Navigation */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedFolder('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
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
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            selectedFolder === 'tours'
              ? 'bg-emerald-700 text-white'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Folder className="w-3.5 h-3.5" />
          <span>Tours ({mediaItems.filter((m) => m.folder.toLowerCase() === 'tours').length})</span>
        </button>

        <button
          onClick={() => setSelectedFolder('services')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            selectedFolder === 'services'
              ? 'bg-emerald-700 text-white'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Folder className="w-3.5 h-3.5" />
          <span>Dịch Vụ ({mediaItems.filter((m) => m.folder.toLowerCase() === 'services').length})</span>
        </button>

        <button
          onClick={() => setSelectedFolder('banners')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            selectedFolder === 'banners'
              ? 'bg-emerald-700 text-white'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Folder className="w-3.5 h-3.5" />
          <span>Banners ({mediaItems.filter((m) => m.folder.toLowerCase() === 'banners').length})</span>
        </button>

        <button
          onClick={() => setSelectedFolder('blog')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            selectedFolder === 'blog'
              ? 'bg-emerald-700 text-white'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Folder className="w-3.5 h-3.5" />
          <span>Blog ({mediaItems.filter((m) => m.folder.toLowerCase() === 'blog').length})</span>
        </button>
      </div>

      {/* Media Gallery Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-stone-500 text-xs">Đang tải thư viện media...</div>
      ) : filteredMedia.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-stone-800 mb-1">Thư viện media đang trống</h3>
          <p className="text-xs text-stone-500 max-w-sm mb-4">
            Tất cả hình ảnh đã được xóa. Tải lên tệp hoặc thêm URL hình ảnh mới ở trên để hiển thị trên website.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item, idx) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs group flex flex-col justify-between relative"
            >
              {idx === 0 && selectedFolder === 'all' && (
                <div className="absolute top-2 right-2 z-10 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Mới nhất (Dùng cho Portal)</span>
                </div>
              )}

              <div className="relative h-44 overflow-hidden bg-stone-100">
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 bg-stone-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  {item.folder}
                </div>
              </div>

              <div className="p-3">
                <h4 className="text-xs font-bold text-stone-900 truncate mb-1" title={item.name}>
                  {item.name}
                </h4>
                <div className="flex items-center justify-between text-[10px] text-stone-400">
                  <span>{item.sizeKb ? `${item.sizeKb} KB` : 'Media'}</span>
                  <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : ''}</span>
                </div>
              </div>

              <div className="p-2.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => handleCopyLink(item.url, item.id)}
                  className="text-[11px] font-bold text-stone-600 hover:text-emerald-700 flex items-center gap-1 transition-colors cursor-pointer"
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
                  onClick={() => handleDeleteMedia(item.id, item.name)}
                  className="p-1 text-stone-400 hover:text-red-700 rounded transition-colors cursor-pointer"
                  title="Xóa ảnh"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
