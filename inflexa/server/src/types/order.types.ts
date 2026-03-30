export type OrderStatus = 'Pending' | 'Paid' | 'Shipped' | 'Delivered' | 'Cancelled';

export const VALID_ORDER_STATUSES: OrderStatus[] = [
  'Pending',
  'Paid',
  'Shipped',
  'Delivered',
  'Cancelled',
];

/**
 * Defines which status transitions are allowed.
 * Key = current status, Value = array of statuses it can transition to.
 * Any status can transition to Cancelled.
 */
export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  Pending: ['Paid', 'Cancelled'],
  Paid: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered', 'Cancelled'],
  Delivered: [],
  Cancelled: [],
};

export interface ShippingAddress {
  shipping_name: string;
  shipping_email: string;
  shipping_phone?: string;
  shipping_address_line1: string;
  shipping_address_line2?: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country?: string;
}

export interface OrderItemInput {
  product_id: number;
  quantity: number;
}

export interface CreateOrderDTO {
  items: OrderItemInput[];
  shipping: ShippingAddress;
  currency?: string;
}

export interface IOrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  currency: string;
  product_title?: string;
  product_image_url?: string;
}

export interface IOrder {
  id: number;
  user_id: number | null;
  total_amount: number;
  currency: string;
  order_status: OrderStatus;
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string | null;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  easypost_shipment_id: string | null;
  tracking_code: string | null;
  idempotency_key: string | null;
  created_at: Date;
  updated_at: Date;
  items?: IOrderItem[];
  username?: string;
  user_email?: string;
}
