import { apiClient } from "./client";

export async function getAdminProperties(search?: string) {
  const res = await apiClient.get("/admin/properties", {
    params: { search },
  });
  return res.data;
}

export async function getAdminProperty(id: string) {
  const res = await apiClient.get(`/admin/properties/${id}/manage`);
  return res.data;
}