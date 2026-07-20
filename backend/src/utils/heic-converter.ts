import convert from "heic-convert";

export async function convertHeicToJpeg(
  file: Express.Multer.File
): Promise<Buffer> {
  const outputBuffer = await convert({
    buffer: file.buffer,
    format: "JPEG",
    quality: 0.9,
  });

  return Buffer.from(outputBuffer);
}