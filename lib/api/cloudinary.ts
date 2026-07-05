import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// Configure Cloudinary with required environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Validate that all required environment variables are present
if (!cloudName || !apiKey || !apiSecret) {
  throw new Error("Cloudinary environment variables are missing in production");
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

/**
 * Uploads a file to Cloudinary using the Node.js SDK
 * @param file - File object (from FormData) or base64 data URL string
 * @returns Promise resolving to Cloudinary upload result with url and publicId
 */
export async function uploadToCloudinary(file: string | File): Promise<{
  url: string;
  publicId: string;
}> {
  try {
    // Convert File to buffer if needed
    let buffer: Buffer;
    if (typeof file === "string") {
      // Assuming it's a base64 data URL
      const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches?.length) {
        throw new Error("Invalid base64 data URL");
      }
      buffer = Buffer.from(matches[2], "base64");
    } else {
      // Convert File to buffer
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "LivingGo/properties",
          resource_type: "auto",
        },
        (error, result) => {
          if (error || !result) {
            console.error("Cloudinary upload error:", error);
            return reject(new Error(error?.message || "Image upload failed"));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );

      Readable.from(buffer).pipe(uploadStream);
    });
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw new Error("Image upload failed: " + (error instanceof Error ? error.message : String(error)));
  }
}