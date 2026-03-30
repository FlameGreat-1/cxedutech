import type { OrderStatus } from '@/types/order.types';
import Badge from '@/components/common/Badge';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const statusVariant: Record<OrderStatus, 'yellow' | 'blue' | 'brand' | 'green' | 'red'> = {
  Pending: 'yellow',
  Paid: 'blue',
  Shipped: 'brand',
  Delivered: 'green',
  Cancelled: 'red',
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return <Badge variant={statusVariant[status]}>{status}</Badge>;
}
