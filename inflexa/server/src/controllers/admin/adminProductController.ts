import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import * as productService from '../../services/productService';
import * as inventoryService from '../../services/inventoryService';
import { CreateProductDTO, UpdateProductDTO } from '../../types/product.types';
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

export async function uploadImage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const uploadedFilename = req.file?.filename;

  try {
    const id = parseInt(req.params.id as string, 10);

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
