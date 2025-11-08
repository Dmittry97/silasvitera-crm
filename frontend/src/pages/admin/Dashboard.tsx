import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

type Stats = {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  reservedProducts: number;
  ordersByStatus: {
    pending: number;
    paid: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
};

type Product = {
  _id: string;
  title: string;
  price: number;
  stock: number;
  mainImage?: string;
  isReserved?: boolean;
  reservedBy?: string;
  reservedUntil?: string;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [reservedProducts, setReservedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchStats();
    fetchReservedProducts();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        axios.get('/api/orders'),
        axios.get('/api/products'),
      ]);
      
      const orders = ordersRes.data;
      const products = productsRes.data;
      
      const totalRevenue = orders
        .filter((o: any) => o.status === 'paid' || o.status === 'delivered')
        .reduce((sum: number, o: any) => sum + o.total, 0);
      
      const ordersByStatus = {
        pending: orders.filter((o: any) => o.status === 'pending').length,
        paid: orders.filter((o: any) => o.status === 'paid').length,
        processing: orders.filter((o: any) => o.status === 'processing').length,
        shipped: orders.filter((o: any) => o.status === 'shipped').length,
        delivered: orders.filter((o: any) => o.status === 'delivered').length,
        cancelled: orders.filter((o: any) => o.status === 'cancelled').length,
      };
      
      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalProducts: products.length,
        reservedProducts: products.filter((p: any) => p.isReserved).length,
        ordersByStatus,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservedProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      const reserved = response.data.filter((p: Product) => p.isReserved);
      setReservedProducts(reserved);
    } catch (error) {
      console.error('Error fetching reserved products:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const unreserveProduct = async (productId: string) => {
    if (!confirm('Отменить бронирование этого товара?')) return;
    
    try {
      await axios.post(`/api/products/${productId}/unreserve`);
      setReservedProducts(reservedProducts.filter(p => p._id !== productId));
      if (stats) {
        setStats({ ...stats, reservedProducts: stats.reservedProducts - 1 });
      }
      alert('Бронирование отменено');
    } catch (error) {
      console.error('Error unreserving product:', error);
      alert('Ошибка при отмене бронирования');
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
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Дашборд</h1>
            <p className="text-sm text-neutral-600">Статистика магазина</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              На сайт →
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg border border-neutral-300 hover:border-neutral-900 transition-colors text-sm font-medium"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/admin/orders"
            className="bg-gradient-to-br from-neutral-900 to-neutral-700 text-white rounded-lg p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90 mb-1">Управление</div>
                <div className="text-2xl font-bold">Заказы</div>
              </div>
              <div className="text-4xl font-bold group-hover:scale-110 transition-transform">→</div>
            </div>
          </Link>
          <Link
            to="/admin/products"
            className="bg-gradient-to-br from-neutral-800 to-neutral-600 text-white rounded-lg p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90 mb-1">Управление</div>
                <div className="text-2xl font-bold">Товары</div>
              </div>
              <div className="text-4xl font-bold group-hover:scale-110 transition-transform">→</div>
            </div>
          </Link>
          <Link
            to="/admin/pages"
            className="bg-gradient-to-br from-neutral-700 to-neutral-500 text-white rounded-lg p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90 mb-1">Редактор</div>
                <div className="text-2xl font-bold">Страницы</div>
              </div>
              <div className="text-4xl font-bold group-hover:scale-110 transition-transform">→</div>
            </div>
          </Link>
        </div>

        {/* Stats */}
        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                <div className="text-sm text-neutral-600 mb-1">Всего заказов</div>
                <div className="text-3xl font-bold text-neutral-900">{stats.totalOrders}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                <div className="text-sm text-neutral-600 mb-1">Выручка</div>
                <div className="text-3xl font-bold text-neutral-900">
                  {stats.totalRevenue.toLocaleString('ru-RU')} ₽
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                <div className="text-sm text-neutral-600 mb-1">Товаров</div>
                <div className="text-3xl font-bold text-neutral-900">{stats.totalProducts}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                <div className="text-sm text-neutral-600 mb-1">Забронировано</div>
                <div className="text-3xl font-bold text-orange-600">{stats.reservedProducts}</div>
              </div>
            </div>

            {/* Orders by Status */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Заказы по статусам</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="text-center p-4 bg-neutral-50 rounded-lg">
                  <div className="text-xs text-neutral-600 mb-2">Новые</div>
                  <div className="text-2xl font-bold text-neutral-900">{stats.ordersByStatus.pending}</div>
                </div>
                <div className="text-center p-4 bg-neutral-50 rounded-lg">
                  <div className="text-xs text-neutral-600 mb-2">Оплачены</div>
                  <div className="text-2xl font-bold text-neutral-900">{stats.ordersByStatus.paid}</div>
                </div>
                <div className="text-center p-4 bg-neutral-50 rounded-lg">
                  <div className="text-xs text-neutral-600 mb-2">В обработке</div>
                  <div className="text-2xl font-bold text-neutral-900">{stats.ordersByStatus.processing}</div>
                </div>
                <div className="text-center p-4 bg-neutral-50 rounded-lg">
                  <div className="text-xs text-neutral-600 mb-2">Отправлены</div>
                  <div className="text-2xl font-bold text-neutral-900">{stats.ordersByStatus.shipped}</div>
                </div>
                <div className="text-center p-4 bg-neutral-50 rounded-lg">
                  <div className="text-xs text-neutral-600 mb-2">Доставлены</div>
                  <div className="text-2xl font-bold text-neutral-900">{stats.ordersByStatus.delivered}</div>
                </div>
                <div className="text-center p-4 bg-neutral-50 rounded-lg">
                  <div className="text-xs text-neutral-600 mb-2">Отменены</div>
                  <div className="text-2xl font-bold text-neutral-900">{stats.ordersByStatus.cancelled}</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Reserved Products */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">
            Забронированные товары ({reservedProducts.length})
          </h2>
          {reservedProducts.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              Нет забронированных товаров
            </div>
          ) : (
            <div className="space-y-3">
              {reservedProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center gap-4 p-4 bg-orange-50 border border-orange-200 rounded-lg"
                >
                  {product.mainImage && (
                    <div className="w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={`/silasvitera/api/photos/${product.mainImage}`}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-neutral-900 truncate">
                      {product.title}
                    </div>
                    <div className="text-sm text-neutral-600">
                      {product.price.toLocaleString('ru-RU')} ₽
                    </div>
                    {product.reservedUntil && (
                      <div className="text-xs text-orange-600 mt-1">
                        До: {new Date(product.reservedUntil).toLocaleString('ru-RU')}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => unreserveProduct(product._id)}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Отменить бронь
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
