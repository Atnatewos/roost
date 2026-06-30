// apps/api/src/middleware/upload.js

import multer from 'multer';
import path from 'path';
import AppError from '../utils/AppError.js';

/**
 * Multer configuration for image uploads.
 * Files are stored temporarily in memory before uploading to Cloudinary.
 */

// Allowed image MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
];

// Maximum file size from environment or default 20MB
const MAX_FILE_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE || '20971520', 10);

const storage = multer.memoryStorage();

/**
 * File filter to validate uploaded images.
 * Rejects non-image files and unsupported formats.
 */
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Unsupported file type: ${file.mimetype}. Allowed types: JPEG, PNG, WebP, AVIF.`,
        400
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10, // Maximum files per upload
  },
});

/**
 * Pre-configured upload middleware for:
 * - uploadSingle: Single listing image upload
 * - uploadMultiple: Multiple listing images (up to 10)
 */
export const uploadSingle = upload.single('image');
export const uploadMultiple = upload.array('images', 10);

export default upload;