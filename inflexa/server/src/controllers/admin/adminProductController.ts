import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import * as productService from '../../services/productService';
import * as inventoryService from '../../services/inventoryService';
import * as productImageModel from '../../models/productImageModel';
import { CreateProductDTO, UpdateProductDTO } from '../../types/product.types';
import { sendSuccess, sendError, sendPaginated } from '../../utils/apiResponse';
import { logger } from '../../utils/logger';

const UPLOADS_DIR = path.resolve(__dirname, '../../../uploads');
const MAX_IMAGES_PER_PRODUCT = 5;

function deleteFileFromDisk(filePath: string): void {
  const fullPath = path.resolve(UPLOADS_DIR, path.basename(filePath));
  fs.unlink(fullPath, (err) => {
    if (err && err.code !== 'ENOENT') {
      logger.error(`Failed to delete file: ${fullPath}`, err.message);
    }
  });
}

export async function getAllProducts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));

    const { products, total } = await productService.getAll({}, page, limit);
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

    // Delete image files from disk before removing the product
    const images = await productImageModel.findByProductId(id);
    for (const img of images) {
      if (img.image_url.startsWith('/uploads/')) {
        deleteFileFromDisk(img.image_url);
      }
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
 */
export async function uploadImage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const uploadedFiles = (req.files as Express.Multer.File[]) || [];

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
      for (const f of uploadedFiles) deleteFileFromDisk(f.filename);
      sendError(res, `Maximum ${MAX_IMAGES_PER_PRODUCT} images per product. Currently has ${currentCount}.`, 400);
      return;
    }

    // Only process files up to the available slots
    const filesToProcess = uploadedFiles.slice(0, slotsAvailable);
    const filesToDiscard = uploadedFiles.slice(slotsAvailable);

    for (const f of filesToDiscard) {
      deleteFileFromDisk(f.filename);
    }

    const imageUrls = filesToProcess.map((f) => `/uploads/${f.filename}`);
    await productImageModel.addImages(id, imageUrls, currentCount);

    const product = await productService.getById(id);
    sendSuccess(res, product);
  } catch (error: unknown) {
    for (const f of uploadedFiles) {
      deleteFileFromDisk(f.filename);
    }
    next(error);
  }
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

    // Delete file from disk
    if (removed.image_url.startsWith('/uploads/')) {
      deleteFileFromDisk(removed.image_url);
    }

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
