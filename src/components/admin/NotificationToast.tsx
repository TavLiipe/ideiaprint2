import React, { useEffect, useState } from 'react';
import { X, MessageCircle } from 'lucide-react';

export interface ToastNotification {
  id: string;
  type: 'mention' | 'new_message';
  message: string;
  orderName?: string;
  userName?: string;
  onClose: () => void;
  onClick?: () => void;
}

const NotificationToast: React.FC<ToastNotification> = ({
  id,
  type,
  message,
  orderName,
  userName,
  onClose,
  onClick,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);

    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
      handleClose();
    }
  };

  return (
    <div
      className={`transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        onClick={handleClick}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-l-4 ${
          type === 'mention'
            ? 'border-orange-500'
            : 'border-blue-500'
        } p-4 max-w-sm cursor-pointer hover:shadow-xl transition-shadow`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                type === 'mention'
                  ? 'bg-orange-100 dark:bg-orange-900/30'
                  : 'bg-blue-100 dark:bg-blue-900/30'
              }`}
            >
              <MessageCircle
                className={`w-5 h-5 ${
                  type === 'mention' ? 'text-orange-600' : 'text-blue-600'
                }`}
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {type === 'mention' ? 'Você foi mencionado' : 'Nova mensagem'}
            </p>
            {userName && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                {userName}
              </p>
            )}
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
              {message}
            </p>
            {orderName && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {orderName}
              </p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
