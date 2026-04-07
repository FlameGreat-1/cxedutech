import { Request, Response, NextFunction } from 'express';
import * as productService from '../../services/productService';
import * as inventoryService from '../../services/inventoryService';
import * as productImageModel from '../../models/productImageModel';
import { CreateProductDTO, UpdateProductDTO } from '../../types/product.types';
import { sendSuccess, sendError, sendPaginated } from '../../utils/apiResponse';
import { logger } from '../../utils/logger';
import { env } from '../../config/env';
import { deleteImageByUrl, uploadToCloudinary } from '../../utils/imageStorage';

const MAX_IMAGES_PER_PRODUCT = 5;

export async function getAllProducts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));

    const filters: Record<string, unknown> = {};
    if (req.query.search) filters.search = req.query.search;
    if (req.query.subject) filters.subject = req.query.subject;
    if (req.query.format) filters.format = req.query.format;
    if (req.query.min_age) filters.min_age = parseInt(req.query.min_age as string, 10);
    if (req.query.max_age) filters.max_age = parseInt(req.query.max_age as string, 10);

    const { products, total } = await productService.getAll(filters, page, limit);
    sendPaginated(res, products, total, page, limit);
  } catch (error: unknown) {
    next(error);
  }
}

export async function getProductById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    const product = await productService.getById(id);
    sendSuccess(res, product);
  } catch (error: unknown) {
    next(error);
  }
}

export async function createProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data: CreateProductDTO = {
      title: req.body.title,
      description: req.body.description,
      min_age: req.body.min_age,
      max_age: req.body.max_age,
      subject: req.body.subject,
      focus_area: req.body.focus_area,
      price: req.body.price,
      currency: req.body.currency,
      format: req.body.format,
      included_items: req.body.included_items,
      inventory_count: req.body.inventory_count,
      image_url: req.body.image_url,
    };
    const product = await productService.create(data);
    sendSuccess(res, product, 201);
  } catch (error: unknown) {
    next(error);
  }
}

export async function updateProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    const data: UpdateProductDTO = {};

    if (req.body.title !== undefined) data.title = req.body.title;
    if (req.body.description !== undefined) data.description = req.body.description;
    if (req.body.min_age !== undefined) data.min_age = req.body.min_age;
    if (req.body.max_age !== undefined) data.max_age = req.body.max_age;
    if (req.body.subject !== undefined) data.subject = req.body.subject;
    if (req.body.focus_area !== undefined) data.focus_area = req.body.focus_area;
    if (req.body.price !== undefined) data.price = req.body.price;
    if (req.body.currency !== undefined) data.currency = req.body.currency;
    if (req.body.format !== undefined) data.format = req.body.format;
    if (req.body.included_items !== undefined) data.included_items = req.body.included_items;
    if (req.body.inventory_count !== undefined) data.inventory_count = req.body.inventory_count;
    if (req.body.image_url !== undefined) data.image_url = req.body.image_url;

    const product = await productService.update(id, data);
    sendSuccess(res, product);
  } catch (error: unknown) {
    next(error);
  }
}

export async function deleteProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);

    // Delete image files from storage before removing the product
    const images = await productImageModel.findByProductId(id);
    for (const img of images) {
      await deleteImageByUrl(img.image_url);
    }

    await productService.remove(id);
    sendSuccess(res, { message: 'Product deleted successfully.' });
  } catch (error: unknown) {
    next(error);
  }
}

export async function updateInventory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    const { inventory_count } = req.body;
    const product = await inventoryService.updateStock(id, inventory_count);
    sendSuccess(res, product);
  } catch (error: unknown) {
    next(error);
  }
}

/**
 * Upload 1-5 product images.
 * Accepts multipart field name 'images' with up to 5 files.
 *
 * Storage-aware: When STORAGE_PROVIDER=cloudinary, files arrive as in-memory
 * buffers and are streamed to Cloudinary. When local, multer has already
 * written them to disk and we reference the filename.
 */
export async function uploadImage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const uploadedFiles = (req.files as Express.Multer.File[]) || [];
  const cloudinaryUrls: string[] = []; // Track for rollback on error

  try {
    const id = parseInt(req.params.id as string, 10);

    if (uploadedFiles.length === 0) {
      sendError(res, 'No image files provided.', 400);
      return;
    }

    // Verify product exists
    await productService.getById(id);

    const currentCount = await productImageModel.countByProductId(id);
    const slotsAvailable = MAX_IMAGES_PER_PRODUCT - currentCount;

    if (slotsAvailable <= 0) {
      // Clean up already-uploaded files
      await cleanupUploadedFiles(uploadedFiles);
      sendError(
        res,
        `Maximum ${MAX_IMAGES_PER_PRODUCT} images per product. Currently has ${currentCount}.`,
        400
      );
      return;
    }

    // Only process files up to the available slots
    const filesToProcess = uploadedFiles.slice(0, slotsAvailable);
    const filesToDiscard = uploadedFiles.slice(slotsAvailable);

    // Discard overflow files
    await cleanupUploadedFiles(filesToDiscard);

    // Build the image URLs depending on storage provider
    const imageUrls: string[] = [];

    if (env.storageProvider === 'cloudinary') {
      for (const file of filesToProcess) {
        const result = await uploadToCloudinary(file.buffer, file.originalname);
        imageUrls.push(result.secure_url);
        cloudinaryUrls.push(result.secure_url);
      }
    } else {
      for (const file of filesToProcess) {
        imageUrls.push(`/uploads/${file.filename}`);
      }
    }

    await productImageModel.addImages(id, imageUrls, currentCount);

    const product = await productService.getById(id);
    sendSuccess(res, product);
  } catch (error: unknown) {
    // Rollback: delete any images we already uploaded during this request
    if (env.storageProvider === 'cloudinary') {
      for (const url of cloudinaryUrls) {
        await deleteImageByUrl(url);
      }
    } else {
      await cleanupUploadedFiles(uploadedFiles);
    }
    next(error);
  }
}

/**
 * Clean up uploaded files that are not needed.
 * For local storage, deletes the file from disk.
 * For cloudinary storage (memory mode), buffers are garbage-collected automatically.
 */
async function cleanupUploadedFiles(files: Express.Multer.File[]): Promise<void> {
  if (env.storageProvider === 'local') {
    for (const f of files) {
      if (f.filename) {
        await deleteImageByUrl(`/uploads/${f.filename}`);
      }
    }
  }
  // For cloudinary (memory storage), no local cleanup needed — buffers are GC'd
}

export async function deleteImage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const productId = parseInt(req.params.id as string, 10);
    const imageId = parseInt(req.params.imageId as string, 10);

    // Verify product exists
    await productService.getById(productId);

    const removed = await productImageModel.removeImage(imageId);
    if (!removed) {
      sendError(res, 'Image not found.', 404);
      return;
    }

    if (removed.product_id !== productId) {
      sendError(res, 'Image does not belong to this product.', 403);
      return;
    }

    // Delete file from storage (auto-detects Cloudinary vs local)
    await deleteImageByUrl(removed.image_url);

    const product = await productService.getById(productId);
    sendSuccess(res, product);
  } catch (error: unknown) {
    next(error);
  }
}

export async function setPrimaryImage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const productId = parseInt(req.params.id as string, 10);
    const imageId = parseInt(req.params.imageId as string, 10);

    await productService.getById(productId);

    const image = await productImageModel.setPrimary(imageId);
    if (!image) {
      sendError(res, 'Image not found.', 404);
      return;
    }

    if (image.product_id !== productId) {
      sendError(res, 'Image does not belong to this product.', 403);
      return;
    }

    const product = await productService.getById(productId);
    sendSuccess(res, product);
  } catch (error: unknown) {
    next(error);
  }
}
