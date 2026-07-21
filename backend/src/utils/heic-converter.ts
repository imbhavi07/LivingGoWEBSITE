import convert from "heic-convert";
import sharp from "sharp";

export async function convertHeicToJpeg(
  file: Express.Multer.File
): Promise<Buffer> {
  const converted = await convert({
    buffer: file.buffer,
    format: "JPEG",
    quality: 1,
  });

  return await sharp(Buffer.from(converted))
    .rotate()
    .jpeg({
      quality: 90,
      mozjpeg: true,
    })
    .toBuffer();
}