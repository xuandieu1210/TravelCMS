import React, { useState, useRef } from 'react';
import { Upload, Plus, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
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
        {recommendedSize && (
          <span className="text-[10px] text-stone-400 font-medium">Gợi ý: {recommendedSize}</span>
        )}
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
    </div>
  );
};
