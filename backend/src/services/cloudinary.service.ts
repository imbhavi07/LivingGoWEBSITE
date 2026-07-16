import { Readable } from "stream";
import type { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../config/cloudinary";

export async function uploadImage(file: Express.Multer.File) {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "LivingGo/properties",
        resource_type: "image",
        chunk_size: 60000000,
        transformation: [
          {
            quality: "auto:good",
            format: "jpg"
          }
        ]
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Stream Error:", error);
          let message = 'Unknown error from Cloudinary';
          if (typeof error === 'string') {
            message = error;
          } else if (error !== null && typeof error === 'object' && 'message' in error) {
            message = String(error.message);
          } else {
            try {
              message = JSON.stringify(error);
            } catch {
              message = String(error);
            }
          }
          return reject(new Error(message));
        }
        if (!result) {
          return reject(new Error("Cloudinary returned no result"));
        }
        resolve(result);
      }
    );

    Readable.from(file.buffer).pipe(stream);
  });
}

export async function uploadPanorama(file: Express.Multer.File) {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "LivingGo/panoramas",
        resource_type: "image",
        chunk_size: 0,

        transformation: [
          {
            width: 6000,
            height: 3000,
            crop: "limit",
            quality: "auto:good",
            fetch_format: "webp"
          }
        ]
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Stream Error:", error);
          let message = 'Unknown error from Cloudinary';
          if (typeof error === 'string') {
            message = error;
          } else if (error !== null && typeof error === 'object' && 'message' in error) {
            message = String(error.message);
          } else {
            try {
              message = JSON.stringify(error);
            } catch {
              message = String(error);
            }
          }
          return reject(new Error(message));
        }
        if (!result) {
          return reject(new Error("Cloudinary returned no result"));
        }
        resolve(result);
      }
    );

    Readable.from(file.buffer).pipe(stream);
  });
}

export async function uploadMany(files: Express.Multer.File[] = []) {
  return Promise.all(files.map(uploadImage));
}

export async function uploadManyPanoramas(
  files: Express.Multer.File[] = []
) {
  return Promise.all(files.map(uploadPanorama));
}

export async function deleteCloudinaryImage(
  publicId: string
) {
  return cloudinary.uploader.destroy(publicId);
}
