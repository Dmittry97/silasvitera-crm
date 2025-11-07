import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type CartItem = {
  id: string;
  title: string;
  price: number;
  image?: string;
  size?: string;
  quantity: number;
};

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(stored);
  }, []);

  const updateQuantity = (index: number, delta: number) => {
    const updated = [...cart];
    updated[index].quantity += delta;
    if (updated[index].quantity <= 0) {
      updated.splice(index, 1);
    }
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const removeItem = (index: number) => {
    const updated = cart.filter((_, i) => i !== index);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">Корзина</h1>
        <div className="text-center py-20">
          <p className="text-neutral-600 mb-6">Ваша корзина пуста</p>
          <button
            onClick={() => navigate('/')}
            className="bg-neutral-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-neutral-800 transition-colors"
          >
            Перейти к покупкам
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-neutral-900 mb-8">Корзина</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-sm border border-neutral-200/60 p-6 flex gap-6">
              <div className="w-24 h-24 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                {item.image && (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-neutral-900 mb-1 truncate">{item.title}</h3>
                {item.size && <p className="text-sm text-neutral-600 mb-2">Размер: {item.size}</p>}
                <p className="text-lg font-semibold text-neutral-900">{item.price.toLocaleString('ru-RU')} ₽</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => removeItem(idx)}
                  className="text-sm text-neutral-500 hover:text-red-600 transition-colors"
                >
                  Удалить
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(idx, -1)}
                    className="w-8 h-8 rounded-lg border border-neutral-300 hover:border-neutral-900 transition-colors flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(idx, 1)}
                    className="w-8 h-8 rounded-lg border border-neutral-300 hover:border-neutral-900 transition-colors flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200/60 p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Итого</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Товары ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
                <span className="font-medium">{total.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Доставка</span>
                <span className="font-medium">Бесплатно</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Итого</span>
                <span>{total.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-neutral-900 text-white py-4 rounded-lg font-semibold hover:bg-neutral-800 transition-colors"
            >
              Оформить заказ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
