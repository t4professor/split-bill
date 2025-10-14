import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

// Storage configuration for avatar
export const avatarStorage = diskStorage({
  destination: join(process.cwd(), 'uploads', 'avatars'),
  filename: (req: Request, file, cb) => {
    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Storage configuration for payment QR
export const paymentQrStorage = diskStorage({
  destination: join(process.cwd(), 'uploads', 'payments'),
  filename: (req: Request, file, cb) => {
    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Only accept image files
export const imageFileFilter = (req: Request, file, cb) => {
  if (!file.mimetype.match(/^image\/(jpg|jpeg|png|webp)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB limit
