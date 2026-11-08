/** Tipe & helper promo — dipakai halaman utama dan /admin (tanpa supabase-js biar ringan). */

export interface LinkPromo {
  link_id: string;
  badge: string;
  active: boolean;
  ends_at: string | null;
  price_normal: number | null;
  price_promo: number | null;
  updated_at?: string;
}

/** id tombol Lynk.id di constants.tsx */
export const LYNK_LINK_ID = "1";

/** promo dianggap jalan kalau aktif, ada teksnya, dan belum lewat waktu berakhir */
export const isPromoRunning = (
  p: Pick<LinkPromo, "active" | "badge" | "ends_at">,
  now = Date.now()
) => p.active && p.badge.trim() !== "" && (!p.ends_at || new Date(p.ends_at).getTime() > now);

export const formatRupiah = (n: number) =>
  "Rp" + n.toLocaleString("id-ID", { maximumFractionDigits: 0 });
