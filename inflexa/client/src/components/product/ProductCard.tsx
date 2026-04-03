import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';
import { formatPrice } from '@/utils/currency';
import { encodeId } from '@/utils/obfuscate';
import type { IProduct } from '@/types/product.types';
import ProductImage from './ProductImage';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';

interface ProductCardProps {
  product: IProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { addToast } = useToast();

  const outOfStock = product.inventory_count === 0;
  const lowStock = product.inventory_count > 0 && product.inventory_count < 5;
  const price = formatPrice(product.price, product.currency);

  function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation();
    if (outOfStock) return;

    addItem({
      product_id: product.id,
      title: product.title,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      currency: product.currency,
      image_url: product.image_url,
      format: product.format,
      subject: product.subject,
      age_range: product.age_range,
    });
    addToast('success', `${product.title} added to cart`);
  }

  return (
    <div
      onClick={() => navigate(`/product/${encodeId(product.id)}`)}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer
        hover:shadow-md transition-shadow duration-200 flex flex-col"
      role="article"
    >
      <ProductImage src={product.image_url} alt={product.title} size="md" />

      <div className="p-4 flex flex-col flex-1">
        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          <Badge variant="brand">{product.age_range} yrs</Badge>
          <Badge variant="blue">{product.subject}</Badge>
          <Badge variant={product.format === 'physical' ? 'green' : 'yellow'}>
            {product.format === 'physical' ? 'Physical' : 'Printable'}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
          {product.title}
        </h3>

        {/* Focus area */}
        <p className="text-xs text-gray-500 mb-3">{product.focus_area}</p>

        {/* Price + Button */}
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">{price}</span>
            {outOfStock && (
              <span className="text-xs font-medium text-red-600">Out of Stock</span>
            )}
            {lowStock && (
              <span className="text-xs font-medium text-yellow-600">Low Stock</span>
            )}
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleAddToCart}
            disabled={outOfStock}
          >
            {outOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  );
}
