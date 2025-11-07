import { useState, useEffect } from 'react';

type PaymentModalProps = {
  isOpen: boolean;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
};

export default function PaymentModal({ isOpen, amount, onSuccess, onCancel }: PaymentModalProps) {
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes in seconds

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onCancel();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-neutral-900 to-neutral-700 text-white px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Оплата заказа</h2>
            <button onClick={onCancel} className="text-white/80 hover:text-white text-2xl">
              ✕
            </button>
          </div>
          <p className="text-sm text-white/80 mt-1">Сумма: {amount.toLocaleString('ru-RU')} ₽</p>
        </div>

        {/* Timer */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
          <div className="flex items-center justify-center gap-2 text-amber-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">
              Время на оплату: {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* QR Code Placeholder */}
          <div className="bg-neutral-100 rounded-lg p-8 flex flex-col items-center">
            <div className="w-48 h-48 bg-white border-4 border-neutral-900 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="text-6xl mb-2">📱</div>
                <div className="text-sm text-neutral-600">QR-код для оплаты</div>
              </div>
            </div>
            <p className="text-sm text-neutral-600 text-center">
              Отсканируйте QR-код в приложении банка
            </p>
          </div>

          {/* Bank Details */}
          <div className="bg-neutral-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-600">Получатель:</span>
              <span className="font-medium">ИП Сила Свитера</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Номер счета:</span>
              <span className="font-mono">4081 7810 1234 5678</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Сумма:</span>
              <span className="font-bold text-lg">{amount.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Инструкция:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Откройте приложение вашего банка</li>
              <li>Выберите "Оплата по QR-коду"</li>
              <li>Отсканируйте QR-код выше</li>
              <li>Подтвердите платеж</li>
              <li>Нажмите кнопку "Я оплатил" ниже</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 rounded-lg border-2 border-neutral-300 hover:border-neutral-900 transition-colors font-medium"
            >
              Отменить
            </button>
            <button
              onClick={onSuccess}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg"
            >
              ✓ Я оплатил
            </button>
          </div>

          {/* Warning */}
          <p className="text-xs text-neutral-500 text-center">
            После нажатия "Я оплатил" бронь будет снята и товар будет оформлен
          </p>
        </div>
      </div>
    </div>
  );
}
