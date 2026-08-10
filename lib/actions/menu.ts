"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireOwnerSession } from "@/lib/auth/require";
import { CATEGORIES, type Category } from "@/lib/types/database";
import { revalidatePath } from "next/cache";

export async function toggleMenuItemAvailability(
  itemId: string,
  isAvailable: boolean,
): Promise<{ success: true } | { success: false; error: string }> {
  await requireOwnerSession();
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
  if (!input.name.trim()) return "Name is required";
  if (!CATEGORIES.includes(input.category as Category)) return "Invalid category";
  if (!(input.price >= 0) || Number.isNaN(input.price)) return "Price must be 0 or more";
  return null;
}

export async function upsertMenuItem(
  input: MenuItemInput,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  await requireOwnerSession();
  const invalid = validateMenuInput(input);
  if (invalid) return { success: false, error: invalid };

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
    const { data, error } = await admin
      .from("menu_items")
      .update(row)
      .eq("id", input.id)
      .select("id")
      .single();
    if (error) return { success: false, error: error.message };
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
  const { error } = await createAdminClient().from("menu_items").delete().eq("id", itemId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/os/menu");
  return { success: true };
}
