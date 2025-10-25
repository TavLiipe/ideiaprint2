import React, { useState, useEffect } from 'react';
import NotificationToast, { ToastNotification } from './NotificationToast';
import { supabase } from '../../lib/supabase'; // Certifique-se que está importando corretamente
import { useNotifications } from '../../hooks/useNotifications';

interface ToastContainerProps {
  onNotificationClick?: (orderId: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ onNotificationClick }) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const { notifications } = useNotifications();
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);

  // Processa notificações já existentes no array
  useEffect(() => {
    if (notifications.length === 0) return;

    const latestNotification = notifications[0];

    if (latestNotification.id === lastNotificationId) return;
    if (latestNotification.is_read) return;

    setLastNotificationId(latestNotification.id);

    const newToast: ToastNotification = {
      id: latestNotification.id,
      type: latestNotification.type,
      message: latestNotification.message?.message || 'Nova mensagem',
      orderName: latestNotification.order
        ? `${latestNotification.order.client_name} - ${latestNotification.order.service}`
        : undefined,
      userName: latestNotification.message?.user_name,
      onClose: () => removeToast(latestNotification.id),
      onClick: onNotificationClick
        ? () => onNotificationClick(latestNotification.order_id)
        : undefined,
    };

    setToasts((prev) => [...prev, newToast]);
  }, [notifications]);

  // Escuta novas notificações em tempo real
  useEffect(() => {
    const subscription = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const newNotification = payload.new;

          // Evita duplicar toasts
          setToasts((prev) => {
            const exists = prev.find((t) => t.id === newNotification.id);
            if (exists) return prev;

            return [
              ...prev,
              {
                id: newNotification.id,
                type: newNotification.type,
                message: newNotification.message?.message || 'Nova mensagem',
                orderName: newNotification.order
                  ? `${newNotification.order.client_name} - ${newNotification.order.service}`
                  : undefined,
                userName: newNotification.message?.user_name,
                onClose: () => removeToast(newNotification.id),
                onClick: onNotificationClick
                  ? () => onNotificationClick(newNotification.order_id)
                  : undefined,
              },
            ];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [onNotificationClick]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <div className="space-y-2 pointer-events-auto">
        {toasts.map((toast) => (
          <NotificationToast key={toast.id} {...toast} />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
