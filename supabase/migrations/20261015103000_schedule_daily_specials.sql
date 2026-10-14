-- Choice Phase 2: recurring daily and weekly specials.
alter table public.daily_specials
  add column frequency text not null default 'daily'
    check (frequency in ('daily', 'weekly')),
  add column weekdays smallint[] not null default '{}';

alter table public.daily_specials
  add constraint daily_specials_schedule_valid check (
    (frequency = 'daily' and cardinality(weekdays) = 0)
    or (
      frequency = 'weekly'
      and cardinality(weekdays) between 1 and 7
      and weekdays <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]
    )
  );
