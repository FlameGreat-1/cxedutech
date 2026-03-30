import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/utils/currency';
import type { CartItem as CartItemType } from '@/contexts/CartContext';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const subtotal = formatPrice(item.price * item.quantity, item.currency);
  const unitPrice = formatPrice(item.price, item.currency);

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
      {/* Image */}
      <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-brand-50">
        {item.image_url ? (
          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-8 h-8 text-brand-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">{item.title}</h3>
        <p className="text-sm text-gray-500 mt-0.5">{unitPrice} each</p>

        {/* Quantity + Remove */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
              className="px-2.5 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50
                transition-colors rounded-l-lg text-sm"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="px-3 py-1 text-sm font-medium text-gray-900 min-w-[2.5rem] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
              className="px-2.5 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50
                transition-colors rounded-r-lg text-sm"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            onClick={() => removeItem(item.product_id)}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
            aria-label={`Remove ${item.title}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-gray-900">{subtotal}</p>
      </div>
    </div>
  );
}
