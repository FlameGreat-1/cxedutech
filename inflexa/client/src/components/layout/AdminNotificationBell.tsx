import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as notificationsApi from '@/api/admin/notifications.api';
import * as paymentsApi from '@/api/admin/payments.api';
import type { INotification, NotificationType } from '@/types/notification.types';

const NOTIFICATION_ICONS: Record<NotificationType, { emoji: string; color: string }> = {
  new_order: { emoji: '🛒', color: 'bg-blue-100 dark:bg-blue-900/40' },
  payment_completed: { emoji: '✅', color: 'bg-green-100 dark:bg-green-900/40' },
  payment_failed: { emoji: '❌', color: 'bg-red-100 dark:bg-red-900/40' },
  order_shipped: { emoji: '📦', color: 'bg-indigo-100 dark:bg-indigo-900/40' },
  shipping_failed: { emoji: '⚠️', color: 'bg-orange-100 dark:bg-orange-900/40' },
  order_cancelled: { emoji: '🚫', color: 'bg-gray-100 dark:bg-gray-800' },
  order_delivered: { emoji: '🎉', color: 'bg-emerald-100 dark:bg-emerald-900/40' },
  low_stock: { emoji: '📉', color: 'bg-yellow-100 dark:bg-yellow-900/40' },
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function AdminNotificationBell() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Poll unread count every 30 seconds
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['admin', 'notifications', 'unread-count'],
    queryFn: notificationsApi.getUnreadCount,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

  // Fetch notifications only when dropdown is open
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['admin', 'notifications', 'list'],
    queryFn: () => notificationsApi.getAll(1, 20),
    enabled: open,
    staleTime: 5_000,
  });

  const notifications: INotification[] = notificationsData?.data ?? [];

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open]);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead();
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    } catch {
      // Silently fail - non-critical action
    }
  }, [queryClient]);

  const handleNotificationClick = useCallback(async (notification: INotification) => {
    // Mark as read
    if (!notification.is_read) {
      try {
        await notificationsApi.markAsRead(notification.id);
        queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
      } catch {
        // Silently fail
      }
    }

    // Navigate to relevant page based on notification type
    if (notification.type === 'payment_completed' || notification.type === 'payment_failed') {
      // Payment notifications → open payment details
      if (notification.order_id) {
        try {
          const payment = await paymentsApi.getByOrderId(notification.order_id);
          setOpen(false);
          if (payment) {
            navigate(`/admin/payments/${payment.id}`);
          } else {
            navigate('/admin/payments');
          }
        } catch {
          setOpen(false);
          navigate('/admin/payments');
        }
      } else {
        setOpen(false);
        navigate('/admin/payments');
      }
    } else if (notification.order_id) {
      // Order-related notifications → open order details
      setOpen(false);
      navigate(`/admin/orders/${notification.order_id}`);
    } else if (notification.type === 'low_stock') {
      setOpen(false);
      navigate('/admin/products');
    }
  }, [navigate, queryClient]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-lg text-admin-muted hover:text-admin-text hover:bg-admin-hover transition-colors"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <img
          src="/icons/bellIcon.svg"
          alt=""
          className="w-5 h-5 object-contain dark:invert dark:opacity-70"
        />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-admin-bg rounded-xl shadow-lg ring-1 ring-black/5 border border-admin-border z-50 overflow-hidden animate-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-admin-hover border-b border-admin-border">
            <h3 className="text-sm font-semibold text-admin-text">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-admin-border border-t-brand-500 rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-admin-muted">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const iconInfo = NOTIFICATION_ICONS[n.type] || { emoji: '🔔', color: 'bg-gray-100 dark:bg-gray-800' };
                return (
                  <button
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-admin-hover transition-colors border-b border-admin-border last:border-b-0 ${
                      !n.is_read ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconInfo.color}`}>
                      <span className="text-base">{iconInfo.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm truncate ${!n.is_read ? 'font-semibold text-admin-text' : 'font-medium text-admin-text'}`}>
                          {n.title}
                        </p>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-admin-muted mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[11px] text-admin-muted mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
