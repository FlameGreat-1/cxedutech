import { useState } from 'react';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import { useToast } from '@/hooks/useToast';
import { formatPrice } from '@/utils/currency';
import { extractErrorMessage } from '@/api/client';
import type { IProduct } from '@/types/product.types';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Pagination from '@/components/common/Pagination';
import Spinner from '@/components/common/Spinner';
import ErrorAlert from '@/components/common/ErrorAlert';
import Badge from '@/components/common/Badge';
import ProductFormPage from './ProductFormPage';

export default function ProductListPage() {
  const { products, total, page, totalPages, isLoading, error, setPage, refetch, deleteProduct, isDeleting } = useAdminProducts();
  const { addToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<IProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IProduct | null>(null);

  function handleEdit(product: IProduct) {
    setEditProduct(product);
    setShowForm(true);
  }

  function handleCreate() {
    setEditProduct(null);
    setShowForm(true);
  }

  function handleFormClose() {
    setShowForm(false);
    setEditProduct(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      addToast('success', `"${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      addToast('error', extractErrorMessage(err));
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={refetch} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{total} total products</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>Add Product</Button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Product</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300 hidden sm:table-cell">Format</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Price</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Stock</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-brand-50 dark:bg-brand-900/30 shrink-0">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-brand-200 dark:text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25v14.25" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{product.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{product.age_range} yrs &middot; {product.subject}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <Badge variant={product.format === 'physical' ? 'green' : 'yellow'}>
                      {product.format}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    {formatPrice(product.price, product.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${
                      product.inventory_count === 0 ? 'text-red-600 dark:text-red-400'
                        : product.inventory_count < 5 ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {product.inventory_count}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(product)}
                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors text-xs font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {showForm && (
        <ProductFormPage product={editProduct} onClose={handleFormClose} />
      )}

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Product">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Are you sure you want to delete <span className="font-medium">"{deleteTarget?.title}"</span>?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={isDeleting}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
