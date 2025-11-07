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

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await axios.patch(`/api/orders/${orderId}`, { status: newStatus });
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Ошибка при обновлении статуса заказа');
    }
  };

  const updateTrackingCode = async (orderId: string, trackingCode: string) => {
    try {
      await axios.patch(`/api/orders/${orderId}`, { trackingCode });
      setOrders(orders.map(o => o._id === orderId ? { ...o, trackingCode } : o));
    } catch (error) {
      console.error('Error updating tracking code:', error);
      alert('Ошибка при обновлении трек-кода');
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Удалить этот заказ?')) return;
    
    try {
      await axios.delete(`/api/orders/${orderId}`);
      setOrders(orders.filter(o => o._id !== orderId));
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Ошибка при удалении заказа');
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    paid: orders.filter(o => o.status === 'paid').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
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
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="mb-4 text-sm text-neutral-600 hover:text-neutral-900 transition-colors flex items-center gap-2"
          >
            ← Назад к дашборду
          </button>
          <h1 className="text-3xl font-bold text-neutral-900">Управление заказами</h1>
          <p className="text-neutral-600 mt-2">Всего заказов: {orders.length}</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Все ({statusCounts.all})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'pending'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Новые ({statusCounts.pending})
            </button>
            <button
              onClick={() => setFilterStatus('paid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'paid'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Оплачены ({statusCounts.paid})
            </button>
            <button
              onClick={() => setFilterStatus('processing')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'processing'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              В обработке ({statusCounts.processing})
            </button>
            <button
              onClick={() => setFilterStatus('shipped')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'shipped'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Отправлены ({statusCounts.shipped})
            </button>
            <button
              onClick={() => setFilterStatus('delivered')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'delivered'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Доставлены ({statusCounts.delivered})
            </button>
            <button
              onClick={() => setFilterStatus('cancelled')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'cancelled'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Отменены ({statusCounts.cancelled})
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-12 text-center text-neutral-500">
              Заказов не найдено
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 hover:border-neutral-300 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-neutral-100">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="font-semibold text-lg text-neutral-900">
                        {order.firstName && order.lastName 
                          ? `${order.firstName} ${order.lastName}` 
                          : order.customerContact}
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-neutral-100 text-neutral-600">
                        {order.contactMethod === 'email' ? 'Email' : 'Telegram'}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-neutral-600">
                      {order.customerContact && <div>{order.customerContact}</div>}
                      {order.phone && <div>Тел: {order.phone}</div>}
                      {order.address && (
                        <div>Адрес: {order.address}, {order.city}, {order.country}</div>
                      )}
                      {order.pickupPoint && (
                        <div>Пункт выдачи: {order.pickupPoint}</div>
                      )}
                      <div className="text-neutral-500 mt-2">
                        {new Date(order.createdAt).toLocaleString('ru-RU')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-neutral-900 mb-3">
                      {order.total.toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="space-y-2">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className="w-full text-sm px-4 py-2 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:outline-none font-medium"
                      >
                        <option value="pending">Новый</option>
                        <option value="paid">Оплачен</option>
                        <option value="processing">В обработке</option>
                        <option value="shipped">Отправлен</option>
                        <option value="delivered">Доставлен</option>
                        <option value="cancelled">Отменен</option>
                      </select>
                      
                      {(order.status === 'shipped' || order.status === 'delivered') && (
                        <input
                          type="text"
                          placeholder="Трек-код"
                          value={order.trackingCode || ''}
                          onChange={(e) => updateTrackingCode(order._id, e.target.value)}
                          className="w-full text-sm px-4 py-2 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:outline-none"
                        />
                      )}
                      
                      <button
                        onClick={() => deleteOrder(order._id)}
                        className="w-full px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  <div className="font-medium text-neutral-900 mb-2">Товары:</div>
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
