export async function compressImageFile(
  file: File,
  { maxDimension = 1600, quality = 0.8 }: { maxDimension?: number; quality?: number } = {},
): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const supportsWebp = canvas.toDataURL("image/webp").startsWith("data:image/webp");
    const type = supportsWebp ? "image/webp" : "image/jpeg";
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), type, quality),
    );
    if (!blob) return file;

    const newName = file.name.replace(/\.\w+$/, "") + (supportsWebp ? ".webp" : ".jpg");
    return new File([blob], newName, { type });
  } catch {
    // Old-browser or decode failure — fall back to the original file;
    // the server-side size/type check is still the real guard.
    return file;
  }
}
