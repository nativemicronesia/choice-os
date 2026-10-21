# Choice OS preview (Turay's private workspace)

Preview-first, like Flip It Guam: `/os` opens straight to Home with no login and
only demonstration data. Nothing here touches Supabase, payments, email or the
real `/api/orders` pipeline, and nothing reaches the restaurant.

## Routes
| Route | Purpose |
|---|---|
| `/os` | Home: orders to work on, quick actions, Today's Menu availability |
| `/os/orders` | Orders workspace: New → Accepted → Preparing → Ready → Completed |
| `/os/menu` | Today's Menu and Featured Specials: add, edit, remove, availability, photo |
| `/os/more` | Preview status, items awaiting Turay's confirmation, reset |
| `/os/live/*`, `/kds`, `/admin` | Original Supabase-backed pages. Still login-gated, unused by the preview |

## Auth
`lib/auth/preview.ts` → `previewOsEnabled()`. On by default; set
`CHOICE_OS_PREVIEW=off` and `/os/*` returns to the owner login (proxy.ts and the
workspace layout both enforce it). Session, login and `requireOwnerSession` are untouched.

## Data
* `lib/preview-os/logic.ts`: pure state transitions (tested: `npm run test:preview-os`).
* `lib/preview-os/store.ts`: browser `localStorage` (`choice-os-preview:v1`), live across tabs.
* Seed dishes reuse the storefront demo catalog ids (`burger`, `ramen`, …) with
  prices unset. Seed orders are labelled Sample.

## Storefront seam (OS side)
The OS and storefront merge into one Next app (same origin) but the storefront
keeps submissions in server memory, so the seam is server-side, not shared storage:

* **Orders in**: `GET /api/os-preview/storefront-orders` returns
  `globalThis.__choicePreviewOrders` (what `lib/storefront/demo-orders.ts` fills).
  The OS polls it every 6 s and on tab focus, importing each `reference` once as a
  **New** order. No imports from storefront files, so either branch builds alone.
* **Menu out**: the OS `PUT`s `/api/os-preview/menu` after each menu change;
  `GET /api/os-preview/menu` returns `{ dishes: [{id,name,description,price,available,group}], updatedAt }`
  (or `dishes: null` before the OS has been opened). Photos are not in the feed.
  The storefront can read it to reflect Today's Menu / Featured Specials; until it
  does, its static catalog is unchanged.

Limits: server memory is per-instance and resets on redeploy or cold start
(serverless). That is acceptable for a demo; OS edits and order progress persist
in Turay's browser regardless. Production replaces both endpoints with the real database.
