import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

type Page = {
  slug: string;
  title: string;
  content: string;
  isActive: boolean;
};

export default function AdminPagesEditor() {
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '' });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchPages();
  }, [navigate]);

  const fetchPages = async () => {
    try {
      const response = await axios.get('/api/pages');
      setPages(response.data);
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setFormData({ title: page.title, content: page.content });
  };

  const handleSave = async () => {
    if (!editingPage) return;

    try {
      await axios.patch(`/api/pages/${editingPage.slug}`, formData);
      await fetchPages();
      setEditingPage(null);
      alert('Страница обновлена');
    } catch (error) {
      console.error('Error updating page:', error);
      alert('Ошибка при обновлении страницы');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-neutral-600">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Редактор страниц</h1>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="px-6 py-2 rounded-lg border border-neutral-300 hover:border-neutral-900 transition-colors font-medium"
          >
            Назад
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pages List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Страницы</h2>
            {pages.map((page) => (
              <div
                key={page.slug}
                className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 hover:border-neutral-300 transition-colors cursor-pointer"
                onClick={() => handleEdit(page)}
              >
                <div className="font-semibold text-neutral-900">{page.title}</div>
                <div className="text-sm text-neutral-500 mt-1">/{page.slug}</div>
              </div>
            ))}
          </div>

          {/* Editor */}
          {editingPage && (
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                Редактирование: {editingPage.title}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Заголовок
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Содержание
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={15}
                    className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:outline-none resize-none font-mono text-sm"
                  />
                  <p className="text-xs text-neutral-500 mt-2">
                    Каждая новая строка будет отдельным абзацем
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-neutral-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-neutral-800 transition-colors"
                  >
                    Сохранить
                  </button>
                  <button
                    onClick={() => setEditingPage(null)}
                    className="px-6 py-3 rounded-lg border border-neutral-300 hover:border-neutral-900 transition-colors font-medium"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
