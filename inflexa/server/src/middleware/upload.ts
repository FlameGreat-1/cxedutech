import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { Request } from 'express';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// ─── Cloudinary SDK Configuration ──────────────────────────────────────────────
// Configured once at module load. Safe even when provider is 'local' because
// the SDK doesn't make network calls until an upload/destroy is invoked.
cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});

export { cloudinary };

// ─── File filter (shared by both storage engines) ──────────────────────────────
const ALLOWED_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void {
  if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP, GIF, and AVIF images are allowed.'));
  }
}

// ─── Local disk storage engine ─────────────────────────────────────────────────
function createLocalStorage(): multer.StorageEngine {
  const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  return multer.diskStorage({
    destination: (
      _req: Request,
      _file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void
    ) => {
      cb(null, UPLOAD_DIR);
    },
    filename: (
      _req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void
    ) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `product-${uniqueSuffix}${ext}`);
    },
  });
}

// ─── Cloudinary storage engine ─────────────────────────────────────────────────
// We use multer's memory storage to buffer the file, then manually upload it
// to Cloudinary inside the controller. This gives us full control over the
// public_id, folder, and error handling — which multer-storage-cloudinary
// abstractions cannot provide cleanly (e.g. rollback on slot-limit exceeded).
//
// After multer processes the request the file objects will have a `buffer`
// property instead of a `path`/`filename`. The controller detects this and
// uploads to Cloudinary accordingly.
function createCloudinaryStorage(): multer.StorageEngine {
  return multer.memoryStorage();
}

// ─── Select storage based on env toggle ────────────────────────────────────────
const isCloudinary = env.storageProvider === 'cloudinary';

const storage = isCloudinary ? createCloudinaryStorage() : createLocalStorage();

logger.info(`Image storage provider: ${env.storageProvider}`);

export const productImageUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});
