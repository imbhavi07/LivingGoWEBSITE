import multer from "multer";
import { AppError } from "../utils/app-error";

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif", "image/bmp", "image/heif", "image/heic"];

export const uploadImages = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit per file
    fieldSize: 10 * 1024 * 1024, // 10 MB limit for text fields
    files: 8
  },
  fileFilter: (_request, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(new AppError("Only JPEG, PNG, WebP, JPG, GIF, BMP, HEIF, and HEIC images are allowed", 400));
    }

    callback(null, true);
  }
}).array("images", 8);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit per file
    fieldSize: 10 * 1024 * 1024 // 10 MB limit for text fields
  }
});