import { useState } from 'react';

interface AccountCreatedModalProps {
  email: string;
  password: string;
  onClose: () => void;
}

export default function AccountCreatedModal({ email, password, onClose }: AccountCreatedModalProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const text = `Логин: ${email}\nПароль: ${password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Заказ оформлен!
          </h2>
          <p className="text-neutral-600">
            Для вас автоматически создан аккаунт
          </p>
        </div>

        <div className="bg-neutral-50 rounded-lg p-4 mb-6 space-y-3">
          <div>
            <div className="text-sm text-neutral-600 mb-1">Логин (Email)</div>
            <div className="font-mono text-neutral-900 font-semibold">{email}</div>
          </div>
          <div>
            <div className="text-sm text-neutral-600 mb-1">Пароль</div>
            <div className="font-mono text-neutral-900 font-semibold">{password}</div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Важно!</strong> Сохраните эти данные. С их помощью вы сможете отслеживать статус заказа в личном кабинете.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={copyToClipboard}
            className="flex-1 px-6 py-3 rounded-lg border border-neutral-300 hover:border-neutral-900 transition-colors font-medium"
          >
            {copied ? 'Скопировано!' : 'Копировать данные'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-neutral-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-neutral-800 transition-colors"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
}
