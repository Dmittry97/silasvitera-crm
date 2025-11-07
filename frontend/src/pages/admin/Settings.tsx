import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

type Settings = {
  _id?: string;
  categories: string[];
  sizes: string[];
};

export default function AdminSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings>({ categories: [], sizes: [] });
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('');
  const [newSize, setNewSize] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadSettings();
  }, [navigate]);

  const loadSettings = async () => {
    try {
      const response = await axios.get('/api/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      await axios.patch('/api/settings', {
        categories: settings.categories,
        sizes: settings.sizes,
      });
      alert('Настройки сохранены!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Ошибка при сохранении настроек');
    }
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    if (settings.categories.includes(newCategory.trim())) {
      alert('Такая категория уже существует');
      return;
    }
    setSettings(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory.trim()],
    }));
    setNewCategory('');
  };

  const removeCategory = (category: string) => {
    if (!confirm(`Удалить категорию "${category}"?`)) return;
    setSettings(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category),
    }));
  };

  const addSize = () => {
    if (!newSize.trim()) return;
    if (settings.sizes.includes(newSize.trim())) {
      alert('Такой размер уже существует');
      return;
    }
    setSettings(prev => ({
      ...prev,
      sizes: [...prev.sizes, newSize.trim()],
    }));
    setNewSize('');
  };

  const removeSize = (size: string) => {
    if (!confirm(`Удалить размер "${size}"?`)) return;
    setSettings(prev => ({
      ...prev,
      sizes: prev.sizes.filter(s => s !== size),
    }));
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Настройки</h1>
            <p className="text-sm text-neutral-600">Управление категориями и размерами</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/products')}
              className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              ← Назад к товарам
            </button>
            <button
              onClick={saveSettings}
              className="bg-neutral-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-neutral-800 transition-colors"
            >
              Сохранить изменения
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Categories */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200/60 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Категории товаров</h2>
          
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCategory()}
              placeholder="Название новой категории"
              className="flex-1 px-4 py-2 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:outline-none"
            />
            <button
              onClick={addCategory}
              className="bg-neutral-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-neutral-800 transition-colors"
            >
              Добавить
            </button>
          </div>

          <div className="space-y-2">
            {settings.categories.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                Категории не добавлены
              </div>
            ) : (
              settings.categories.map((category, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors"
                >
                  <span className="font-medium text-neutral-900">{category}</span>
                  <button
                    onClick={() => removeCategory(category)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Удалить
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sizes */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200/60 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Размеры</h2>
          
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSize()}
              placeholder="Новый размер (например, XL)"
              className="flex-1 px-4 py-2 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:outline-none"
            />
            <button
              onClick={addSize}
              className="bg-neutral-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-neutral-800 transition-colors"
            >
              Добавить
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {settings.sizes.length === 0 ? (
              <div className="w-full text-center py-8 text-neutral-500">
                Размеры не добавлены
              </div>
            ) : (
              settings.sizes.map((size, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors"
                >
                  <span className="font-medium text-neutral-900">{size}</span>
                  <button
                    onClick={() => removeSize(size)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Подсказка</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Категории используются для группировки товаров на главной странице</li>
            <li>• Размеры доступны при создании и редактировании товаров</li>
            <li>• Не забудьте нажать "Сохранить изменения" после редактирования</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
