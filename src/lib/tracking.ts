import { restInsert } from "./rest";

/**
 * Nyatet kunjungan & klik ke tabel `site_events` di Supabase.
 * Semua fungsi di sini "fire and forget" — kalau gagal, diam aja,
 * jangan sampai ganggu pengunjung.
 */

const SOURCE_KEY = "vintec_source";

// domain referrer → nama sumber yang rapi
const REFERRER_MAP: [RegExp, string][] = [
  [/tiktok\./, "tiktok"],
  [/instagram\./, "instagram"],
  [/(facebook\.|fb\.)/, "facebook"],
  [/(youtube\.|youtu\.be)/, "youtube"],
  [/whatsapp\./, "whatsapp"],
  [/google\./, "google"],
  [/(t\.co|twitter\.|x\.com)/, "twitter"],
  [/lynk\.id/, "lynkid"],
];

const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 40);

/**
 * Sumber pengunjung, urutan prioritas:
 * 1. ?utm_source=... di URL (paling akurat — pakai ini di link bio)
 * 2. sumber yang udah disimpan di sesi ini
 * 3. referrer (sering kosong kalau dari in-app browser TikTok/IG)
 * 4. "direct"
 */
export function getSource(): string {
  try {
    const utm = new URLSearchParams(window.location.search).get("utm_source");
    if (utm && clean(utm)) {
      sessionStorage.setItem(SOURCE_KEY, clean(utm));
      return clean(utm);
    }
    const saved = sessionStorage.getItem(SOURCE_KEY);
    if (saved) return saved;
  } catch {
    // sessionStorage bisa diblok — lanjut aja
  }

  try {
    if (document.referrer) {
      const host = new URL(document.referrer).hostname.replace(/^www\./, "");
      if (host && host !== window.location.hostname) {
        const hit = REFERRER_MAP.find(([re]) => re.test(host));
        return hit ? hit[1] : clean(host);
      }
    }
  } catch {
    // referrer aneh — abaikan
  }
  return "direct";
}

function send(type: "view" | "click", linkId: string | null) {
  // localhost gak dihitung biar statistik gak kecampur waktu ngetes
  if (["localhost", "127.0.0.1"].includes(window.location.hostname)) return;

  restInsert("site_events", { type, link_id: linkId, source: getSource() });
}

// StrictMode di dev jalanin effect 2x — flag ini bikin 1 load = 1 view
let viewSent = false;

export function trackView() {
  if (viewSent) return;
  viewSent = true;
  send("view", null);
}

export function trackClick(linkId: string) {
  send("click", linkId);
}
