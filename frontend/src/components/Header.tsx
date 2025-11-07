import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import logo from './start_webapp.jpeg';

export default function Header() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const updateCart = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const count = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
      setCartCount(count);
    };
    
    const checkAuth = () => {
      const userId = localStorage.getItem('user_id');
      setIsLoggedIn(!!userId);
    };
    
    updateCart();
    checkAuth();
    window.addEventListener('storage', updateCart);
    window.addEventListener('storage', checkAuth);
    const interval = setInterval(() => {
      updateCart();
      checkAuth();
    }, 500);
    return () => {
      window.removeEventListener('storage', updateCart);
      window.removeEventListener('storage', checkAuth);
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-neutral-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-3 group">
          <img 
            src={logo} 
            alt="Сила свитера" 
            className="h-8 sm:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
          />
          <span className="sr-only">Сила свитера</span>
        </button>
        <div className="flex items-center gap-8">
          <nav className="hidden sm:flex gap-8 text-sm font-medium">
            <button onClick={() => navigate('/')} className="hover:text-neutral-900 text-neutral-600 transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-neutral-900 after:transition-all hover:after:w-full">Каталог</button>
            <button onClick={() => navigate('/page/about')} className="hover:text-neutral-900 text-neutral-600 transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-neutral-900 after:transition-all hover:after:w-full">О нас</button>
            <button onClick={() => navigate('/page/contacts')} className="hover:text-neutral-900 text-neutral-600 transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-neutral-900 after:transition-all hover:after:w-full">Контакты</button>
          </nav>
          {isLoggedIn ? (
            <button
              onClick={() => navigate('/profile')}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              title="Личный кабинет"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Войти
            </button>
          )}
          <button
            onClick={() => navigate('/cart')}
            className="relative p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-neutral-900 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
