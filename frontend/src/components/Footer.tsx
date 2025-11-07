import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Footer() {
  const [aboutContent, setAboutContent] = useState('Уникальные свитеры ручной работы с авторскими принтами и дизайном.');
  const [contactsContent, setContactsContent] = useState('Email: info@silasvitera.ru\nTelegram: @silasvitera');

  useEffect(() => {
    // Fetch about and contacts pages
    axios.get('/api/pages/about').then(res => setAboutContent(res.data.content)).catch(() => {});
    axios.get('/api/pages/contacts').then(res => setContactsContent(res.data.content)).catch(() => {});
  }, []);

  const contactLines = contactsContent.split('\n');

  return (
    <footer className="border-t border-neutral-200/60 bg-white mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-neutral-900 mb-4">О магазине</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {aboutContent}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 mb-4">Информация</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/page/about" className="text-neutral-600 hover:text-neutral-900 transition-colors">О нас</Link></li>
              <li><Link to="/page/delivery" className="text-neutral-600 hover:text-neutral-900 transition-colors">Доставка и оплата</Link></li>
              <li><Link to="/page/returns" className="text-neutral-600 hover:text-neutral-900 transition-colors">Возврат и обмен</Link></li>
              <li><Link to="/page/privacy" className="text-neutral-600 hover:text-neutral-900 transition-colors">Политика конфиденциальности</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 mb-4">Контакты</h3>
            <ul className="space-y-2 text-sm text-neutral-600">
              {contactLines.map((line, idx) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-neutral-200/60 text-sm text-neutral-500 text-center">
          © {new Date().getFullYear()} Сила свитера. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
