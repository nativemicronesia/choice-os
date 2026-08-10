-- Choice OS Phase 2: photo uploads for menu items & daily specials.
-- Adds a public Storage bucket for dish/special photos and an image_url
-- column on daily_specials (menu_items already has image_url from Phase 1).

-- ============================================================
-- Storage bucket
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'menu-photos',
  'menu-photos',
  true,
  5242880, -- 5 MB hard ceiling; client compresses to ~150-400KB before upload
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Public read for anyone — storefront renders these via next/image on the
-- public URL, exactly like any other Supabase-hosted image today.
create policy "menu_photos_public_read"
  on storage.objects for select
  using (bucket_id = 'menu-photos');

-- No insert/update/delete policy on storage.objects -> the anon key cannot
-- write. All uploads/deletes go through the service-role client
-- (lib/supabase/admin.ts) in Server Actions after requireOwnerSession(),
-- same rule as every other privileged write in this app.

-- ============================================================
-- daily_specials.image_url
-- ============================================================
alter table daily_specials add column image_url text;
