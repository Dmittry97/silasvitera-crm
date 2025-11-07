import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PaymentModal from '../components/PaymentModal';
import AccountCreatedModal from '../components/AccountCreatedModal';

type CartItem = {
  id: string;
  title: string;
  price: number;
  image?: string;
  size?: string;
  quantity: number;
};

type ContactMethod = 'email' | 'telegram';

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [contactMethod, setContactMethod] = useState<ContactMethod>('email');
  const [email, setEmail] = useState('');
  const [telegram, setTelegram] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Россия');
  const [showCdekMap, setShowCdekMap] = useState(false);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountData, setAccountData] = useState<{ email: string; password: string } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userAddresses, setUserAddresses] = useState<any[]>([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(-1);
  const [userId] = useState(() => {
    let id = localStorage.getItem('reservation_user_id');
    if (!id) {
      id = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('reservation_user_id', id);
    }
    return id;
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('cart') || '[]');
    if (stored.length === 0) {
      navigate('/cart');
    }
    setCart(stored);
    
    // Check if user is logged in and fetch their data
    const loggedUserId = localStorage.getItem('user_id');
    if (loggedUserId) {
      setIsLoggedIn(true);
      fetchUserData();
    }
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      const loggedUserId = localStorage.getItem('user_id');
      const response = await axios.get('/api/users/profile', {
        headers: { 'user-id': loggedUserId },
      });
      
      const userData = response.data;
      
      // Auto-fill user data
      if (userData.email) setEmail(userData.email);
      if (userData.telegram) setTelegram(userData.telegram);
      if (userData.firstName) setFirstName(userData.firstName);
      if (userData.lastName) setLastName(userData.lastName);
      if (userData.phone) setPhone(userData.phone);
      
      // Set contact method based on what user has
      if (userData.email) setContactMethod('email');
      else if (userData.telegram) setContactMethod('telegram');
      
      // Store addresses for selection
      if (userData.addresses && userData.addresses.length > 0) {
        setUserAddresses(userData.addresses);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const selectAddress = (index: number) => {
    setSelectedAddressIndex(index);
    const addr = userAddresses[index];
    if (addr.address) setAddress(addr.address);
    if (addr.city) setCity(addr.city);
    if (addr.country) setCountry(addr.country);
    if (addr.pickupPoint) setSelectedPickupPoint(addr.pickupPoint);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const checkReservations = async () => {
    try {
      // Try to reserve/extend reservation for all products
      const results = await Promise.all(
        cart.map(async item => {
          try {
            await axios.post(`/api/products/${item.id}/reserve`, { userId });
            return { success: true };
          } catch (error: any) {
            return { 
              success: false, 
              title: item.title,
              message: error.response?.data?.message || 'Ошибка бронирования'
            };
          }
        })
      );
      
      const failed = results.find(r => !r.success);
      if (failed) {
        alert(`Товар "${failed.title}" недоступен: ${failed.message}`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking reservations:', error);
      alert('Ошибка при проверке бронирования товаров');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check reservations
    const canProceed = await checkReservations();
    if (!canProceed) return;
    
    // Show payment modal
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    try {
      let registeredUserId = localStorage.getItem('user_id');
      let generatedPassword = null;
      
      // If user is not logged in, register them
      if (!isLoggedIn) {
        const userEmail = contactMethod === 'email' ? email : `${telegram}@telegram.user`;
        
        try {
          const registerResponse = await axios.post('/api/users/register', {
            email: userEmail,
            telegram: contactMethod === 'telegram' ? telegram : undefined,
            phone,
            firstName,
            lastName,
          });
          
          registeredUserId = registerResponse.data.id;
          generatedPassword = registerResponse.data.generatedPassword;
          
          // Save user credentials
          if (registeredUserId) {
            localStorage.setItem('user_id', registeredUserId);
            localStorage.setItem('user_email', userEmail);
          }
        } catch (error: any) {
          // User might already exist, that's ok
          if (error.response?.status === 401) {
            console.log('User already exists, continuing...');
          } else {
            throw error;
          }
        }
      }
      
      // Save/update address for logged in users
      if (isLoggedIn && registeredUserId) {
        const newAddress = {
          address,
          city,
          country,
          pickupPoint: selectedPickupPoint,
        };
        
        // Check if this is a new address
        const isNewAddress = selectedAddressIndex === -1 || 
          userAddresses.every(addr => 
            addr.address !== address || 
            addr.city !== city || 
            addr.pickupPoint !== selectedPickupPoint
          );
        
        if (isNewAddress) {
          const updatedAddresses = [...userAddresses, newAddress];
          await axios.patch('/api/users/profile', 
            { addresses: updatedAddresses },
            { headers: { 'user-id': registeredUserId } }
          );
        }
      }
      
      // Create order with userId
      const orderData = {
        customerContact: contactMethod === 'email' ? email : telegram,
        contactMethod,
        firstName,
        lastName,
        phone,
        address,
        city,
        country,
        pickupPoint: selectedPickupPoint,
        items: cart,
        total,
        status: 'paid',
        userId: registeredUserId,
      };
      
      await axios.post('/api/orders', orderData);
      
      // 3. Delete products from database (they are sold)
      await Promise.all(
        cart.map(item => axios.delete(`/api/products/${item.id}`))
      );
      
      // 4. Clear cart
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('storage'));
      
      setShowPaymentModal(false);
      
      // 5. Show account modal if new user was created (only for non-logged in users)
      if (!isLoggedIn && generatedPassword) {
        const userEmail = contactMethod === 'email' ? email : `${telegram}@telegram.user`;
        setAccountData({ email: userEmail, password: generatedPassword });
        setShowAccountModal(true);
      } else if (isLoggedIn) {
        alert('Оплата прошла успешно! Заказ добавлен в ваш профиль.');
        navigate('/profile');
      } else {
        alert('Оплата прошла успешно! Заказ оформлен.');
        navigate('/');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      alert('Ошибка при оформлении заказа. Попробуйте еще раз.');
    }
  };

  const handlePaymentCancel = async () => {
    // Unreserve products if payment cancelled
    try {
      await Promise.all(
        cart.map(item => axios.post(`/api/products/${item.id}/unreserve`))
      );
    } catch (error) {
      console.error('Error unreserving products:', error);
    }
    setShowPaymentModal(false);
  };

  const openCdekWidget = () => {
    setShowCdekMap(true);
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <button
        onClick={() => navigate('/cart')}
        className="mb-8 text-sm text-neutral-600 hover:text-neutral-900 transition-colors flex items-center gap-2"
      >
        ← Назад в корзину
      </button>

      <h1 className="text-3xl font-bold text-neutral-900 mb-8">Оформление заказа</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Order Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Method */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200/60 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Контактные данные</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-900 mb-3">
                  Способ связи
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setContactMethod('email')}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                      contactMethod === 'email'
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-300 hover:border-neutral-900'
                    }`}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactMethod('telegram')}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                      contactMethod === 'telegram'
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-300 hover:border-neutral-900'
                    }`}
                  >
                    Telegram
                  </button>
                </div>
              </div>

              {contactMethod === 'email' ? (
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.com"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:outline-none transition-colors"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Telegram *
                  </label>
                  <input
                    type="text"
                    required
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    placeholder="@username"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:outline-none transition-colors"
                  />
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Имя *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Иван"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Фамилия *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Иванов"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  Номер телефона *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (___) ___-__-__"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200/60 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Адрес доставки</h2>
              
              {/* Saved Addresses Selection */}
              {isLoggedIn && userAddresses.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-900 mb-3">
                    Выберите сохраненный адрес или введите новый
                  </label>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAddressIndex(-1);
                        setAddress('');
                        setCity('');
                        setCountry('Россия');
                        setSelectedPickupPoint('');
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                        selectedAddressIndex === -1
                          ? 'border-neutral-900 bg-neutral-50'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      <div className="font-medium">Новый адрес</div>
                    </button>
                    {userAddresses.map((addr, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectAddress(idx)}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                          selectedAddressIndex === idx
                            ? 'border-neutral-900 bg-neutral-50'
                            : 'border-neutral-300 hover:border-neutral-400'
                        }`}
                      >
                        <div className="font-medium">{addr.city}, {addr.country}</div>
                        <div className="text-sm text-neutral-600 mt-1">
                          {addr.address || addr.pickupPoint || 'Адрес не указан'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Страна *
                  </label>
                  <select
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:outline-none transition-colors"
                  >
                    <option value="Россия">Россия</option>
                    <option value="Беларусь">Беларусь</option>
                    <option value="Казахстан">Казахстан</option>
                    <option value="Армения">Армения</option>
                    <option value="Кыргызстан">Кыргызстан</option>
                    <option value="Узбекистан">Узбекистан</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Город *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Москва"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Адрес *
                  </label>
                  <textarea
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Улица, дом, квартира"
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-neutral-900 focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* CDEK Pickup Points */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-neutral-900">
                      Пункт выдачи СДЭК (опционально)
                    </label>
                    <button
                      type="button"
                      onClick={openCdekWidget}
                      className="text-sm text-neutral-600 hover:text-neutral-900 underline transition-colors"
                    >
                      Выбрать на карте
                    </button>
                  </div>
                  {selectedPickupPoint && (
                    <div className="bg-neutral-50 rounded-lg p-3 text-sm text-neutral-700">
                      <strong>Выбран пункт:</strong> {selectedPickupPoint}
                    </div>
                  )}
                  {showCdekMap && (
                    <div className="mt-4 bg-neutral-100 rounded-lg p-8 text-center">
                      <p className="text-neutral-600 mb-4">
                        Здесь будет интерактивная карта СДЭК
                      </p>
                      <p className="text-sm text-neutral-500 mb-4">
                        Для интеграции используйте виджет СДЭК: 
                        <a 
                          href="https://www.cdek.ru/ru/integration/widgets" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-neutral-900 underline ml-1"
                        >
                          cdek.ru/integration/widgets
                        </a>
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPickupPoint('СДЭК, Москва, ул. Тверская, д. 1');
                          setShowCdekMap(false);
                        }}
                        className="bg-neutral-900 text-white px-6 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
                      >
                        Выбрать тестовый пункт
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-neutral-900 text-white py-4 rounded-lg font-semibold hover:bg-neutral-800 transition-colors"
            >
              Подтвердить заказ
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200/60 p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Ваш заказ</h2>
            
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {cart.map((item, idx) => (
                <div key={idx} className="flex gap-3 text-sm">
                  <div className="w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image && (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    {item.size && <p className="text-neutral-500">Размер: {item.size}</p>}
                    <p className="text-neutral-500">x{item.quantity}</p>
                  </div>
                  <div className="font-semibold whitespace-nowrap">
                    {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Товары</span>
                <span className="font-medium">{total.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Доставка</span>
                <span className="font-medium">Бесплатно</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg font-bold">
                <span>Итого</span>
                <span>{total.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        amount={total}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
      />

      {/* Account Created Modal */}
      {showAccountModal && accountData && (
        <AccountCreatedModal
          email={accountData.email}
          password={accountData.password}
          onClose={() => {
            setShowAccountModal(false);
            navigate('/profile');
          }}
        />
      )}
    </div>
  );
}
