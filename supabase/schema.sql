-- =====================================================================
-- VINTEC analytics: skema buat halaman /admin
--
-- Cara pakai: buka Supabase > SQL Editor > New query, paste SEMUA isi file
-- ini, terus Run. Aman dijalanin ulang kalau nanti ada update.
--
-- Prinsip keamanannya:
--   - Pengunjung (role anon) cuma boleh NAMBAH baris event. Gak bisa baca,
--     ubah, atau hapus apa pun.
--   - Data cuma bisa dibaca lewat fungsi admin_stats(), dan fungsi itu nolak
--     siapa pun yang email login-nya gak ada di tabel admin_users.
--   - Gak ada IP, nama, atau data pribadi yang disimpan. visitor_id itu
--     angka acak yang dibikin di browser pengunjung.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Tabel event (kunjungan + klik)
-- ---------------------------------------------------------------------
create table if not exists public.events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  type        text not null check (type in ('view', 'click')),
  visitor_id  text not null check (char_length(visitor_id) between 8 and 64),
  session_id  text check (char_length(session_id) <= 64),
  link_id     text check (char_length(link_id) <= 64),
  label       text check (char_length(label) <= 120),
  source      text check (char_length(source) <= 40),
  referrer    text check (char_length(referrer) <= 300),
  device      text check (device in ('mobile', 'tablet', 'desktop')),
  path        text check (char_length(path) <= 200),
  constraint click_needs_link check (type <> 'click' or link_id is not null)
);

create index if not exists events_created_at_idx on public.events (created_at);
create index if not exists events_type_created_idx on public.events (type, created_at);

alter table public.events enable row level security;

-- Supabase secara default ngasih semua akses ke anon/authenticated.
-- Cabut semua, terus kasih balik cuma INSERT di kolom yang boleh diisi.
-- created_at & id sengaja gak dikasih, jadi pengunjung gak bisa malsuin waktu.
revoke all on public.events from anon, authenticated;
grant insert (type, visitor_id, session_id, link_id, label, source, referrer, device, path)
  on public.events to anon, authenticated;

drop policy if exists "siapa aja boleh nyatet event" on public.events;
create policy "siapa aja boleh nyatet event"
  on public.events for insert
  to anon, authenticated
  with check (true);
-- Sengaja GAK ada policy SELECT/UPDATE/DELETE: data mentah gak bisa dibaca lewat API.

-- ---------------------------------------------------------------------
-- 2. Daftar admin
-- ---------------------------------------------------------------------
create table if not exists public.admin_users (
  email text primary key
);
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;

-- Email yang boleh buka /admin. Mau nambah admin lain? tambah baris di sini.
insert into public.admin_users (email) values ('vincensiuselang@gmail.com')
  on conflict do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ---------------------------------------------------------------------
-- 3. Fungsi statistik buat dashboard
--    Semua hitungan dikerjain di database, jadi yang dikirim ke browser
--    cuma ringkasan kecil, bukan ribuan baris mentah.
-- ---------------------------------------------------------------------
create or replace function public.admin_stats(
  p_from timestamptz,
  p_to   timestamptz default now()
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'akses ditolak' using errcode = '42501';
  end if;

  with e as (
    select * from public.events
    where created_at >= p_from and created_at < p_to
  )
  select jsonb_build_object(
    'views',    (select count(*) from e where type = 'view'),
    'visitors', (select count(distinct visitor_id) from e where type = 'view'),
    'clicks',   (select count(*) from e where type = 'click'),
    'clickers', (select count(distinct visitor_id) from e where type = 'click'),

    -- yang lagi buka website: ada aktivitas dalam 5 menit terakhir (gak ikut filter rentang)
    'active_now', (
      select count(distinct visitor_id) from public.events
      where created_at > now() - interval '5 minutes'
    ),

    -- 20 aktivitas terakhir (gak ikut filter rentang), buat feed live di dashboard
    'recent', coalesce((
      select jsonb_agg(x order by x.created_at desc)
      from (
        select created_at, type, link_id, label, source, device,
               left(visitor_id, 4) as visitor
        from public.events
        order by created_at desc
        limit 20
      ) x
    ), '[]'::jsonb),

    'links', coalesce((
      select jsonb_agg(x order by x.clicks desc)
      from (
        select link_id,
               (array_agg(label order by created_at desc))[1] as label,
               count(*)                   as clicks,
               count(distinct visitor_id) as uniques
        from e where type = 'click'
        group by link_id
      ) x
    ), '[]'::jsonb),

    'sources', coalesce((
      select jsonb_agg(x order by x.visitors desc)
      from (
        select coalesce(source, 'langsung') as source,
               count(distinct visitor_id)   as visitors,
               count(*)                     as views
        from e where type = 'view'
        group by 1
      ) x
    ), '[]'::jsonb),

    'devices', coalesce((
      select jsonb_agg(x order by x.visitors desc)
      from (
        select coalesce(device, 'lainnya')  as device,
               count(distinct visitor_id)   as visitors
        from e where type = 'view'
        group by 1
      ) x
    ), '[]'::jsonb),

    -- per hari, pakai jam WIB
    'daily', coalesce((
      select jsonb_agg(x order by x.day)
      from (
        select (created_at at time zone 'Asia/Jakarta')::date            as day,
               count(*) filter (where type = 'view')                    as views,
               count(distinct visitor_id) filter (where type = 'view')  as visitors,
               count(*) filter (where type = 'click')                   as clicks
        from e
        group by 1
      ) x
    ), '[]'::jsonb)
  )
  into result;

  return result;
end;
$$;

revoke execute on function public.admin_stats(timestamptz, timestamptz) from public, anon;
grant execute on function public.admin_stats(timestamptz, timestamptz) to authenticated;

-- langsung suruh API baca ulang daftar fungsi
notify pgrst, 'reload schema';
