export async function uploadToCloudinary(file: string | File) {
  // Hardcoded fallbacks to your EXACT account so .env caching can't break it
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dlgk4nhqb";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "livinggo_unsigned";

  if (!cloudName || !uploadPreset) {
    console.error("🚨 Missing Cloudinary ENV variables!");
    throw new Error("Missing Cloudinary configuration");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("🚨 Exact Cloudinary Rejection Reason:", data.error?.message || data);
      throw new Error(data.error?.message || "Image upload failed");
    }

    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.error("🚨 Cloudinary Fetch Failed:", error);
    throw error;
  }
}