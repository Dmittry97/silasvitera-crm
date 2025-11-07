import { useState } from 'react';
import axios from 'axios';

type ImageCategory = 'main' | 'back' | 'other';

interface ImageItem {
  url: string;
  filename: string;
  category: ImageCategory;
}

interface ImageUploadDnDProps {
  mainImage?: string;
  backImage?: string;
  otherImages?: string[];
  onUpdate: (data: { mainImage: string; backImage: string; otherImages: string[] }) => void;
}

export default function ImageUploadDnD({ mainImage, backImage, otherImages, onUpdate }: ImageUploadDnDProps) {
  const [uploading, setUploading] = useState(false);
  const [draggedItem, setDraggedItem] = useState<ImageItem | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<ImageCategory | null>(null);

  const images: ImageItem[] = [
    ...(mainImage ? [{ url: `/photos/${mainImage}`, filename: mainImage, category: 'main' as ImageCategory }] : []),
    ...(backImage ? [{ url: `/photos/${backImage}`, filename: backImage, category: 'back' as ImageCategory }] : []),
    ...(otherImages || []).map(img => ({ url: `/photos/${img}`, filename: img, category: 'other' as ImageCategory })),
  ];

  const handleUpload = async (files: FileList, category: ImageCategory) => {
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });
    formData.append('category', category);

    try {
      const response = await axios.post('/api/products/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedFilenames = response.data.filenames;

      if (category === 'main') {
        onUpdate({ mainImage: uploadedFilenames[0], backImage: backImage || '', otherImages: otherImages || [] });
      } else if (category === 'back') {
        onUpdate({ mainImage: mainImage || '', backImage: uploadedFilenames[0], otherImages: otherImages || [] });
      } else {
        onUpdate({ mainImage: mainImage || '', backImage: backImage || '', otherImages: [...(otherImages || []), ...uploadedFilenames] });
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Ошибка при загрузке изображений');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (filename: string, category: ImageCategory) => {
    if (category === 'main') {
      onUpdate({ mainImage: '', backImage: backImage || '', otherImages: otherImages || [] });
    } else if (category === 'back') {
      onUpdate({ mainImage: mainImage || '', backImage: '', otherImages: otherImages || [] });
    } else {
      onUpdate({ mainImage: mainImage || '', backImage: backImage || '', otherImages: (otherImages || []).filter(img => img !== filename) });
    }
  };

  const handleDragStart = (item: ImageItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent, category: ImageCategory) => {
    e.preventDefault();
    setDragOverCategory(category);
  };

  const handleDragLeave = () => {
    setDragOverCategory(null);
  };

  const handleDrop = (e: React.DragEvent, targetCategory: ImageCategory) => {
    e.preventDefault();
    setDragOverCategory(null);

    if (!draggedItem) return;

    const sourceCategory = draggedItem.category;
    const filename = draggedItem.filename;

    if (sourceCategory === targetCategory) {
      setDraggedItem(null);
      return;
    }

    let newMain = mainImage || '';
    let newBack = backImage || '';
    let newOther = [...(otherImages || [])];

    // Remove from source
    if (sourceCategory === 'main') {
      newMain = '';
    } else if (sourceCategory === 'back') {
      newBack = '';
    } else {
      newOther = newOther.filter(img => img !== filename);
    }

    // Add to target
    if (targetCategory === 'main') {
      if (newMain) {
        // If main already has image, swap them
        newOther.push(newMain);
      }
      newMain = filename;
    } else if (targetCategory === 'back') {
      if (newBack) {
        // If back already has image, swap them
        newOther.push(newBack);
      }
      newBack = filename;
    } else {
      newOther.push(filename);
    }

    onUpdate({ mainImage: newMain, backImage: newBack, otherImages: newOther });
    setDraggedItem(null);
  };

  const renderCategory = (category: ImageCategory, label: string, allowMultiple: boolean) => {
    const categoryImages = images.filter(img => img.category === category);
    const isDragOver = dragOverCategory === category;

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-900">{label}</label>
        <div
          onDragOver={(e) => handleDragOver(e, category)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, category)}
          className={`min-h-[120px] p-4 rounded-lg border-2 border-dashed transition-colors ${
            isDragOver
              ? 'border-neutral-900 bg-neutral-50'
              : 'border-neutral-300 hover:border-neutral-400'
          }`}
        >
          {categoryImages.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {categoryImages.map((img) => (
                <div
                  key={img.filename}
                  draggable
                  onDragStart={() => handleDragStart(img)}
                  className="relative w-24 h-24 rounded-lg overflow-hidden border border-neutral-200 cursor-move hover:border-neutral-900 transition-colors group"
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemove(img.filename, category)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-400 text-sm">
              Перетащите сюда изображение
            </div>
          )}

          <input
            type="file"
            id={`upload-${category}`}
            multiple={allowMultiple}
            accept="image/*"
            onChange={(e) => e.target.files && handleUpload(e.target.files, category)}
            className="hidden"
            disabled={uploading}
          />
          <label
            htmlFor={`upload-${category}`}
            className={`block mt-3 w-full px-4 py-2 rounded-lg border border-neutral-300 hover:border-neutral-900 transition-colors text-center cursor-pointer text-sm text-neutral-600 ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? 'Загрузка...' : allowMultiple ? 'Добавить файлы' : 'Выбрать файл'}
          </label>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-neutral-900">Изображения товара</h3>
      <p className="text-sm text-neutral-600">Перетаскивайте изображения между категориями для изменения</p>
      
      {renderCategory('main', 'Обложка (главное фото)', false)}
      {renderCategory('back', 'Спина (фото при наведении)', false)}
      {renderCategory('other', 'Остальные фото (галерея)', true)}
    </div>
  );
}
