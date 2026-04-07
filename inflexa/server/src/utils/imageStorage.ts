/**
 * Centralized image storage utilities.
 *
 * Abstracts away the underlying storage provider so controllers can
 * upload and delete images without knowing whether they live on disk
 * or in Cloudinary. Both providers are always safe to call — the
 * functions detect the image's origin from its URL automatically.
 */
import fs from 'fs';
import path from 'path';
import { cloudinary } from '../middleware/upload';
import { env } from '../config/env';
import { logger } from './logger';

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Determine whether a URL points to a Cloudinary-hosted image.
 */
function isCloudinaryUrl(url: string): boolean {
  return url.includes('res.cloudinary.com');
}

/**
 * Extract the Cloudinary public_id from a full Cloudinary URL.
 * e.g. https://res.cloudinary.com/dtii4cdd8/image/upload/v1234/inflexa/products/abc123.jpg
 *      → "inflexa/products/abc123"
 */
function extractPublicId(url: string): string | null {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// ─── Upload ────────────────────────────────────────────────────────────────────

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

/**
 * Upload a file buffer to Cloudinary.
 * Returns the secure URL and public_id for storage in the database.
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  originalname: string
): Promise<CloudinaryUploadResult> {
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const baseName = path.parse(originalname).name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const publicId = `inflexa/products/product-${baseName}-${uniqueSuffix}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: 'image',
        overwrite: false,
        quality: 'auto:good',
        fetch_format: 'auto',
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Cloudinary upload returned no result'));
        } else {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        }
      }
    );
    uploadStream.end(buffer);
  });
}

// ─── Delete ────────────────────────────────────────────────────────────────────

/**
 * Delete an image by its stored URL.
 *
 * Automatically detects whether the image lives in Cloudinary or on local
 * disk and routes the deletion accordingly. Safe to call for either type
 * regardless of the current STORAGE_PROVIDER setting — this allows
 * seamless migration between providers without orphaning old files.
 */
export async function deleteImageByUrl(url: string): Promise<void> {
  if (isCloudinaryUrl(url)) {
    const publicId = extractPublicId(url);
    if (!publicId) {
      logger.warn(`Could not extract public_id from Cloudinary URL: ${url}`);
      return;
    }
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
      logger.info(`Deleted Cloudinary image: ${publicId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error(`Failed to delete Cloudinary image ${publicId}: ${message}`);
    }
  } else if (url.startsWith('/uploads/')) {
    const fullPath = path.resolve(UPLOADS_DIR, path.basename(url));
    fs.unlink(fullPath, (err) => {
      if (err && err.code !== 'ENOENT') {
        logger.error(`Failed to delete local file: ${fullPath}`, err.message);
      }
    });
  } else {
    logger.warn(`Unknown image URL format, skipping deletion: ${url}`);
  }
}

/**
 * Build the image URL to persist in the database.
 *
 * - local mode:      returns '/uploads/{filename}'  (served by express.static)
 * - cloudinary mode: returns the full Cloudinary secure_url
 */
export function buildImageUrl(file: Express.Multer.File, cloudinaryUrl?: string): string {
  if (env.storageProvider === 'cloudinary' && cloudinaryUrl) {
    return cloudinaryUrl;
  }
  return `/uploads/${file.filename}`;
}
