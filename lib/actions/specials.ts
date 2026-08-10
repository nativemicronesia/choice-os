"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireOwnerSession } from "@/lib/auth/require";
import { MENU_PHOTOS_BUCKET, removeStorageObjectForUrl } from "@/lib/supabase/storage";
import { revalidatePath } from "next/cache";

export type DailySpecialInput = {
  id?: string;
  title: string;
  description: string | null;
  price: number;
  active: boolean;
  image_url: string | null;
};

export async function upsertDailySpecial(
  input: DailySpecialInput,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  await requireOwnerSession();
  const admin = createAdminClient();
  const row = {
    title: input.title,
    description: input.description,
    price: input.price,
    active: input.active,
    image_url: input.image_url,
  };

  if (input.id) {
    const { data: existing } = await admin
      .from("daily_specials")
      .select("image_url")
      .eq("id", input.id)
      .single();

    const { data, error } = await admin
      .from("daily_specials")
      .update(row)
      .eq("id", input.id)
      .select("id")
      .single();
    if (error) return { success: false, error: error.message };

    if (existing?.image_url && existing.image_url !== row.image_url) {
      await removeStorageObjectForUrl(admin, existing.image_url);
    }

    revalidatePath("/");
    revalidatePath("/os/day");
    return { success: true, id: data.id };
  }

  const { data, error } = await admin.from("daily_specials").insert(row).select("id").single();
  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/os/day");
  return { success: true, id: data.id };
}

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function uploadDailySpecialPhoto(
  formData: FormData,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  await requireOwnerSession();
  const file = formData.get("file");
  if (!(file instanceof File)) return { success: false, error: "No file provided" };
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: "Use a JPEG, PNG, or WEBP photo" };
  }
  if (file.size > MAX_UPLOAD_BYTES) return { success: false, error: "Photo is too large (max 5MB)" };

  const admin = createAdminClient();
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `daily-specials/${crypto.randomUUID()}.${ext}`;

  const { error } = await admin.storage
    .from(MENU_PHOTOS_BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (error) return { success: false, error: error.message };

  const { data } = admin.storage.from(MENU_PHOTOS_BUCKET).getPublicUrl(path);
  return { success: true, url: data.publicUrl };
}

export async function deleteDailySpecialPhoto(url: string): Promise<void> {
  await requireOwnerSession();
  await removeStorageObjectForUrl(createAdminClient(), url);
}
