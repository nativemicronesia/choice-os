# Isolated local development

Choice uses the Supabase CLI's local stack. Do not link this checkout to an NMH
hosted project for development. The local Supabase API is configured on
`127.0.0.1:54321`, with Postgres on `127.0.0.1:54322` in `supabase/config.toml`.

## Start the database

Install a container runtime supported by the current Supabase CLI (Docker or
Podman), then run:

```bash
npm run db:start
npm run db:reset
npx supabase status
```

`db:reset` rebuilds the local database from the committed migrations and
`supabase/seed.sql`; it discards local data and test orders. Copy the local API
URL, anon key, and service-role key shown by `supabase status` into `.env.local`.
Use only values from the local stack. Do not use `supabase link`, `db push`,
`--linked`, or an NMH project's URL or keys in this workflow.

Set `NEXT_PUBLIC_SITE_URL=http://localhost:3003`, `SESSION_SECRET` (at least 16
random characters), `OWNER_EMAIL`, and an `OWNER_PASSWORD_HASH` generated with
`npm run hash-password`. Keep `.env.local` untracked.

## Run and check the app

```bash
npm run dev
npm run test:order-flow
```

The local order-flow check expects the app at `http://localhost:3003` and
refuses Supabase URLs outside loopback on port 54321. It uses a seeded available
menu item, creates one temporary development order through the app, checks the
stored total and item price against the database menu, verifies anonymous order
reads and raw inserts are denied, checks the tracking-cookie boundary, and
deletes its test order afterward.

To include the successful owner-login check, set `CHOICE_LOCAL_TEST_EMAIL` and
`CHOICE_LOCAL_TEST_PASSWORD` to the development-only owner credentials used by
the running local app. Do not put production credentials in test commands.

To inspect the local schema and migration status, use:

```bash
npx supabase migration list --local
npm run db:stop
```

## Access boundaries

- Menu items and active specials are public reads.
- Orders and order items have no anon or authenticated read/write policy.
- Checkout calls the server-only `place_pickup_order` RPC. The SQL function
  validates availability and quantity, snapshots current menu names/prices,
  calculates the total, and writes the order and items in one transaction.
- The server returns an HttpOnly cookie scoped to `/order/<id>`. The database
  stores only its SHA-256 hash. A tracker page or status refresh must match both
  the order ID and that hash before reading.
- Owner order/menu reads and all owner mutations require the existing owner
  session before the server uses the service-role client.
- Direct browser `postgres_changes` subscriptions to orders have been removed.
  KDS and the owner day card refresh through owner-checked server actions; the
  customer tracker refreshes through its scoped capability every 2.5–5 seconds.
  The existing publication remains in the schema for a future authorized
  realtime relay.

The current environment is an Intel Mac on macOS Monterey. Supabase's native
local runtime is not supported there, so a container runtime is required. The
current Podman 5 runtime initializes a machine but its bundled `vfkit` refuses
to boot on Monterey (`unsupported macOS version`). Current Rancher Desktop also
requires macOS 13 or newer. The local database stack therefore remains blocked
on this host until it has a supported container runtime or a newer compatible
macOS version. Podman 4.9.3 has been reported as a QEMU workaround for Monterey,
but its package signature did not verify on this host and it was not run.

Once a supported runtime is available, the local stack also needs network
access to fetch its service images the first time it starts. Browser automation
is not included in this prototype's package; `test:order-flow` is an HTTP plus
database smoke test, not a visual browser test. A manual responsive browser
pass remains to be completed when the local services are running.
