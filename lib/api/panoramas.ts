import { apiClient } from "./client";

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

  // Removed client-side compression to preserve 360 EXIF metadata
  formData.append("title", payload.title);
  formData.append("image", payload.image); // Use original image to preserve EXIF

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

  formData.append("image", image); // Use original image to preserve EXIF

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