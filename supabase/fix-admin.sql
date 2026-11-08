-- Fix: policy gak bisa baca tabel admins (kekunci RLS) → admin selalu ditolak.
-- Solusi: fungsi is_admin() yang jalan dengan hak pemilik tabel (security definer).
-- Jalanin SEKALI di SQL Editor.

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

drop policy if exists "promo diubah admin" on public.link_promos;
create policy "promo diubah admin"
  on public.link_promos for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

notify pgrst, 'reload schema';
