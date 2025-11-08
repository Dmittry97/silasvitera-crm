import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ImageUploadDnD from '../../components/ImageUploadDnD';

type Product = {
  _id: string;
  title: string;
  article?: string;
  price: number;
  stock: number;
  mainImage?: string;
  backImage?: string;
  otherImages?: string[];
  category?: string;
  sizes?: string[];
  description?: string;
};

type Settings = {
  categories: string[];
  sizes: string[];
};

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings>({ categories: [], sizes: [] });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [productsRes, settingsRes] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/settings'),
      ]);
      setProducts(productsRes.data);
      setSettings(settingsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Удалить товар?')) return;
    try {
      await axios.delete(`/api/products/${id}`);
      loadData();
    } catch (error) {
      alert('Ошибка при удалении товара');
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;

  const groupedProducts: Record<string, Product[]> = {};
  filteredProducts.forEach(p => {
    const cat = p.category || 'Без категории';
    if (!groupedProducts[cat]) groupedProducts[cat] = [];
    groupedProducts[cat].push(p);
  });

  const categoryOrder = ['Свитер', 'Двусторонний сарафан', 'Рубашка'];
  const categoriesToShow = selectedCategory
    ? [selectedCategory]
    : categoryOrder.filter(cat => settings.categories.includes(cat));

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Управление товарами</h1>
            <p className="text-sm text-neutral-600">Всего товаров: {products.length}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              ← Назад
            </button>
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowAddModal(true);
              }}
              className="bg-neutral-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-neutral-800 transition-colors"
            >
              + Добавить товар
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200/60 p-6 mb-8">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-neutral-900">Категория:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    !selectedCategory
                      ? 'bg-neutral-900 text-white'
                      : 'border border-neutral-300 hover:border-neutral-900'
                  }`}
                >
                  Все
                </button>
                {settings.categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-neutral-900 text-white'
                        : 'border border-neutral-300 hover:border-neutral-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/settings')}
              className="ml-auto text-sm text-neutral-600 hover:text-neutral-900 underline transition-colors"
            >
              Настройки категорий и размеров
            </button>
          </div>
        </div>

        {/* Products by Category */}
        <div className="space-y-12">
          {categoriesToShow.map(category => {
            const categoryProducts = groupedProducts[category] || [];
            if (categoryProducts.length === 0) return null;

            return (
              <div key={category}>
                <h2 className="text-2xl font-bold text-neutral-900 mb-6 pb-3 border-b border-neutral-200">
                  {category}
                  <span className="ml-3 text-base font-normal text-neutral-500">
                    ({categoryProducts.length})
                  </span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {categoryProducts.map(product => (
                    <div key={product._id} className="bg-white rounded-lg shadow-sm border border-neutral-200/60 overflow-hidden group">
                      <div className="aspect-[3/4] bg-neutral-100 relative">
                        {product.mainImage && (
                          <img
                            src={`/silasvitera/api/photos/${product.mainImage}`}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setShowAddModal(true);
                            }}
                            className="bg-white text-neutral-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-100 transition-colors"
                          >
                            Редактировать
                          </button>
                          <button
                            onClick={() => deleteProduct(product._id)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-neutral-900 truncate mb-1">{product.title}</h3>
                        <p className="text-sm text-neutral-600">{product.price.toLocaleString('ru-RU')} ₽</p>
                        <p className="text-sm text-neutral-500">Остаток: {product.stock}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <ProductModal
          product={editingProduct}
          settings={settings}
          onClose={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
          onSave={() => {
            setShowAddModal(false);
            setEditingProduct(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

// Product Modal Component
function ProductModal({
  product,
  settings,
  onClose,
  onSave,
}: {
  product: Product | null;
  settings: Settings;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    title: product?.title || '',
    article: product?.article || '',
    price: product?.price || 0,
    stock: product?.stock || 0,
    category: product?.category || '',
    sizes: product?.sizes || [],
    mainImage: product?.mainImage || '',
    backImage: product?.backImage || '',
    otherImages: product?.otherImages || [],
    description: product?.description || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (product) {
        await axios.patch(`/api/products/${product._id}`, formData);
      } else {
        await axios.post('/api/products', formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Ошибка при сохранении товара');
    }
  };

  const toggleSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900">
            {product ? 'Редактировать товар' : 'Добавить товар'}
          </h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-900 text-2xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column - Product Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">Название *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">Артикул *</label>
                <input
                  type="text"
                  required
                  value={formData.article}
                  onChange={(e) => setFormData({ ...formData, article: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">Цена *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">Остаток</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">Категория *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:outline-none"
                >
                  <option value="">Выберите категорию</option>
                  {settings.categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">Размеры</label>
                <div className="flex flex-wrap gap-2">
                  {settings.sizes.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        formData.sizes.includes(size)
                          ? 'bg-neutral-900 text-white'
                          : 'border border-neutral-300 hover:border-neutral-900'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Right Column - Images */}
            <div>
              <ImageUploadDnD
                mainImage={formData.mainImage}
                backImage={formData.backImage}
                otherImages={formData.otherImages}
                onUpdate={(data) => setFormData({ ...formData, ...data })}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg border border-neutral-300 hover:border-neutral-900 transition-colors font-medium"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 bg-neutral-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-neutral-800 transition-colors"
            >
              {product ? 'Сохранить' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
