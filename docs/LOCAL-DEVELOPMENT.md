# Local development and fixture verification

Use Choice's in-memory fixtures for app workflow work when no Choice development
database is available. This mode uses the menu and daily/weekly-special examples
from `supabase/seed.sql`, while keeping orders and owner edits in process memory.
Restarting the Next.js server resets all fixture changes.

## Run with fixtures

```bash
cd /Users/dave/NMH/choice-os
cp .env.example .env.local
```

In `.env.local`, set:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3003
CHOICE_DATA_MODE=fixtures
NEXT_PUBLIC_CHOICE_DATA_MODE=fixtures
SESSION_SECRET=<random string of at least 16 characters>
OWNER_EMAIL=owner@example.test
OWNER_PASSWORD_HASH=<hash generated below>
```

Generate a development-only owner password hash with `npm run hash-password --
'your-development-password'`, paste it into `OWNER_PASSWORD_HASH`, then run
`npm run dev`. The owner session and owner-only Server Action checks remain in
place in fixture mode. Do not reuse production credentials. No Supabase URL,
key, project, account, or database is needed.

Open `http://localhost:3003` to browse the menu and scheduled specials, add food
and quantities to the cart, add optional item instructions, submit a cash pickup
order, and follow its private
tracking link. Sign in at `/login` to edit the menu and specials, open `/kds` to
advance the ticket, and review daily totals under `/os/day`. The fixture banner
labels the simulated data on customer and owner pages. Kitchen, owner totals,
and customer status refresh every two seconds; Supabase Realtime is not
connected in fixture mode. Photo storage uploads are unavailable.

The Day screen shows order count, cash collected for completed pickups, active
tickets, and an expandable list of today's orders with Chuuk-local timestamps,
line quantities, instructions, prices, and status. The Kitchen screen keeps New,
Preparing, and Ready for Pickup tickets in separate lanes and refreshes fixture
state every two seconds; status buttons move tickets immediately in the shared
fixture store.

The fixture store validates item availability, special activation and Chuuk-day
schedule, quantities, and instructions. It copies each menu or special name and
price at checkout, calculates the total server-side, and adds the order and
lines together only after every line validates. Tracking reads
require the HttpOnly order capability cookie, and owner reads/mutations still
require the signed owner session. This exercises application behavior only; it
does not prove SQL atomicity, RLS, migrations, Supabase Auth, storage, or
Realtime policies.

## Database verification boundary

The Supabase migrations and `scripts/test-order-flow.ts` remain available for an
authorized, isolated Choice development database. The current workspace toolbelt
records the Choice Supabase reference as mismatched and authority-uncertain, and
Supabase CLI access as requiring human authentication. NWA's database belongs
to NWA and must not be used as Choice's data source. No live database was queried
or modified for fixture development. Database connection, migration application,
RLS behavior, and real-time delivery remain unverified here.

NMH's established browser-control MCP is unavailable to this Codex session, so
this change should be visually checked in the visible browser route when it is
available. Do not substitute a new automation/control route.
