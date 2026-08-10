# CHOICE-OS LAW
- Stack: Next.js 16 (App Router, TS strict), Tailwind 4, Supabase (Postgres + Realtime).
- No ORM. Schema lives in `supabase/migrations/*.sql`, hand-written raw SQL only —
  do not add drizzle-orm, prisma, or any query builder that owns migrations.
- Customers have no accounts — order by name, cash at pickup. Staff/owner use
  env-based login (`OWNER_EMAIL` + `OWNER_PASSWORD_HASH` + `SESSION_SECRET`).
  Public storefront stays open; `/os/*`, `/kds`, and `/admin` require an owner
  session (enforced in `proxy.ts` and again in Server Actions).
- Privileged writes (menu CRUD, stock toggle, specials, order status) go through
  `lib/supabase/admin.ts` (service-role key) in Server Actions after
  `requireOwnerSession()` — never expose `SUPABASE_SERVICE_ROLE_KEY` to a
  Client Component.
- RLS: every table has RLS enabled. anon key gets SELECT everywhere, INSERT
  only on `orders`/`order_items`. There is no UPDATE/DELETE policy for anon —
  that's intentional; don't add one without a written reason.
- `orders.status` transitions: `pending -> cooking -> ready -> completed` only,
  enforced by the CHECK constraint. Any new status value needs a migration.
- Realtime: `orders` is in the `supabase_realtime` publication (must stay —
  KDS and `/order/[id]` depend on <100ms updates). If you add tables that
  need live updates, add them to the publication in a new migration, don't
  edit the Phase 1 migration file after it's applied.
- Category values on `menu_items` are free text, not an enum — must match the
  UI's filter tabs exactly: 'Local Specials', 'Burgers & Sandwiches', 'Sides',
  'Cold Drinks'. Changing a tab label requires a data migration.
- Daily board model: `menu_items` is Turay's dish library; `is_available`
  means "on today's online board." Storefront uses `getTodaysMenuItems()` only.
- Mobile-first, low-bandwidth: Weno has weak mobile networks. No heavy client
  bundles, no unoptimized images, keep the customer path lean.
- Env: dedicated Supabase project for choice-os — never share project/keys
  with sweetoh-os, island-sprouts-os, nmh-os, or nwa-os.
- Dev port 3003 (avoid collision with sweetoh-os on 3002).
- Known Phase 1 limitation: the `orders` INSERT policy trusts the client-supplied
  `total` (only checks `status = 'pending'`). Acceptable for cash-at-pickup in
  Phase 1; Phase 3 should add a `SECURITY DEFINER` RPC that recomputes `total`
  server-side from `order_items` instead of trusting the client.
- Deploy: the Docker container runs only the Next.js app — Supabase stays
  hosted, never containerized here. `nginx/certs/*.pem` are real TLS material
  and must never be committed (gitignored, user-provided per `docs/DEPLOY.md`).
  The domain lives in exactly two places (`nginx.conf`'s two `server_name`
  lines) — keep them in sync. TLS is a Cloudflare Origin CA cert terminated
  at nginx (paired with Cloudflare's "Full (strict)" mode) — deliberate
  choice over Let's Encrypt/Certbot, since the origin cert is only ever seen
  by Cloudflare itself. Don't add Certbot without revisiting that decision.
