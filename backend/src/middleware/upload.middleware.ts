import multer from "multer";
import path from "path";
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
  "image/avif",

  // Windows/Chrome sometimes sends HEIC like this
  "application/octet-stream",
];

const allowedExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".bmp",
  ".heic",
  ".heif",
  ".avif",
];

export const uploadImages = multer({
  storage: multer.memoryStorage(),

  fileFilter: (_req, file, cb) => {
    console.log("Incoming upload:");
    console.log("Original name:", file.originalname);
    console.log("Mime type:", file.mimetype);

    const ext = path.extname(file.originalname).toLowerCase();

    const validMime = allowedMimeTypes.includes(file.mimetype);
    const validExt = allowedExtensions.includes(ext);

    if (!validMime && !validExt) {
      return cb(
        new AppError(
          `Unsupported file. Mime=${file.mimetype}, Extension=${ext}`,
          400
        )
      );
    }

    cb(null, true);
  },
}).array("images", 50);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});