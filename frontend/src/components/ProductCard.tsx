import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

type Props = {
  id: string;
  title: string;
  price: number;
  image?: string;
  images?: string[];
  isReserved?: boolean;
};

export default function ProductCard({ id, title, price, image, images, isReserved }: Props) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  // Use second image on hover, or random if only one image
  const displayImage = isHovered && images && images.length > 1 
    ? images[1] 
    : image;

  return (
    <div 
      onClick={() => navigate(`/product/${id}`)} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer"
    >
      <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden rounded-lg shadow-sm hover:shadow-xl transition-all duration-500">
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={title} 
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-neutral-400 text-sm">Нет фото</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Reserved Badge */}
        {isReserved && (
          <div className="absolute top-3 left-3 bg-neutral-200 text-neutral-600 px-3 py-1 rounded-lg text-sm font-semibold shadow-lg">
            Забронировано
          </div>
        )}
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="text-sm font-medium text-neutral-900 truncate group-hover:text-neutral-600 transition-colors" title={title}>
          {title}
        </h3>
        <p className="text-base font-semibold text-neutral-900">
          {price.toLocaleString('ru-RU')} ₽
        </p>
      </div>
    </div>
  );
}
