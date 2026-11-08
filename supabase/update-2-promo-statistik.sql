-- ============================================================
-- Update #2: hitung mundur promo, harga coret, dan statistik klik.
-- Jalanin SEKALI di SQL Editor (New query → paste → Run).
-- Aman di-Run ulang.
-- ============================================================

-- 1. Promo: waktu berakhir + harga coret ---------------------------------
alter table public.link_promos
  add column if not exists ends_at      timestamptz,
  add column if not exists price_normal integer check (price_normal is null or price_normal >= 0),
  add column if not exists price_promo  integer check (price_promo  is null or price_promo  >= 0);

-- 2. Statistik: kunjungan halaman & klik tombol ---------------------------
create table if not exists public.site_events (
  id         bigint generated always as identity primary key,
  type       text not null check (type in ('view', 'click')),
  link_id    text check (link_id is null or char_length(link_id) <= 10),
  source     text not null default 'direct' check (char_length(source) <= 40),
  created_at timestamptz not null default now()
);

create index if not exists site_events_created_at_idx on public.site_events (created_at);

alter table public.site_events enable row level security;

-- pengunjung cuma dikasih hak INSERT, gak bisa SELECT
grant insert on public.site_events to anon, authenticated;

-- pengunjung cuma boleh NULIS event (gak bisa baca / ubah / hapus)
drop policy if exists "pengunjung nyatet event" on public.site_events;
create policy "pengunjung nyatet event"
  on public.site_events for insert
  to anon, authenticated
  with check (true);

-- rekap statistik — cuma bisa dipanggil admin
create or replace function public.event_stats(since timestamptz)
returns table (type text, link_id text, source text, total bigint)
language sql
stable
security definer
set search_path = public
as $$
  select e.type, e.link_id, e.source, count(*)::bigint
  from public.site_events e
  where e.created_at >= since
    and public.is_admin()
  group by e.type, e.link_id, e.source;
$$;

revoke all on function public.event_stats(timestamptz) from public;
grant execute on function public.event_stats(timestamptz) to authenticated;

notify pgrst, 'reload schema';
