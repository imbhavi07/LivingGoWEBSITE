import multer from "multer";
import { AppError } from "../utils/app-error";

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "image/gif",
  "image/bmp",
  "image/heif",
  "image/heic",
  "image/heic-sequence",
  "image/avif"
];

export const uploadImages = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_request, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(new AppError("Only JPEG, PNG, WebP, JPG, GIF, BMP, HEIF, HEIC, HEIC sequence, and AVIF images are allowed", 400));
    }

    callback(null, true);
  }
}).array("images", 50);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
});