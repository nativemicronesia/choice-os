// Server-only. Never import from a Client Component — the service-role key
// bypasses every RLS policy in supabase/migrations/. All privileged writes
// (menu availability toggles, Banner Editor CRUD, order status transitions)
// must go through Server Actions/Route Handlers using this client.
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createSupabaseClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
