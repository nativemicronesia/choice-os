"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireOwnerSession } from "@/lib/auth/require";
import { MENU_PHOTOS_BUCKET, removeStorageObjectForUrl } from "@/lib/supabase/storage";
import { revalidatePath } from "next/cache";
import { fixtureUpsertSpecial, isChoiceFixtureMode } from "@/lib/dev/choice-fixtures";

export type DailySpecialInput = {
  id?: string;
  title: string;
  description: string | null;
  price: number;
  active: boolean;
  frequency: "daily" | "weekly";
  weekdays: number[];
  image_url: string | null;
};

export async function upsertDailySpecial(
  input: DailySpecialInput,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  await requireOwnerSession();
  if (!input || typeof input !== "object" || typeof input.title !== "string") {
    return { success: false, error: "Invalid special details" };
  }
  const title = input.title.trim();
  if (!title || title.length > 120) return { success: false, error: "Title is required (up to 120 characters)" };
  if (!Number.isFinite(input.price) || input.price < 0 || input.price > 99_999_999.99) {
    return { success: false, error: "Price must be between 0 and 99,999,999.99" };
  }
  if (Math.abs(input.price * 100 - Math.round(input.price * 100)) > 0.000001) {
    return { success: false, error: "Price must use no more than two decimal places" };
  }
  if (input.description !== null && typeof input.description !== "string") {
    return { success: false, error: "Invalid special description" };
  }
  if (input.description && input.description.length > 1000) return { success: false, error: "Description is too long" };
  if (typeof input.active !== "boolean" || (input.frequency !== "daily" && input.frequency !== "weekly")) {
    return { success: false, error: "Invalid special schedule" };
  }
  if (!Array.isArray(input.weekdays)) return { success: false, error: "Invalid weekday selection" };
  if (input.image_url !== null && typeof input.image_url !== "string") {
    return { success: false, error: "Invalid special image" };
  }
  const weekdays = [...new Set(input.weekdays)];
  if (input.frequency === "weekly" && (
    weekdays.length < 1 || weekdays.some((day) => !Number.isInteger(day) || day < 0 || day > 6)
  )) return { success: false, error: "Choose at least one valid weekday for a weekly special" };
  if (input.frequency === "daily" && weekdays.length > 0) {
    return { success: false, error: "Daily specials cannot have weekday restrictions" };
  }
  if (isChoiceFixtureMode()) {
    const saved = fixtureUpsertSpecial({
      id: input.id ?? crypto.randomUUID(),
      title,
      description: input.description?.trim() || null,
      price: input.price,
      active: input.active,
      frequency: input.frequency,
      weekdays,
      image_url: input.image_url?.trim() || null,
    });
    revalidatePath("/");
    revalidatePath("/os/day");
    return { success: true, id: saved.id };
  }
  const admin = createAdminClient();
  const row = {
    title,
    description: input.description,
    price: input.price,
    active: input.active,
    frequency: input.frequency,
    weekdays,
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
  if (isChoiceFixtureMode()) return { success: false, error: "Photo uploads are not available in fixture mode" };
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
  if (isChoiceFixtureMode()) return;
  await removeStorageObjectForUrl(createAdminClient(), url);
}
