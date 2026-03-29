import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import * as productService from '../../services/productService';
import * as inventoryService from '../../services/inventoryService';
import { sendSuccess, sendError, sendPaginated } from '../../utils/apiResponse';
import { logger } from '../../utils/logger';

const UPLOADS_DIR = path.resolve(__dirname, '../../../uploads');

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
    const id = parseInt(req.params.id, 10);
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
    const product = await productService.create(req.body);
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
    const id = parseInt(req.params.id, 10);
    const product = await productService.update(id, req.body);
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
    const id = parseInt(req.params.id, 10);
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
    const id = parseInt(req.params.id, 10);
    const { inventory_count } = req.body;
    const product = await inventoryService.updateStock(id, inventory_count);
    sendSuccess(res, product);
  } catch (error: unknown) {
    next(error);
  }
}

export async function uploadImage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const uploadedFilename = req.file?.filename;

  try {
    const id = parseInt(req.params.id, 10);

    if (!req.file) {
      sendError(res, 'No image file provided.', 400);
      return;
    }

    const existing = await productService.getById(id);

    const newImageUrl = `/uploads/${req.file.filename}`;
    const product = await productService.update(id, { image_url: newImageUrl });

    if (existing.image_url && existing.image_url.startsWith('/uploads/')) {
      deleteFileFromDisk(existing.image_url);
    }

    sendSuccess(res, product);
  } catch (error: unknown) {
    if (uploadedFilename) {
      deleteFileFromDisk(uploadedFilename);
    }
    next(error);
  }
}
