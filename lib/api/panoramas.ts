import { apiClient } from "./client";
import imageCompression from 'browser-image-compression';

export type Panorama = {
  id: string;
  title: string;
  imageUrl: string;
  publicId?: string;
  sortOrder: number;
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

  // Optimized specifically for wide 360 aspect-ratio limits
  const options = { maxSizeMB: 3.5, maxWidthOrHeight: 8000, useWebWorker: true };
  console.log("Compressing panorama client-side...");
  const compressedImage = await imageCompression(payload.image, options);

  formData.append("title", payload.title);
  formData.append("image", compressedImage); // Hand over the safe compressed blob

  if (payload.sortOrder !== undefined) {
    formData.append("sortOrder", String(payload.sortOrder));
  }

  const { data } = await apiClient.post(
    `/panoramas/admin/properties/${propertyId}/panoramas`,
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
    `/panoramas/admin/panoramas/${panoramaId}`,
    data
  );

  return response.data;
}

export async function deletePanorama(
  panoramaId: string
) {
  await apiClient.delete(
    `/panoramas/admin/panoramas/${panoramaId}`
  );
}

export async function replacePanoramaImage(
  panoramaId: string,
  image: File
) {
  const formData = new FormData();

  const options = { maxSizeMB: 3.5, maxWidthOrHeight: 8000, useWebWorker: true };
  const compressedImage = await imageCompression(image, options);

  formData.append("image", compressedImage);

  const { data } = await apiClient.put(
    `/panoramas/admin/panoramas/${panoramaId}/image`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
}