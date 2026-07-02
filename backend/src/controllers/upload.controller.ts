import type { Request, Response } from "express";
import { uploadMany } from "../services/cloudinary.service";
import { asyncHandler } from "../utils/async-handler";

export const uploadPropertyImages = asyncHandler(async (request: Request, response: Response) => {
  const files = (request.files as Express.Multer.File[]) ?? [];
  const uploads = await uploadMany(files);

  response.status(201).json({
    images: uploads.map((upload) => ({
      url: upload.secure_url,
      publicId: upload.public_id
    }))
  });
});