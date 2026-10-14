import { createClient } from "@/lib/supabase/client";
import type { DailySpecial, MenuItem } from "@/lib/types/database";

// PostgREST's JSON encoding for `numeric`/`decimal` columns isn't worth
// trusting blindly across client versions — coerce once here so every
// consumer can do plain arithmetic on price/total fields.
function toMenuItem(row: MenuItem): MenuItem {
  return { ...row, price: Number(row.price) };
}
function toDailySpecial(row: DailySpecial): DailySpecial {
  return { ...row, price: Number(row.price) };
}
/** Dishes Turay marked available for today's online board. */
export async function getTodaysMenuItems(): Promise<MenuItem[]> {
  const { data, error } = await createClient()
    .from("menu_items")
    .select("*")
    .eq("is_available", true)
    .order("category")
    .order("name");
  if (error) throw error;
  return ((data ?? []) as MenuItem[]).map(toMenuItem);
}

export async function getActiveDailySpecials(): Promise<DailySpecial[]> {
  const { data, error } = await createClient()
    .from("daily_specials")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as DailySpecial[]).map(toDailySpecial);
}
