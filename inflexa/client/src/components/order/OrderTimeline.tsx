import type { OrderStatus } from '@/types/order.types';

interface OrderTimelineProps {
  currentStatus: OrderStatus;
}

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'Pending', label: 'Order Placed' },
  { status: 'Paid', label: 'Payment Confirmed' },
  { status: 'Shipped', label: 'Shipped' },
  { status: 'Delivered', label: 'Delivered' },
];

const STATUS_ORDER: Record<OrderStatus, number> = {
  Pending: 0,
  Paid: 1,
  Shipped: 2,
  Delivered: 3,
  Cancelled: -1,
};

export default function OrderTimeline({ currentStatus }: OrderTimelineProps) {
  if (currentStatus === 'Cancelled') {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm font-medium text-red-700">This order has been cancelled</span>
      </div>
    );
  }

  const currentIdx = STATUS_ORDER[currentStatus];

  return (
    <div className="flex items-center justify-between">
      {STEPS.map((step, idx) => {
        const completed = idx <= currentIdx;
        const isCurrent = idx === currentIdx;

        return (
          <div key={step.status} className="flex-1 flex flex-col items-center relative">
            {/* Connector line */}
            {idx > 0 && (
              <div
                className={`absolute top-3 right-1/2 w-full h-0.5 -translate-y-1/2
                  ${idx <= currentIdx ? 'bg-brand-500' : 'bg-gray-200'}`}
              />
            )}

            {/* Circle */}
            <div
              className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center
                ${completed
                  ? 'bg-brand-500'
                  : 'bg-white border-2 border-gray-300'
                }
                ${isCurrent ? 'ring-4 ring-brand-100' : ''}`}
            >
              {completed && (
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </div>

            {/* Label */}
            <span className={`mt-2 text-xs font-medium text-center
              ${completed ? 'text-brand-700' : 'text-gray-400'}`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
