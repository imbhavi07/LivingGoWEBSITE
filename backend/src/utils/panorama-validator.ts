import sharp from "sharp";
import { AppError } from "./app-error";

export async function validatePanorama(
  file: Express.Multer.File
) {
  const metadata = await sharp(file.buffer).metadata();

  if (!metadata.width || !metadata.height) {
    throw new AppError("Invalid image", 400);
  }

  if (metadata.width !== metadata.height * 2) {
    throw new AppError(
      "Panorama must be 2:1 aspect ratio",
      400
    );
  }
}