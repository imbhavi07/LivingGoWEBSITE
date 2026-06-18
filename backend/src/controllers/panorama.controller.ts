import type { Request, Response } from "express";
import * as panoramaService from "../services/panorama.service";
import { uploadPanorama } from "../services/cloudinary.service";
import { validatePanorama } from "../utils/panorama-validator";
import { replacePanoramaImage as replacePanoramaImageService } from "../services/panorama.service";

export async function getPropertyPanoramas(req: Request, res: Response) {
  const panoramas = await panoramaService.getPropertyPanoramas(
    String(req.params.propertyId)
  );

  res.json(panoramas);
}

export async function createPanorama(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({
      message: "Panorama image is required"
    });
  }

  await validatePanorama(req.file);

  const uploaded = await uploadPanorama(req.file);

  const panorama = await panoramaService.createPanorama(
    String(req.params.propertyId),
    {
      title: req.body.title,
      imageUrl: uploaded.secure_url,
      publicId: uploaded.public_id,
      sortOrder: Number(req.body.sortOrder ?? 0)
    }
  );

  res.status(201).json(panorama);
}

export async function updatePanorama(req: Request, res: Response) {
  const panorama = await panoramaService.updatePanorama(
    String(req.params.id),
    req.body
  );

  res.json(panorama);
}

export async function deletePanorama(req: Request, res: Response) {
  await panoramaService.deletePanorama(String(req.params.id));

  res.status(204).send();
}

export async function replacePanoramaImage(
  req: Request,
  res: Response
) {
  if (!req.file) {
    return res.status(400).json({
      message: "Image is required"
    });
  }

  await validatePanorama(req.file);

  const uploaded = await uploadPanorama(
    req.file
  );

  const panorama =
    await replacePanoramaImageService(
      String(req.params.id),
      uploaded.secure_url,
      uploaded.public_id
    );

  res.json(panorama);
}