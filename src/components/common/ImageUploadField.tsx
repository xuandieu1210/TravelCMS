import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Link as LinkIcon, Trash2, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { MediaFile } from '../../types';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: MediaFile['folder'];
  recommendedSize?: string;
  required?: boolean;
  aspectRatio?: 'video' | 'square' | 'banner' | 'auto';
  className?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  folder = 'OTHER',
  recommendedSize,
  required = false,
  aspectRatio = 'video',
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress and read image file to Base64
  const processImageFile = async (file: File): Promise<{ base64: string; filename: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Max dimension 1920px
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
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.85);
            resolve({
              base64: optimizedBase64,
              filename: file.name.replace(/\.[^/.]+$/, '') + '.jpg',
            });
          } else {
            resolve({
              base64: e.target?.result as string,
              filename: file.name,
            });
          }
        };
        img.onerror = () => {
          resolve({
            base64: e.target?.result as string,
            filename: file.name,
          });
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelected = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WEBP, GIF)');
      return;
    }

    setIsUploading(true);
    try {
      const { base64, filename } = await processImageFile(file);
      // Upload to server or store locally
      const uploadedUrl = await apiClient.uploadImage({
        filename,
        base64Data: base64,
        folder,
      });
      onChange(uploadedUrl || base64);
    } catch (err) {
      console.error('Lỗi khi tải ảnh lên:', err);
      alert('Không thể xử lý hình ảnh, vui lòng thử lại');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const getAspectClasses = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square max-w-[140px]';
      case 'banner':
        return 'aspect-[21/9] max-h-40';
      case 'video':
      default:
        return 'aspect-video max-h-44';
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-stone-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex items-center gap-2">
          {recommendedSize && (
            <span className="text-[10px] text-stone-400 font-medium">
              Gợi ý: {recommendedSize}
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-0.5"
          >
            <LinkIcon className="w-3 h-3" />
            <span>{showUrlInput ? 'Ẩn link URL' : 'Nhập URL'}</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelected(e.target.files[0]);
          }
        }}
      />

      {/* Optional Direct URL Input */}
      {showUrlInput && (
        <div className="flex gap-2 animate-in fade-in duration-150">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://images.unsplash.com/... hoặc link ảnh"
            className="flex-1 p-2 rounded-xl border border-stone-200 text-xs focus:border-emerald-600 outline-none"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-2 text-stone-400 hover:text-red-600 rounded-lg"
              title="Xóa link"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Image Preview & Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl overflow-hidden transition-all ${
          dragOver
            ? 'border-emerald-500 bg-emerald-50/50'
            : value
            ? 'border-stone-200 bg-stone-50'
            : 'border-stone-300 bg-stone-50/60 hover:bg-stone-50 hover:border-emerald-400'
        }`}
      >
        {value ? (
          <div className="relative group">
            <div className={`w-full overflow-hidden ${getAspectClasses()}`}>
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Hover overlay with action buttons */}
            <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-white text-stone-900 text-xs font-bold px-3 py-1.5 rounded-xl shadow-md hover:bg-emerald-50 flex items-center gap-1.5 transition-all"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-700" />
                <span>Đổi ảnh khác</span>
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md hover:bg-red-700 flex items-center gap-1 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Gỡ ảnh</span>
              </button>
            </div>

            {/* Success badge */}
            <div className="absolute top-2 left-2 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs">
              <CheckCircle2 className="w-3 h-3" />
              <span>Đã chọn ảnh</span>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`p-5 flex flex-col items-center justify-center cursor-pointer text-center ${getAspectClasses()}`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 text-emerald-700">
                <Loader2 className="w-7 h-7 animate-spin" />
                <span className="text-xs font-bold">Đang tải ảnh lên server...</span>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2 shadow-2xs group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-stone-800">
                  Nhấn để tải ảnh trực tiếp từ máy tính
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  hoặc kéo & thả tệp hình ảnh vào khung này (PNG, JPG, WEBP)
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
