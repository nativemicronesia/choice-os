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

## Quick start

```bash
cd /Users/dave/NMH/choice-os
cp .env.example .env.local
# Start an isolated local Supabase stack (no `supabase link` required).
npm run db:start
npm run db:reset
# Copy the local API URL, anon key, and service-role key from `npx supabase status`
# into .env.local. Do not use credentials from another NMH project.
# set SESSION_SECRET, OWNER_EMAIL, OWNER_PASSWORD_HASH
npm run hash-password -- 'choose-a-password'
# paste hash into OWNER_PASSWORD_HASH
npm install
npm run dev
```

`db:reset` applies the checked-in migrations and development seed to the local
database. It discards local database data. Do not add `--linked` or point this
workflow at a hosted project.

The local database is managed by Supabase CLI and requires a compatible
container runtime (Docker or Podman). See [docs/LOCAL-DEVELOPMENT.md](./docs/LOCAL-DEVELOPMENT.md)
for runtime setup and verification details.

Dev: `npm run dev` (port 3003).

- Storefront: http://localhost:3003
- Owner login: http://localhost:3003/login
- OS menu: http://localhost:3003/os/menu

## Docs

- [docs/SCHEMA.md](./docs/SCHEMA.md) — schema notes
- [docs/LOCAL-DEVELOPMENT.md](./docs/LOCAL-DEVELOPMENT.md) — isolated local database and tests
- [docs/DEPLOY.md](./docs/DEPLOY.md) — Docker / Cloudflare deploy
- [CLAUDE.md](./CLAUDE.md) — project law
