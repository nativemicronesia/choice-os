-- Choice Phase 5: canceled orders leave the active kitchen, and pickup
-- completion records cash exactly once on the order itself.
alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check
    check (status in ('pending', 'cooking', 'ready', 'completed', 'cancelled'));

alter table public.orders
  add column cash_collected_at timestamptz;

-- Before this migration, completing a ticket was the only signal that a
-- cash pickup had been collected. Preserve that historical meaning.
update public.orders
set cash_collected_at = updated_at
where status = 'completed';

alter table public.orders
  add constraint orders_cash_collection_status_check
    check (
      (status = 'completed' and cash_collected_at is not null)
      or (status <> 'completed' and cash_collected_at is null)
    );

create or replace function public.guard_order_cash_collection()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.cash_collected_at is not null and new.cash_collected_at is distinct from old.cash_collected_at then
    raise exception 'Cash collection is already recorded';
  end if;

  if old.cash_collected_at is null and new.cash_collected_at is not null
     and (old.status <> 'ready' or new.status <> 'completed') then
    raise exception 'Cash can only be recorded while completing a ready pickup';
  end if;

  return new;
end;
$$;

create trigger orders_guard_cash_collection
  before update of status, cash_collected_at on public.orders
  for each row
  execute function public.guard_order_cash_collection();

comment on column public.orders.cash_collected_at is
  'Set once when a ready cash pickup is completed; NULL means cash has not been collected.';
