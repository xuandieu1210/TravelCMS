import React, { useState, useRef, useEffect } from 'react';
import { Upload, Plus, Trash2, Image as ImageIcon, Loader2, Search, X } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { MediaFile } from '../../types';

interface MultiImageUploadFieldProps {
  label: string;
  images: string[];
  onChange: (images: string[]) => void;
  folder?: MediaFile['folder'];
  recommendedSize?: string;
  maxImages?: number;
}

export const MultiImageUploadField: React.FC<MultiImageUploadFieldProps> = ({
  label,
  images,
  onChange,
  folder = 'TOURS',
  recommendedSize = '1200x800px',
  maxImages = 12,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [mediaList, setMediaList] = useState<MediaFile[]>([]);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerFolder, setPickerFolder] = useState<string>('all');
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);

  const fetchMediaList = async () => {
    setIsLoadingMedia(true);
    try {
      const list = await apiClient.getAdminMedia();
      setMediaList(list || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách media:', err);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const processAndUploadFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const img = new Image();
        img.onload = async () => {
          const maxDim = 1920;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          let base64 = e.target?.result as string;
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            base64 = canvas.toDataURL('image/jpeg', 0.85);
          }
          try {
            const uploadedUrl = await apiClient.uploadImage({
              filename: file.name.replace(/\.[^/.]+$/, '') + '.jpg',
              base64Data: base64,
              folder,
            });
            resolve(uploadedUrl || base64);
          } catch {
            resolve(base64);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const uploadPromises: Promise<string>[] = [];
      for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith('image/')) {
          uploadPromises.push(processAndUploadFile(files[i]));
        }
      }
      const newUrls = await Promise.all(uploadPromises);
      onChange([...images, ...newUrls].slice(0, maxImages));
    } catch (err) {
      console.error('Lỗi khi tải ảnh album:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-stone-700">
          {label} ({images.length}/{maxImages})
        </label>
        <div className="flex items-center gap-2">
          {recommendedSize && (
            <span className="text-[10px] text-stone-400 font-medium">Gợi ý: {recommendedSize}</span>
          )}
          <button
            type="button"
            onClick={() => {
              setIsPickerOpen(true);
              fetchMediaList();
            }}
            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-0.5"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Chọn từ Thư viện</span>
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFilesSelected(e.target.files)}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
        {images.map((url, idx) => (
          <div
            key={idx}
            className="group relative aspect-video rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shadow-2xs"
          >
            <img src={url} alt={`Album ${idx + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemoveImage(idx)}
              className="absolute top-1 right-1 p-1 rounded-lg bg-red-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
              title="Xóa ảnh này"
            >
              <Trash2 className="w-3 h-3" />
            </button>
            <span className="absolute bottom-1 left-1 bg-stone-900/70 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
              #{idx + 1}
            </span>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="aspect-video rounded-xl border-2 border-dashed border-stone-300 hover:border-emerald-500 hover:bg-emerald-50/50 flex flex-col items-center justify-center p-2 text-stone-500 hover:text-emerald-700 transition-all cursor-pointer"
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-emerald-700" />
            ) : (
              <>
                <Plus className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-bold">Thêm ảnh</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Media Picker Modal */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-stone-200 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-stone-900 text-base">
                    Chọn Ảnh từ Thư Viện Media
                  </h3>
                  <p className="text-xs text-stone-500">
                    Sử dụng các tài nguyên hình ảnh đã tải lên hệ thống trước đó
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="py-4 flex flex-col sm:flex-row gap-3 items-center justify-between border-b border-stone-100">
              {/* Folder filters */}
              <div className="flex flex-wrap gap-1.5 p-1 bg-stone-100 rounded-xl w-full sm:w-auto">
                {['all', 'TOURS', 'SERVICES', 'BLOG', 'BANNERS', 'MARKETING', 'OTHER'].map((folderName) => (
                  <button
                    key={folderName}
                    type="button"
                    onClick={() => setPickerFolder(folderName)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      pickerFolder === folderName
                        ? 'bg-white text-stone-900 shadow-2xs'
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    {folderName === 'all' ? 'Tất cả' : folderName}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Tìm tên hình ảnh..."
                  className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-stone-400"
                />
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto py-4 min-h-[250px]">
              {isLoadingMedia ? (
                <div className="flex flex-col items-center justify-center py-20 text-emerald-700">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <span className="text-xs font-bold">Đang tải danh sách ảnh...</span>
                </div>
              ) : (
                (() => {
                  const filtered = mediaList.filter((item) => {
                    const matchesSearch = item.name.toLowerCase().includes(pickerSearch.toLowerCase());
                    const matchesFolder = pickerFolder === 'all' || item.folder === pickerFolder;
                    return matchesSearch && matchesFolder;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-16 text-stone-400 text-xs font-medium">
                        Không tìm thấy ảnh nào trong thư mục này.
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {filtered.map((item) => {
                        const isSelected = images.includes(item.url);
                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              if (isSelected) {
                                onChange(images.filter(img => img !== item.url));
                              } else {
                                if (images.length >= maxImages) {
                                  alert(`Chỉ được chọn tối đa ${maxImages} ảnh`);
                                  return;
                                }
                                onChange([...images, item.url]);
                              }
                            }}
                            className={`group border rounded-2xl overflow-hidden bg-white hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between ${
                              isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-stone-200'
                            }`}
                          >
                            <div className="relative aspect-video overflow-hidden bg-stone-100">
                              <img
                                src={item.url}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-2 left-2 bg-stone-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                                {item.folder}
                              </div>
                              {isSelected && (
                                <div className="absolute inset-0 bg-emerald-900/20 backdrop-blur-xs flex items-center justify-center">
                                  <div className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                                    Đang chọn
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="p-2.5">
                              <h4 className="text-[11px] font-bold text-stone-800 truncate" title={item.name}>
                                {item.name}
                              </h4>
                              <p className="text-[9px] text-stone-400 mt-0.5">
                                {item.sizeKb ? `${item.sizeKb} KB` : ''}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition-colors"
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
