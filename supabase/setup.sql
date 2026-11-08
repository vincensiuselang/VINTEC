-- ============================================================
-- Setup database buat halaman /admin (badge promo).
-- Cara pakai: buka Supabase → SQL Editor → paste semua isi file ini → Run.
-- ============================================================

-- 1. Tabel promo per tombol. link_id = id link di constants.tsx ("1" = Lynk.id)
create table if not exists public.link_promos (
  link_id    text primary key,
  badge      text not null default '',
  active     boolean not null default false,
  updated_at timestamptz not null default now()
);

-- isi awal buat tombol Lynk.id (masih nonaktif)
insert into public.link_promos (link_id, badge, active)
values ('1', '', false)
on conflict (link_id) do nothing;

-- 2. Daftar admin. Cuma email di tabel ini yang boleh ngubah promo.
create table if not exists public.admins (
  email text primary key
);

-- GANTI dengan email akun admin lu (yang dipakai login di /admin)
insert into public.admins (email)
values ('email-admin-lu@contoh.com')
on conflict (email) do nothing;

-- 3. Keamanan (Row Level Security)
alter table public.link_promos enable row level security;
alter table public.admins      enable row level security;
-- tabel admins sengaja gak dikasih policy apa pun → gak bisa dibaca/diubah dari website

-- semua pengunjung boleh BACA promo
drop policy if exists "promo dibaca semua orang" on public.link_promos;
create policy "promo dibaca semua orang"
  on public.link_promos for select
  using (true);

-- cek admin lewat fungsi security definer — kalau langsung query tabel admins
-- dari policy, hasilnya selalu kosong karena tabel admins dikunci RLS
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- cuma admin yang boleh UBAH promo
drop policy if exists "promo diubah admin" on public.link_promos;
create policy "promo diubah admin"
  on public.link_promos for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 4. Suruh API Supabase baca ulang daftar tabel (biar gak error "schema cache")
notify pgrst, 'reload schema';
