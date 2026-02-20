import multer from 'multer';
import { Request } from 'express';
import { AppError } from '../../shared/errors/AppError';
import { storageConfig } from '../../shared/config/storage.config';

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (storageConfig.limits.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.',
        400
      )
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: storageConfig.limits.maxFileSize,
  },
});