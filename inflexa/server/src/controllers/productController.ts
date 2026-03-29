import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/productService';
import { ProductFilters } from '../types/product.types';
import { sendSuccess } from '../utils/apiResponse';

export async function getAllProducts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filters: ProductFilters = {
      age_range: req.query.age_range as string | undefined,
      subject: req.query.subject as string | undefined,
      focus_area: req.query.focus_area as string | undefined,
      format: req.query.format as string | undefined,
    };
    const products = await productService.getAll(filters);
    sendSuccess(res, products);
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
