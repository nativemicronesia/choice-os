import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// No generated Database type exists (no live Supabase project yet, and this
// project deliberately has no ORM/codegen step) — <any> opts out of
// supabase-js's schema-typed .from() overloads; call sites rely on the
// hand-written types in lib/types/database.ts instead (see queries.ts).
let client: ReturnType<typeof createSupabaseClient<any>> | undefined;

export function createClient() {
  if (client) return client;
  client = createSupabaseClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return client;
}
