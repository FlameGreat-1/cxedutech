import { useState, useRef, type FormEvent, type DragEvent } from 'react';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import { useToast } from '@/hooks/useToast';
import { extractErrorMessage } from '@/api/client';
import type { IProduct, IProductImage, CreateProductDTO } from '@/types/product.types';
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
  { value: 'GBP', label: 'GBP (\u00a3)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (\u20ac)' },
  { value: 'NGN', label: 'NGN (\u20a6)' },
];

const MAX_IMAGES = 5;

interface PendingFile {
  id: string;
  file: File;
  previewUrl: string;
}

export default function ProductFormPage({ product, onClose }: ProductFormPageProps) {
  const {
    createProduct, updateProduct, uploadImages,
    deleteImage, setPrimaryImage,
    isCreating, isUpdating,
  } = useAdminProducts();
  const { addToast } = useToast();
  const isEdit = !!product;
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [existingImages, setExistingImages] = useState<IProductImage[]>(product?.images || []);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalImageCount = existingImages.length + pendingFiles.length;
  const canAddMore = totalImageCount < MAX_IMAGES;

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

  // --- Image handling ---

  function addFiles(files: FileList | File[]) {
    const fileArray = Array.from(files);
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const validFiles = fileArray.filter((f) => allowed.includes(f.type));

    if (validFiles.length === 0) {
      addToast('error', 'Only JPEG, PNG, WebP, and GIF images are allowed.');
      return;
    }

    const slotsAvailable = MAX_IMAGES - totalImageCount;
    const filesToAdd = validFiles.slice(0, slotsAvailable);

    if (validFiles.length > slotsAvailable) {
      addToast('error', `Only ${slotsAvailable} more image(s) can be added. Max ${MAX_IMAGES} total.`);
    }

    const newPending: PendingFile[] = filesToAdd.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setPendingFiles((prev) => [...prev, ...newPending]);
  }

  function removePendingFile(id: string) {
    setPendingFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) URL.revokeObjectURL(file.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  }

  async function handleDeleteExistingImage(imageId: number) {
    if (!product) return;
    setImageLoading(true);
    try {
      await deleteImage({ productId: product.id, imageId });
      setExistingImages((prev) => {
        const remaining = prev.filter((img) => img.id !== imageId);
        // If we deleted the primary, the backend promotes the next one
        // We'll reflect that optimistically
        const removed = prev.find((img) => img.id === imageId);
        if (removed?.is_primary && remaining.length > 0) {
          remaining[0] = { ...remaining[0], is_primary: true };
        }
        return remaining;
      });
      addToast('success', 'Image removed.');
    } catch (err) {
      addToast('error', extractErrorMessage(err));
    } finally {
      setImageLoading(false);
    }
  }

  async function handleSetPrimary(imageId: number) {
    if (!product) return;
    setImageLoading(true);
    try {
      await setPrimaryImage({ productId: product.id, imageId });
      setExistingImages((prev) =>
        prev.map((img) => ({ ...img, is_primary: img.id === imageId }))
      );
      addToast('success', 'Primary image updated.');
    } catch (err) {
      addToast('error', extractErrorMessage(err));
    } finally {
      setImageLoading(false);
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = '';
    }
  }

  // --- Validation ---

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

  // --- Submit ---

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

      // Upload any pending images
      if (pendingFiles.length > 0) {
        const files = pendingFiles.map((pf) => pf.file);
        await uploadImages({ id: savedProduct.id, files });
        // Clean up preview URLs
        pendingFiles.forEach((pf) => URL.revokeObjectURL(pf.previewUrl));
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

        {/* Image Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Images ({totalImageCount}/{MAX_IMAGES})
          </label>

          {/* Existing images */}
          {existingImages.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mb-3">
              {existingImages.map((img) => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={img.image_url}
                    alt="Product"
                    className="w-full h-20 object-cover"
                  />
                  {/* Primary badge */}
                  {img.is_primary && (
                    <span className="absolute top-1 left-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    {!img.is_primary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(img.id)}
                        disabled={imageLoading}
                        className="p-1.5 bg-white rounded-full text-yellow-600 hover:text-yellow-700 shadow-sm"
                        title="Set as primary"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingImage(img.id)}
                      disabled={imageLoading}
                      className="p-1.5 bg-white rounded-full text-red-600 hover:text-red-700 shadow-sm"
                      title="Remove image"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pending file previews */}
          {pendingFiles.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mb-3">
              {pendingFiles.map((pf) => (
                <div key={pf.id} className="relative group rounded-lg overflow-hidden border border-dashed border-brand-300 bg-brand-50">
                  <img
                    src={pf.previewUrl}
                    alt="Preview"
                    className="w-full h-20 object-cover"
                  />
                  <span className="absolute top-1 left-1 bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    New
                  </span>
                  <button
                    type="button"
                    onClick={() => removePendingFile(pf.id)}
                    className="absolute top-1 right-1 p-1 bg-white rounded-full text-red-600 hover:text-red-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Drop zone */}
          {canAddMore && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${dragOver
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-gray-300 hover:border-brand-400 hover:bg-gray-50'
                }`}
            >
              <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-brand-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPEG, PNG, WebP, GIF up to 5MB each ({MAX_IMAGES - totalImageCount} remaining)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          )}

          {!canAddMore && (
            <p className="text-xs text-gray-500 mt-1">
              Maximum {MAX_IMAGES} images reached. Remove an image to add more.
            </p>
          )}
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
