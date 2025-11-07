type ConfirmModalProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({ isOpen, onConfirm, onCancel }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md mx-4 animate-fade-in">
        <h3 className="text-lg font-semibold text-neutral-900 mb-3">
          Товар добавлен в корзину!
        </h3>
        <p className="text-neutral-600 mb-6">
          Товар забронирован на 20 минут. Перейти в корзину для оформления заказа?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-lg border border-neutral-300 hover:border-neutral-900 transition-colors font-medium"
          >
            Не сейчас
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors font-medium"
          >
            Перейти в корзину
          </button>
        </div>
      </div>
    </div>
  );
}
