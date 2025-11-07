import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

type Order = {
  _id: string;
  customerContact: string;
  contactMethod?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  pickupPoint?: string;
  items: { 
    id: string;
    title: string; 
    price: number; 
    quantity: number; 
    size?: string;
    image?: string;
  }[];
  total: number;
  status: string;
  trackingCode?: string;
  createdAt: string;
};

const statusLabels: Record<string, string> = {
  pending: 'Новый',
  paid: 'Оплачен',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменен',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function Profile() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      navigate('/login');
      return;
    }
    fetchProfile();
    fetchOrders();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      const response = await axios.get('/api/users/profile', {
        headers: { 'user-id': userId },
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      const response = await axios.get(`/api/orders/user/${userId}`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    navigate('/');
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
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-neutral-900 mb-3">Личный кабинет</h1>
              {orders.length > 0 && orders[0].firstName && orders[0].lastName && (
                <div className="space-y-1 text-neutral-700">
                  <div className="font-semibold text-lg">
                    {orders[0].firstName} {orders[0].lastName}
                  </div>
                  <div className="text-sm text-neutral-600">
                    {orders[0].contactMethod === 'email' ? 'Email: ' : 'Telegram: '}
                    {orders[0].customerContact}
                  </div>
                  {orders[0].phone && (
                    <div className="text-sm text-neutral-600">
                      Телефон: {orders[0].phone}
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2 rounded-lg border border-neutral-300 hover:border-neutral-900 transition-colors font-medium"
            >
              Выйти
            </button>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-6">Мои заказы ({orders.length})</h2>
          
          {orders.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              У вас пока нет заказов
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="border border-neutral-200 rounded-lg p-6 hover:border-neutral-300 transition-colors"
                >
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-4 pb-4 border-b border-neutral-100">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-semibold text-lg text-neutral-900">
                          Заказ от {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-neutral-600">
                        {order.phone && <div>Тел: {order.phone}</div>}
                        {order.address && (
                          <div>Адрес: {order.address}, {order.city}, {order.country}</div>
                        )}
                        {order.pickupPoint && (
                          <div>Пункт выдачи: {order.pickupPoint}</div>
                        )}
                        {order.trackingCode && (
                          <div className="mt-2 font-medium text-neutral-900">
                            Трек-код: <span className="font-mono bg-neutral-100 px-2 py-1 rounded">{order.trackingCode}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-neutral-900">
                        {order.total.toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 bg-neutral-50 rounded-lg">
                        {item.image && (
                          <div className="w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-neutral-900 truncate">
                            {item.title}
                          </div>
                          <div className="text-sm text-neutral-600">
                            {item.size && <span className="mr-3">Размер: {item.size}</span>}
                            <span>Количество: {item.quantity}</span>
                          </div>
                        </div>
                        <div className="text-right font-semibold text-neutral-900">
                          {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
