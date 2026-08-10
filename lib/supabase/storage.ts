import type { createAdminClient } from "./admin";

export const MENU_PHOTOS_BUCKET = "menu-photos";

export function pathFromPublicUrl(url: string | null): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${MENU_PHOTOS_BUCKET}/`;
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.slice(idx + marker.length);
}

export async function removeStorageObjectForUrl(
  admin: ReturnType<typeof createAdminClient>,
  url: string | null,
) {
  const path = pathFromPublicUrl(url);
  if (!path) return;
  await admin.storage.from(MENU_PHOTOS_BUCKET).remove([path]);
}
