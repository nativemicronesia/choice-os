"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireOwnerSession } from "@/lib/auth/require";
import { CATEGORIES, type Category } from "@/lib/types/database";
import { MENU_PHOTOS_BUCKET, removeStorageObjectForUrl } from "@/lib/supabase/storage";
import { revalidatePath } from "next/cache";
import {
  fixtureDeleteMenu,
  fixtureSetMenuAvailability,
  fixtureUpsertMenu,
  isChoiceFixtureMode,
} from "@/lib/dev/choice-fixtures";

export async function toggleMenuItemAvailability(
  itemId: string,
  isAvailable: boolean,
): Promise<{ success: true } | { success: false; error: string }> {
  await requireOwnerSession();
  if (isChoiceFixtureMode()) {
    if (!fixtureSetMenuAvailability(itemId, isAvailable)) return { success: false, error: "Menu item not found" };
    revalidatePath("/");
    revalidatePath("/os/menu");
    return { success: true };
  }
  const { error } = await createAdminClient()
    .from("menu_items")
    .update({ is_available: isAvailable })
    .eq("id", itemId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/os/menu");
  return { success: true };
}

export type MenuItemInput = {
  id?: string;
  name: string;
  category: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
};

function validateMenuInput(input: MenuItemInput): string | null {
  if (!input.name.trim() || input.name.trim().length > 120) return "Name is required (up to 120 characters)";
  if (!CATEGORIES.includes(input.category as Category)) return "Invalid category";
  if (!Number.isFinite(input.price) || input.price < 0 || input.price > 99_999_999.99) {
    return "Price must be between 0 and 99,999,999.99";
  }
  if (Math.abs(input.price * 100 - Math.round(input.price * 100)) > 0.000001) {
    return "Price must use no more than two decimal places";
  }
  if (input.description && input.description.length > 1000) return "Description is too long";
  return null;
}

export async function upsertMenuItem(
  input: MenuItemInput,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  await requireOwnerSession();
  const invalid = validateMenuInput(input);
  if (invalid) return { success: false, error: invalid };

  if (isChoiceFixtureMode()) {
    const saved = fixtureUpsertMenu({
      id: input.id ?? crypto.randomUUID(),
      name: input.name.trim(),
      category: input.category,
      description: input.description?.trim() || null,
      price: input.price,
      image_url: input.image_url?.trim() || null,
      is_available: input.is_available,
    });
    revalidatePath("/");
    revalidatePath("/os/menu");
    return { success: true, id: saved.id };
  }

  const admin = createAdminClient();
  const row = {
    name: input.name.trim(),
    category: input.category,
    description: input.description?.trim() || null,
    price: input.price,
    image_url: input.image_url?.trim() || null,
    is_available: input.is_available,
  };

  if (input.id) {
    const { data: existing } = await admin
      .from("menu_items")
      .select("image_url")
      .eq("id", input.id)
      .single();

    const { data, error } = await admin
      .from("menu_items")
      .update(row)
      .eq("id", input.id)
      .select("id")
      .single();
    if (error) return { success: false, error: error.message };

    if (existing?.image_url && existing.image_url !== row.image_url) {
      await removeStorageObjectForUrl(admin, existing.image_url);
    }

    revalidatePath("/");
    revalidatePath("/os/menu");
    return { success: true, id: data.id };
  }

  const { data, error } = await admin.from("menu_items").insert(row).select("id").single();
  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/os/menu");
  return { success: true, id: data.id };
}

export async function deleteMenuItem(
  itemId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  await requireOwnerSession();
  if (isChoiceFixtureMode()) {
    const deleted = fixtureDeleteMenu(itemId);
    if (!deleted) return { success: false, error: "Menu item not found" };
    revalidatePath("/");
    revalidatePath("/os/menu");
    return { success: true };
  }
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("menu_items")
    .select("image_url")
    .eq("id", itemId)
    .single();

  const { error } = await admin.from("menu_items").delete().eq("id", itemId);
  if (error) return { success: false, error: error.message };

  if (existing?.image_url) {
    await removeStorageObjectForUrl(admin, existing.image_url);
  }

  revalidatePath("/");
  revalidatePath("/os/menu");
  return { success: true };
}

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function uploadMenuItemPhoto(
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
  const path = `menu-items/${crypto.randomUUID()}.${ext}`;

  const { error } = await admin.storage
    .from(MENU_PHOTOS_BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (error) return { success: false, error: error.message };

  const { data } = admin.storage.from(MENU_PHOTOS_BUCKET).getPublicUrl(path);
  return { success: true, url: data.publicUrl };
}

export async function deleteMenuItemPhoto(url: string): Promise<void> {
  await requireOwnerSession();
  if (isChoiceFixtureMode()) return;
  await removeStorageObjectForUrl(createAdminClient(), url);
}
