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
- RLS: every table has RLS enabled. The anon key may read menu items and daily
  specials only. It cannot read or write `orders`/`order_items`. Never restore
  public order reads for tracking or the kitchen.
- Checkout posts only menu-item IDs, quantities, a customer name, and optional
  instructions to `/api/orders`. The server calls `place_pickup_order`, which
  checks availability, copies current names/prices, calculates the total, and
  inserts the order plus all items in one transaction. Do not accept prices or
  totals from a browser.
- Each pickup order gets a random tracking capability in an HttpOnly cookie
  scoped to its order URL; only a SHA-256 hash is stored. Tracker reads must
  verify the capability server-side. Owner reads use the service-role client
  only after `requireOwnerSession()`.
- `orders.status` transitions: `pending -> cooking -> ready -> completed` only,
  enforced by the CHECK constraint. Any new status value needs a migration.
- Realtime: `orders` remains in the `supabase_realtime` publication, but
  browser clients must never subscribe directly to order row changes. KDS and
  owner analytics use private Broadcast topics disclosed only after the owner
  session check; customer tracking uses the order's high-entropy capability
  hash. Channel-join RLS validates each topic, and Broadcast payloads contain
  only order IDs/statuses or status timestamps. Server actions provide snapshots
  and a 30-second fallback.
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
- Deploy: the Docker container runs only the Next.js app — Supabase stays
  hosted, never containerized here. `nginx/certs/*.pem` are real TLS material
  and must never be committed (gitignored, user-provided per `docs/DEPLOY.md`).
  The domain lives in exactly two places (`nginx.conf`'s two `server_name`
  lines) — keep them in sync. TLS is a Cloudflare Origin CA cert terminated
  at nginx (paired with Cloudflare's "Full (strict)" mode) — deliberate
  choice over Let's Encrypt/Certbot, since the origin cert is only ever seen
  by Cloudflare itself. Don't add Certbot without revisiting that decision.
