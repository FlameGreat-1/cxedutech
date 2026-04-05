export type NotificationType =
  | 'new_order'
  | 'payment_completed'
  | 'payment_failed'
  | 'order_shipped'
  | 'shipping_failed'
  | 'order_cancelled'
  | 'order_delivered'
  | 'low_stock';

export interface INotification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  order_id: number | null;
  is_read: boolean;
  created_at: string;
}
