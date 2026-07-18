import { apiClient } from "./client";
import imageCompression from "browser-image-compression";

export type Panorama = {
  id: string;
  title: string;
  imageUrl: string;
  publicId?: string;
  sortOrder: number;
};

// Compression configuration specifically tuned for 360 panoramas
const panoramaCompressionOptions = {
  maxSizeMB: 9, // Safely under Cloudinary's 10MB strict limit
  maxWidthOrHeight: 8192, // Keep resolution high so the sphere isn't blurry
  useWebWorker: true,
  preserveExif: true, // CRITICAL: This keeps the 360 metadata intact
};

export async function getPropertyPanoramas(propertyId: string) {
  const { data } = await apiClient.get<Panorama[]>(
    `/panoramas/properties/${propertyId}/panoramas`
  );

  return data;
}

export async function uploadPanorama(
  propertyId: string,
  payload: {
    title: string;
    image: File;
    sortOrder?: number;
  }
) {
  const formData = new FormData();
  formData.append("title", payload.title);

  try {
    // Compress the image before appending
    const compressedFile = await imageCompression(payload.image, panoramaCompressionOptions);
    formData.append("image", compressedFile, compressedFile.name);
  } catch (error) {
    console.error("Compression failed, falling back to original", error);
    formData.append("image", payload.image);
  }

  if (payload.sortOrder !== undefined) {
    formData.append("sortOrder", String(payload.sortOrder));
  }

  const { data } = await apiClient.post(
    `/admin/properties/${propertyId}/panoramas`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
}

export async function updatePanorama(
  panoramaId: string,
  data: {
    title: string;
    sortOrder: number;
  }
) {
  const response = await apiClient.put(
    `/admin/properties/panoramas/${panoramaId}`,
    data
  );

  return response.data;
}

export async function deletePanorama(
  panoramaId: string
) {
  await apiClient.delete(
    `/admin/properties/panoramas/${panoramaId}`
  );
}

export async function replacePanoramaImage(
  panoramaId: string,
  image: File
) {
  const formData = new FormData();

  try {
    // Compress the replacement image as well
    const compressedFile = await imageCompression(image, panoramaCompressionOptions);
    formData.append("image", compressedFile, compressedFile.name);
  } catch (error) {
    console.error("Compression failed, falling back to original", error);
    formData.append("image", image);
  }

  const { data } = await apiClient.put(
    `/admin/properties/panoramas/${panoramaId}/image`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
}