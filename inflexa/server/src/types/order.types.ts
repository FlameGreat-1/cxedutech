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

/**
 * Enriched order item carrying real product data for customs declarations.
 * Built by resolving OrderItemInput[] against the product catalog.
 * Every shipping provider uses this for international shipments to produce
 * legally accurate customs forms.
 */
export interface CustomsItem {
  product_id: number;
  quantity: number;
  /** Product title used as the customs line-item description */
  description: string;
  /** Unit price of one item in the order currency */
  unit_price: number;
  /** ISO 4217 currency code (e.g. 'GBP', 'USD') */
  currency: string;
  /** Per-item weight in ounces */
  weight_oz: number;
}

export interface CreateOrderDTO {
  items: OrderItemInput[];
  shipping: ShippingAddress;
  currency?: string;
  /** Shipping rate ID selected by the user during checkout. Omit if shipping is disabled. */
  shipping_rate_id?: string;
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
  subtotal: number;
  shipping_cost: number;
  shipping_carrier: string | null;
  shipping_service: string | null;
  shipping_provider: string | null;
  tax_amount: number;
  tax_rate: number;
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
  shipment_id: string | null;
  tracking_code: string | null;
  idempotency_key: string | null;
  created_at: Date;
  updated_at: Date;
  items?: IOrderItem[];
  username?: string;
  user_email?: string;
}
