# Schema notes

The original schema spec arrived as a paste split across many small messages, and a few fields were cut off in transit. These gaps were filled during Phase 1 planning — recorded here so Phase 2 doesn't relitigate them:

- `menu_items.name` — not in the original paste (only `category`, `description`, `price`, `is_available`, `image_url`, `created_at` survived). Added as `text not null` since a menu item obviously needs a name.
- `daily_specials.title` — the field name was cut off, only "... NOT NULL" survived. Inferred as `title text not null` from the Banner Editor spec ("title, description, price, and active toggle").
- `daily_specials.active` — inferred from "active toggle" wording. Named `active`, not `is_available`, to match the user's own phrasing and to distinguish it from `menu_items.is_available` (different concept: a special being "active" vs. a menu item being "in stock").
- `orders` — only `status` and `created_at` survived the paste. Added `id`, `customer_name`, `total`, `updated_at`. `customer_name` (required, no phone, no auth) was confirmed directly with the user: orders identify a customer by name only (e.g. "Order for Mary" on the kitchen ticket).

See `supabase/migrations/20260805120000_init_schema.sql` for the full DDL, RLS policies, and the `orders` realtime publication.

The hardening migration `20261014141725_secure_order_checkout.sql` adds a
tracking-token hash to orders and a service-role-only `place_pickup_order`
function. That function snapshots current available menu prices and inserts
the order and its items atomically. It also removes public order and order-item
read/write access; tracking and owner reads now go through server-side checks.
