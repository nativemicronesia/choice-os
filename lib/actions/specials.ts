"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireOwnerSession } from "@/lib/auth/require";
import { revalidatePath } from "next/cache";

export type DailySpecialInput = {
  id?: string;
  title: string;
  description: string | null;
  price: number;
  active: boolean;
};

export async function upsertDailySpecial(
  input: DailySpecialInput,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  await requireOwnerSession();
  const admin = createAdminClient();

  if (input.id) {
    const { data, error } = await admin
      .from("daily_specials")
      .update({
        title: input.title,
        description: input.description,
        price: input.price,
        active: input.active,
      })
      .eq("id", input.id)
      .select("id")
      .single();
    if (error) return { success: false, error: error.message };
    revalidatePath("/");
    revalidatePath("/os/day");
    return { success: true, id: data.id };
  }

  const { data, error } = await admin
    .from("daily_specials")
    .insert({
      title: input.title,
      description: input.description,
      price: input.price,
      active: input.active,
    })
    .select("id")
    .single();
  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/os/day");
  return { success: true, id: data.id };
}
