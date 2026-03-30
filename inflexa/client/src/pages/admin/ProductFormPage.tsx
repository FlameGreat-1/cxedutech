import { useState, type FormEvent } from 'react';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import { useToast } from '@/hooks/useToast';
import { extractErrorMessage } from '@/api/client';
import type { IProduct, CreateProductDTO } from '@/types/product.types';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Button from '@/components/common/Button';

interface ProductFormPageProps {
  product: IProduct | null;
  onClose: () => void;
}

const FORMAT_OPTIONS = [
  { value: 'physical', label: 'Physical' },
  { value: 'printable', label: 'Printable' },
];

const CURRENCY_OPTIONS = [
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'NGN', label: 'NGN (₦)' },
];

export default function ProductFormPage({ product, onClose }: ProductFormPageProps) {
  const { createProduct, updateProduct, uploadImage, isCreating, isUpdating } = useAdminProducts();
  const { addToast } = useToast();
  const isEdit = !!product;

  const [form, setForm] = useState({
    title: product?.title || '',
    description: product?.description || '',
    min_age: product?.min_age ?? 3,
    max_age: product?.max_age ?? 5,
    subject: product?.subject || '',
    focus_area: product?.focus_area || '',
    price: product ? (typeof product.price === 'string' ? product.price : String(product.price)) : '',
    currency: product?.currency || 'GBP',
    format: product?.format || 'physical',
    inventory_count: product?.inventory_count ?? 0,
  });
  const [includedItems, setIncludedItems] = useState<string[]>(product?.included_items || ['']);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addIncludedItem() {
    setIncludedItems((prev) => [...prev, '']);
  }

  function updateIncludedItem(idx: number, value: string) {
    setIncludedItems((prev) => prev.map((item, i) => (i === idx ? value : item)));
  }

  function removeIncludedItem(idx: number) {
    setIncludedItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required.';
    if (!form.description.trim()) e.description = 'Description is required.';
    if (!form.subject.trim()) e.subject = 'Subject is required.';
    if (!form.focus_area.trim()) e.focus_area = 'Focus area is required.';
    if (!form.price || parseFloat(form.price) <= 0) e.price = 'Price must be greater than 0.';
    if (form.min_age > form.max_age) e.min_age = 'Min age cannot exceed max age.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!validate()) return;

    const dto: CreateProductDTO = {
      title: form.title.trim(),
      description: form.description.trim(),
      min_age: Number(form.min_age),
      max_age: Number(form.max_age),
      subject: form.subject.trim(),
      focus_area: form.focus_area.trim(),
      price: parseFloat(form.price),
      currency: form.currency,
      format: form.format as 'physical' | 'printable',
      included_items: includedItems.filter((i) => i.trim()),
      inventory_count: Number(form.inventory_count),
    };

    try {
      let savedProduct: IProduct;
      if (isEdit && product) {
        savedProduct = await updateProduct({ id: product.id, data: dto });
        addToast('success', 'Product updated.');
      } else {
        savedProduct = await createProduct(dto);
        addToast('success', 'Product created.');
      }

      if (imageFile) {
        await uploadImage({ id: savedProduct.id, file: imageFile });
      }

      onClose();
    } catch (err) {
      addToast('error', extractErrorMessage(err));
    }
  }

  return (
    <Modal isOpen onClose={onClose} title={isEdit ? 'Edit Product' : 'Add New Product'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Title" value={form.title} onChange={(e) => update('title', e.target.value)} error={errors.title} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            rows={3}
            className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400
              focus:outline-none focus:ring-2 transition-colors duration-150
              ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-brand-500 focus:border-brand-500'}`}
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Min Age" type="number" value={String(form.min_age)} onChange={(e) => update('min_age', parseInt(e.target.value) || 0)} error={errors.min_age} />
          <Input label="Max Age" type="number" value={String(form.max_age)} onChange={(e) => update('max_age', parseInt(e.target.value) || 0)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Subject" value={form.subject} onChange={(e) => update('subject', e.target.value)} error={errors.subject} />
          <Input label="Focus Area" value={form.focus_area} onChange={(e) => update('focus_area', e.target.value)} error={errors.focus_area} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input label="Price" type="number" step="0.01" value={form.price} onChange={(e) => update('price', e.target.value)} error={errors.price} />
          <Select label="Currency" value={form.currency} onChange={(e) => update('currency', e.target.value)} options={CURRENCY_OPTIONS} />
          <Select label="Format" value={form.format} onChange={(e) => update('format', e.target.value)} options={FORMAT_OPTIONS} />
        </div>

        <Input label="Inventory Count" type="number" value={String(form.inventory_count)} onChange={(e) => update('inventory_count', parseInt(e.target.value) || 0)} />

        {/* Included Items */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">What's Included</label>
          <div className="space-y-2">
            {includedItems.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  value={item}
                  onChange={(e) => updateIncludedItem(idx, e.target.value)}
                  placeholder={`Item ${idx + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {includedItems.length > 1 && (
                  <button type="button" onClick={() => removeIncludedItem(idx)} className="text-red-400 hover:text-red-600 transition-colors px-2">
                    &times;
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addIncludedItem} className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors">
              + Add item
            </button>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
              file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100
              file:cursor-pointer file:transition-colors"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isCreating || isUpdating}>
            {isEdit ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
