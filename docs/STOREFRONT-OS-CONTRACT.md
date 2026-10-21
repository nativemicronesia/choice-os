# Storefront ↔ Choice OS demo-order interface

Branch `storefront-preview` (worktree `../choice-os-storefront`) owns the public
preview. It deliberately does **not** touch `/os`, `/kds`, `/admin`, auth, Supabase
or the real `/api/orders` pipeline.

## What the storefront owns
`app/(preview)/**`, `components/storefront/**`, `lib/storefront/**`,
`app/api/preview-order/route.ts`, `public/choice/**`, this doc.
(It also removed `app/(shop)/page.tsx`, which `/` now serves from `(preview)`.)

## The seam
`lib/storefront/demo-orders.ts` is the only contact point:

- `submitPreviewOrder(request)` is called by `POST /api/preview-order` after validation.
- `listPreviewOrders()` returns `PreviewOrderRecord[]` (`demo: true`, `source: "storefront-preview"`,
  `reference` like `DEMO-AB12`, lines as `{ itemId, quantity }`, name, contact, location preference, note).

Records live in process memory only (capped at 100). To show them in OS demos, the OS
terminal can import `listPreviewOrders()` server-side from its own pages. Item ids come
from `lib/storefront/catalog.ts` (demo catalog, prices null). Mapping those to the OS
fixture menu is a decision for after Turay confirms the real menu.
