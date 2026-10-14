# Choice OS — Choice Fast Food

Turay’s restaurant OS for Choice Fast Food in Weno, Chuuk (FSM): public pickup
storefront + owner tools for today’s menu, kitchen display, and day ops.
Next.js + Supabase (Postgres + Realtime).

## Product model

- Walk-in stays primary for regulars.
- Website = order ahead → pick up → pay cash.
- Owner signs in from the storefront account icon into **Choice OS**:
  - **Today’s menu** — dish library + what’s orderable online today
  - **Kitchen** (`/kds`) — live tickets + chime
  - **Day** — today’s numbers + specials banner

## Quick start without a database

Choice includes an explicit in-memory fixture mode for local workflow
development. It uses the checked-in sample menu and specials, simulates order
placement and owner edits, and resets changes when the app restarts. It does
not verify Supabase migrations, RLS, storage, or Realtime delivery.

```bash
cd /Users/dave/NMH/choice-os
cp .env.example .env.local
# Fixture mode and owner@example.test are prefilled; leave Supabase values empty.
# Set SESSION_SECRET to a random value of at least 16 characters.
npm run hash-password -- 'choose-a-password'
# Paste the generated hash into OWNER_PASSWORD_HASH.
CHOICE_DATA_MODE=fixtures NEXT_PUBLIC_CHOICE_DATA_MODE=fixtures npm run dev
```

Fixture mode requires no Supabase credentials or database service. Orders and
owner edits live in app-process memory. Image uploads are unavailable. See
[docs/LOCAL-DEVELOPMENT.md](./docs/LOCAL-DEVELOPMENT.md) for workflow details
and verification boundaries.

Dev: `npm run dev` (port 3003).

- Storefront: http://localhost:3003
- Owner login: http://localhost:3003/login
- OS menu: http://localhost:3003/os/menu

Sign in with `owner@example.test` and the development password used to generate
the local hash. Never reuse production credentials; keep `.env.local` out of
commits.

## Docs

- [docs/SCHEMA.md](./docs/SCHEMA.md) — schema notes
- [docs/LOCAL-DEVELOPMENT.md](./docs/LOCAL-DEVELOPMENT.md) — isolated local database and tests
- [docs/DEPLOY.md](./docs/DEPLOY.md) — Docker / Cloudflare deploy
- [CLAUDE.md](./CLAUDE.md) — project law
