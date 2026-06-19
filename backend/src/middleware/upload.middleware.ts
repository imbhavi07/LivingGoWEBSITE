import multer from "multer";
import { AppError } from "../utils/app-error";

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

export const uploadImages = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 8
  },
  fileFilter: (_request, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(new AppError("Only JPEG, PNG, and WebP images are allowed", 400));
    }

    callback(null, true);
  }
}).array("images", 8);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});