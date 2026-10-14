-- Realtime is delivered through private Broadcast capabilities. Browser
-- clients never subscribe to rows in public.orders.

create table public.order_realtime_settings (
  name text primary key check (name = 'kds'),
  topic_token uuid not null default gen_random_uuid()
);

alter table public.order_realtime_settings enable row level security;
revoke all on public.order_realtime_settings from public, anon, authenticated;
grant select on public.order_realtime_settings to service_role;

insert into public.order_realtime_settings (name) values ('kds')
on conflict (name) do nothing;

-- Called only while Realtime checks a private Broadcast channel join. It
-- returns a boolean and never reveals the stored customer or kitchen token.
create or replace function public.choice_can_join_order_broadcast()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.orders as order_row
    where order_row.tracking_token_hash is not null
      and realtime.topic() = 'choice-order:' || order_row.tracking_token_hash
  ) or exists (
    select 1
    from public.order_realtime_settings as settings
    where realtime.topic() = 'choice-kds:' || settings.topic_token::text
  );
$$;

revoke all on function public.choice_can_join_order_broadcast() from public, authenticated;
grant execute on function public.choice_can_join_order_broadcast() to anon;

-- Supabase owns realtime.messages and its RLS setting. Add a narrow policy;
-- do not ALTER the realtime schema/table itself.
create policy "choice_order_capability_broadcast_read"
  on realtime.messages
  for select
  to anon
  using (
    extension = 'broadcast'
    and public.choice_can_join_order_broadcast()
  );

create or replace function public.broadcast_choice_order_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_kds_token uuid;
begin
  select settings.topic_token into v_kds_token
  from public.order_realtime_settings as settings
  where settings.name = 'kds';

  begin
    perform realtime.send(
      jsonb_build_object('order_id', new.id, 'status', new.status),
      'choice_order_changed',
      'choice-kds:' || v_kds_token::text,
      true
    );
  exception when others then
    -- Realtime is best-effort; a missing daily partition or a brief service
    -- issue must never roll back an order or a kitchen status transition.
    raise warning 'Choice kitchen broadcast could not be queued';
  end;

  if tg_op = 'UPDATE'
     and old.status is distinct from new.status
     and new.tracking_token_hash is not null then
    begin
      perform realtime.send(
        jsonb_build_object('status', new.status, 'updated_at', new.updated_at),
        'choice_order_status',
        'choice-order:' || new.tracking_token_hash,
        true
      );
    exception when others then
      raise warning 'Choice customer status broadcast could not be queued';
    end;
  end if;

  return new;
end;
$$;

revoke all on function public.broadcast_choice_order_change() from public, anon, authenticated;

create trigger orders_broadcast_choice_insert
  after insert on public.orders
  for each row execute function public.broadcast_choice_order_change();

create trigger orders_broadcast_choice_status
  after update of status on public.orders
  for each row execute function public.broadcast_choice_order_change();
