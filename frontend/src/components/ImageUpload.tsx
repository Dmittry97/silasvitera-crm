import { useState } from 'react';
import axios from 'axios';

type ImageUploadProps = {
  label: string;
  category: 'main' | 'back' | 'other';
  multiple?: boolean;
  onUpload: (filenames: string[]) => void;
  currentImages?: string[];
};

export default function ImageUpload({ label, category, multiple = false, onUpload, currentImages = [] }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string[]>(currentImages);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      formData.append('category', category);

      const response = await axios.post('/api/products/upload/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const filenames = response.data.files.map((f: any) => f.filename);
      
      // Create preview URLs
      const previewUrls = filenames.map((name: string) => `/silasvitera/api/photos/${name}`);
      setPreview(multiple ? [...preview, ...previewUrls] : previewUrls);
      
      onUpload(filenames);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Ошибка при загрузке файлов');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newPreview = preview.filter((_, i) => i !== index);
    setPreview(newPreview);
    onUpload(newPreview.map(url => url.replace('/silasvitera/api/photos/', '')));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-900 mb-2">{label}</label>
      
      {/* Preview */}
      {preview.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-3">
          {preview.map((url, index) => (
            <div key={index} className="relative aspect-square bg-neutral-100 rounded-lg overflow-hidden group">
              <img 
                src={url.startsWith('http') ? url : `http://localhost:4000${url}`} 
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-600 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {(multiple || preview.length === 0) && (
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id={`upload-${category}`}
          />
          <label
            htmlFor={`upload-${category}`}
            className={`block w-full px-4 py-3 rounded-lg border-2 border-dashed border-neutral-300 hover:border-neutral-900 transition-colors text-center cursor-pointer ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? (
              <span className="text-neutral-600">Загрузка...</span>
            ) : (
              <span className="text-neutral-600">
                {multiple ? 'Выберите файлы' : 'Выберите файл'}
              </span>
            )}
          </label>
        </div>
      )}
    </div>
  );
}
