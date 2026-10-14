-- Phase 1 hardening: order placement is a single trusted transaction and
-- private ticket rows are never readable with the public Supabase key.

alter table public.orders
  add column tracking_token_hash text unique;

drop policy if exists orders_select on public.orders;
drop policy if exists orders_insert on public.orders;
drop policy if exists order_items_select on public.order_items;
drop policy if exists order_items_insert on public.order_items;

-- The owner UI and customer tracker now read through server-only code.
-- There is intentionally no anon/authenticated policy for either table.
revoke all on public.orders, public.order_items from anon, authenticated;
grant all on public.orders, public.order_items to service_role;

create or replace function public.place_pickup_order(
  p_customer_name text,
  p_items jsonb,
  p_tracking_token_hash text
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_order_id uuid;
  v_item_count integer;
  v_valid_count integer;
  v_total numeric(10,2);
  v_canonical_items jsonb;
begin
  if p_customer_name is null or length(btrim(p_customer_name)) not between 1 and 80 then
    raise exception 'Enter a name up to 80 characters';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'Order items must be an array';
  end if;
  if jsonb_array_length(p_items) not between 1 and 30 then
    raise exception 'An order must contain 1 to 30 menu lines';
  end if;
  if p_tracking_token_hash is null or p_tracking_token_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid tracking token';
  end if;

  select count(*) into v_item_count
  from jsonb_to_recordset(p_items) as line(item_id uuid, quantity integer, special_instructions text);

  if v_item_count <> jsonb_array_length(p_items) then
    raise exception 'Invalid order lines';
  end if;
  if exists (
    select 1
    from jsonb_to_recordset(p_items) as line(item_id uuid, quantity integer, special_instructions text)
    where line.item_id is null
       or line.quantity is null or line.quantity not between 1 and 20
       or length(coalesce(line.special_instructions, '')) > 250
  ) then
    raise exception 'Invalid quantity or instructions';
  end if;
  if exists (
    select 1
    from jsonb_to_recordset(p_items) as line(item_id uuid, quantity integer, special_instructions text)
    group by line.item_id having count(*) > 1
  ) then
    raise exception 'Duplicate menu lines are not allowed';
  end if;

  select count(*), coalesce(sum(menu.price * line.quantity), 0),
         jsonb_agg(jsonb_build_object(
           'item_id', menu.id,
           'item_name', menu.name,
           'quantity', line.quantity,
           'price_at_time', menu.price,
           'special_instructions', nullif(btrim(line.special_instructions), '')
         ) order by menu.name)
    into v_valid_count, v_total, v_canonical_items
  from jsonb_to_recordset(p_items) as line(item_id uuid, quantity integer, special_instructions text)
  join public.menu_items as menu on menu.id = line.item_id and menu.is_available;

  if v_valid_count <> v_item_count then
    raise exception 'One or more menu items are unavailable';
  end if;

  insert into public.orders (customer_name, status, total, tracking_token_hash)
  values (btrim(p_customer_name), 'pending', v_total, p_tracking_token_hash)
  returning id into v_order_id;

  insert into public.order_items (order_id, item_name, quantity, price_at_time, special_instructions)
  select v_order_id, line.item_name, line.quantity, line.price_at_time, line.special_instructions
  from jsonb_to_recordset(v_canonical_items) as line(
    item_id uuid,
    item_name text,
    quantity integer,
    price_at_time numeric,
    special_instructions text
  );

  return v_order_id;
end;
$$;

revoke all on function public.place_pickup_order(text, jsonb, text) from public, anon, authenticated;
grant execute on function public.place_pickup_order(text, jsonb, text) to service_role;
