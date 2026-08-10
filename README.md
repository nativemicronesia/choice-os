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
# fill Supabase keys + DATABASE_URL
# set SESSION_SECRET, OWNER_EMAIL, OWNER_PASSWORD_HASH
npm run hash-password -- 'choose-a-password'
# paste hash into OWNER_PASSWORD_HASH
npm install
npx supabase link --project-ref <ref>
npm run db:push
npm run db:seed
npm run dev
```

Dev: `npm run dev` (port 3003).

- Storefront: http://localhost:3003
- Owner login: http://localhost:3003/login
- OS menu: http://localhost:3003/os/menu

## Docs

- [docs/SCHEMA.md](./docs/SCHEMA.md) — schema notes
- [docs/DEPLOY.md](./docs/DEPLOY.md) — Docker / Cloudflare deploy
- [CLAUDE.md](./CLAUDE.md) — project law
