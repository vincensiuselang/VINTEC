/**
 * Akses Supabase versi ringan buat halaman utama — cuma `fetch` biasa,
 * jadi library supabase-js (±200 kB) gak ikut kebawa ke pengunjung.
 * Halaman /admin tetap pakai supabase-js (lihat supabase.ts).
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const restEnabled = !!(url && key);

const headers = () => ({
  apikey: key!,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
});

/** GET /rest/v1/<path> — balikin null kalau gagal */
export async function restGet<T>(path: string): Promise<T | null> {
  if (!restEnabled) return null;
  try {
    const res = await fetch(`${url}/rest/v1/${path}`, { headers: headers() });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

/** INSERT satu baris. keepalive biar tetap kekirim walau tab langsung pindah. */
export function restInsert(table: string, row: Record<string, unknown>) {
  if (!restEnabled) return;
  try {
    fetch(`${url}/rest/v1/${table}`, {
      method: "POST",
      headers: { ...headers(), Prefer: "return=minimal" },
      body: JSON.stringify(row),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // abaikan
  }
}
