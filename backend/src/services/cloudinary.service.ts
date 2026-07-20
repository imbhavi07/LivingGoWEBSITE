import { Readable } from "stream";
import type { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../config/cloudinary";
import { convertHeicToJpeg } from "../utils/heic-converter";

export async function uploadImage(file: Express.Multer.File) {
  let uploadBuffer = file.buffer;

  if (
    file.mimetype === "image/heic" ||
    file.mimetype === "image/heif" ||
    file.mimetype === "image/heic-sequence"
  ) {
    console.log("Converting HEIC to JPEG...");
    uploadBuffer = await convertHeicToJpeg(file);
  }

  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "LivingGo/properties",
        resource_type: "image",
        chunk_size: 60000000,
        format: "webp",
        transformation: [
          {
            quality: "auto:good",
            fetch_format: "auto",
          },
        ],
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Stream Error:", error);

          let message = "Unknown error from Cloudinary";

          if (typeof error === "string") {
            message = error;
          } else if (
            error !== null &&
            typeof error === "object" &&
            "message" in error
          ) {
            message = String(error.message);
          }

          return reject(new Error(message));
        }

        if (!result) {
          return reject(new Error("Cloudinary returned no result"));
        }

        resolve(result);
      }
    );

    Readable.from(uploadBuffer).pipe(stream);
  });
}

export async function uploadPanorama(file: Express.Multer.File) {
  let uploadBuffer = file.buffer;

  if (
    file.mimetype === "image/heic" ||
    file.mimetype === "image/heif" ||
    file.mimetype === "image/heic-sequence"
  ) {
    console.log("Converting HEIC to JPEG...");
    uploadBuffer = await convertHeicToJpeg(file);
  }

  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "LivingGo/panoramas",
        resource_type: "image",
        chunk_size: 60000000,
        format: "webp",
        transformation: [
          {
            width: 6000,
            height: 3000,
            crop: "limit",
            quality: "auto:good",
            fetch_format: "auto",
          },
        ],
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Stream Error:", error);

          let message = "Unknown error from Cloudinary";

          if (typeof error === "string") {
            message = error;
          } else if (
            error !== null &&
            typeof error === "object" &&
            "message" in error
          ) {
            message = String(error.message);
          }

          return reject(new Error(message));
        }

        if (!result) {
          return reject(new Error("Cloudinary returned no result"));
        }

        resolve(result);
      }
    );

    Readable.from(uploadBuffer).pipe(stream);
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