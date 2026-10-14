-- Choice Phase 3: accept scheduled specials through the same trusted,
-- atomic pickup checkout path as menu items. Prices always come from rows.
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
    raise exception 'An order must contain 1 to 30 lines';
  end if;
  if p_tracking_token_hash is null or p_tracking_token_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid tracking token';
  end if;

  select count(*) into v_item_count
  from jsonb_to_recordset(p_items) as line(item_id uuid, item_type text, quantity integer, special_instructions text);

  if v_item_count <> jsonb_array_length(p_items) then
    raise exception 'Invalid order lines';
  end if;
  if exists (
    select 1
    from jsonb_to_recordset(p_items) as line(item_id uuid, item_type text, quantity integer, special_instructions text)
    where line.item_id is null
       or line.item_type is null or line.item_type not in ('menu', 'special')
       or line.quantity is null or line.quantity not between 1 and 20
       or length(coalesce(line.special_instructions, '')) > 250
  ) then
    raise exception 'Invalid item type, quantity, or instructions';
  end if;
  if exists (
    select 1
    from jsonb_to_recordset(p_items) as line(item_id uuid, item_type text, quantity integer, special_instructions text)
    group by line.item_type, line.item_id having count(*) > 1
  ) then
    raise exception 'Duplicate order lines are not allowed';
  end if;

  with requested as (
    select line.item_id, line.item_type, line.quantity, line.special_instructions,
           menu.id as menu_id, menu.name as menu_name, menu.price as menu_price,
           special.id as special_id, special.title as special_title, special.price as special_price
    from jsonb_to_recordset(p_items) as line(item_id uuid, item_type text, quantity integer, special_instructions text)
    left join public.menu_items as menu
      on line.item_type = 'menu' and menu.id = line.item_id and menu.is_available
    left join public.daily_specials as special
      on line.item_type = 'special'
     and special.id = line.item_id
     and special.active
     and (
       special.frequency = 'daily'
       or extract(dow from pg_catalog.timezone('Pacific/Pohnpei', pg_catalog.now()))::smallint = any(special.weekdays)
     )
  ), canonical as (
    select coalesce(menu_id, special_id) as item_id,
           coalesce(menu_name, special_title) as item_name,
           quantity,
           coalesce(menu_price, special_price) as price_at_time,
           nullif(btrim(special_instructions), '') as special_instructions
    from requested
  )
  select count(item_id), coalesce(sum(price_at_time * quantity), 0),
         jsonb_agg(jsonb_build_object(
           'item_id', item_id,
           'item_name', item_name,
           'quantity', quantity,
           'price_at_time', price_at_time,
           'special_instructions', special_instructions
         ) order by item_name)
    into v_valid_count, v_total, v_canonical_items
  from canonical;

  if v_valid_count <> v_item_count then
    raise exception 'One or more items are unavailable or outside their schedule';
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
