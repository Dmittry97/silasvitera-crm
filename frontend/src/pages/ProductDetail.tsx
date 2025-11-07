import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';

type Product = {
  _id: string;
  title: string;
  article?: string;
  price: number;
  mainImage?: string;
  backImage?: string;
  otherImages?: string[];
  sizes?: string[];
  colors?: string[];
  description?: string;
  stock: number;
  isReserved?: boolean;
  reservedUntil?: string;
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userId] = useState(() => {
    let id = localStorage.getItem('reservation_user_id');
    if (!id) {
      id = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('reservation_user_id', id);
    }
    return id;
  });

  useEffect(() => {
    if (!id) return;
    axios.get(`/api/products/${id}`)
      .then(res => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        navigate('/');
      });
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Пожалуйста, выберите размер');
      return;
    }

    // Reserve product first
    try {
      await axios.post(`/api/products/${product._id}/reserve`, { userId });
      setShowConfirmModal(true);
    } catch (error: any) {
      if (error.response?.status === 400) {
        alert('Этот товар уже забронирован другим пользователем');
      } else {
        alert('Ошибка при бронировании товара');
      }
    }
  };

  const confirmAddToCart = () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const item = {
      id: product._id,
      title: product.title,
      price: product.price,
      image: product.mainImage ? `/api/photos/${product.mainImage}` : undefined,
      size: selectedSize,
      quantity: 1,
    };
    const existing = cart.findIndex((i: any) => i.id === item.id && i.size === item.size);
    if (existing >= 0) {
      cart[existing].quantity += 1;
    } else {
      cart.push(item);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    setShowConfirmModal(false);
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-neutral-200 rounded-lg" />
          <div className="space-y-6">
            <div className="h-8 bg-neutral-200 rounded w-3/4" />
            <div className="h-6 bg-neutral-200 rounded w-1/4" />
            <div className="h-24 bg-neutral-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  // Build images array from new structure
  const allImages: string[] = [];
  if (product.mainImage) allImages.push(`/api/photos/${product.mainImage}`);
  if (product.backImage) allImages.push(`/api/photos/${product.backImage}`);
  if (product.otherImages) allImages.push(...product.otherImages.map(img => `/api/photos/${img}`));
  
  const displayImages = allImages;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <button
        onClick={() => navigate('/')}
        className="mb-8 text-sm text-neutral-600 hover:text-neutral-900 transition-colors flex items-center gap-2"
      >
        ← Назад к каталогу
      </button>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-neutral-100 rounded-lg overflow-hidden">
            <img
              src={displayImages[selectedImage] || ''}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          {displayImages.length > 1 && (
            <div className="grid grid-cols-6 gap-2">
              {displayImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === idx ? 'border-neutral-900' : 'border-transparent hover:border-neutral-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">{product.title}</h1>
            <p className="text-2xl font-semibold text-neutral-900">{product.price.toLocaleString('ru-RU')} ₽</p>
          </div>

          {product.description && (
            <div className="prose prose-sm text-neutral-600 whitespace-pre-wrap">
              {product.description}
            </div>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-3">Размер</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-3 rounded-lg border-2 transition-all font-medium ${
                      selectedSize === size
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-300 hover:border-neutral-900'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            {product.isReserved ? (
              <div className="w-full bg-neutral-200 text-neutral-600 px-8 py-4 rounded-lg text-center font-semibold cursor-not-allowed">
                Товар забронирован
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize && product.sizes && product.sizes.length > 0}
                className="w-full bg-neutral-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Добавить в корзину
              </button>
            )}
          </div>

          <div className="border-t pt-6 space-y-2 text-sm text-neutral-600">
            <p>• Доставка по всей России</p>
            <p>• Возврат в течение 14 дней</p>
            <p>• Оплата при получении</p>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onConfirm={confirmAddToCart}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
}
