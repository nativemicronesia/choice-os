-- choice-os Phase 1: menu_items, daily_specials, orders, order_items
-- gen_random_uuid() is built into PostgreSQL 13+ (Supabase runs 15+), no extension needed.

-- ============================================================
-- Tables
-- ============================================================

create table menu_items (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  category      text not null, -- free text, matches UI filter tabs:
                                -- 'Local Specials', 'Burgers & Sandwiches', 'Sides', 'Cold Drinks'
  description   text,
  price         decimal(10,2) not null check (price >= 0),
  is_available  boolean not null default true,
  image_url     text,
  created_at    timestamptz not null default now()
);

create table daily_specials (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  price        decimal(10,2) not null check (price >= 0),
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

create table orders (
  id             uuid primary key default gen_random_uuid(),
  customer_name  text not null,
  status         text not null default 'pending'
                   check (status in ('pending', 'cooking', 'ready', 'completed')),
  total          decimal(10,2) not null check (total >= 0),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table order_items (
  id                    uuid primary key default gen_random_uuid(),
  order_id              uuid not null references orders(id) on delete cascade,
  item_name             text not null,
  quantity              int not null check (quantity > 0),
  price_at_time         decimal(10,2) not null check (price_at_time >= 0),
  special_instructions  text
);

-- ============================================================
-- Indexes
-- ============================================================

create index idx_menu_items_category   on menu_items(category);
create index idx_daily_specials_active on daily_specials(active);
create index idx_orders_status         on orders(status);
create index idx_orders_created_at     on orders(created_at desc);
create index idx_order_items_order_id  on order_items(order_id); -- FKs are not auto-indexed in Postgres

-- ============================================================
-- updated_at trigger — bump on every status change, needed for
-- realtime + the manager's "active ticket count" analytics card.
-- ============================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_set_updated_at
  before update on orders
  for each row
  execute function set_updated_at();

-- ============================================================
-- Row Level Security
-- No Supabase Auth exists in this app (customers order by name only,
-- staff have no login). anon key = public read + order placement only.
-- All other writes go through the service-role key server-side, which
-- bypasses RLS entirely — that's why there are no UPDATE/DELETE policies.
-- ============================================================

alter table menu_items    enable row level security;
alter table daily_specials enable row level security;
alter table orders        enable row level security;
alter table order_items   enable row level security;

-- Menu and specials: public read-only. Manager writes (stock toggle,
-- Banner Editor) happen via the service-role client in Server Actions.
create policy "menu_items_select" on menu_items
  for select using (true);

create policy "daily_specials_select" on daily_specials
  for select using (true);

-- Orders: customers can place an order and read any order (needed for
-- /order/[id] tracking and the KDS board, both driven by the anon key).
-- Only 'pending' orders may be created by the client; status/total
-- integrity beyond that is enforced by the CHECK constraints above.
create policy "orders_select" on orders
  for select using (true);

create policy "orders_insert" on orders
  for insert with check (status = 'pending');

-- No update/delete policy for orders -> blocked for the anon key.
-- KDS status transitions ('pending'->'cooking'->'ready'->'completed')
-- and manager actions require SUPABASE_SERVICE_ROLE_KEY server-side.

-- Order items: readable by anyone (KDS ticket display, order tracker),
-- insertable only while the parent order is still 'pending' — prevents
-- appending items to a ticket that's already in the kitchen.
create policy "order_items_select" on order_items
  for select using (true);

create policy "order_items_insert" on order_items
  for insert with check (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and orders.status = 'pending'
    )
  );

-- No update/delete policy for order_items -> blocked for the anon key.

-- ============================================================
-- Realtime — critical requirement: KDS (/kds) and the order tracker
-- (/order/[id]) must see status changes over WebSocket in <100ms.
-- ============================================================

alter publication supabase_realtime add table orders;
