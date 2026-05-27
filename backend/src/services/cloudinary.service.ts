import { Readable } from "stream";
import type { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../config/cloudinary";

export async function uploadImage(file: Express.Multer.File) {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "LivingGo/properties",
        resource_type: "image"
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result);
      }
    );

    Readable.from(file.buffer).pipe(stream);
  });
}

export async function uploadMany(files: Express.Multer.File[] = []) {
  return Promise.all(files.map(uploadImage));
}
