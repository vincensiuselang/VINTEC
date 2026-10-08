/**
 * Tracker kunjungan & klik buat halaman /admin.
 *
 * Sengaja GAK pakai @supabase/supabase-js di sini: cukup satu fetch ke REST API
 * Supabase, jadi halaman utama tetap enteng buat pengunjung dari TikTok.
 *
 * Yang dicatat: jenis event, id acak pengunjung, sumber traffic, jenis device.
 * Gak ada IP, nama, atau data pribadi.
 *
 * Kalau env Supabase belum diisi, semua fungsi di sini diem aja (no-op),
 * jadi website tetap jalan normal.
 */

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** browser yang punya flag ini gak dihitung (diset otomatis pas lu login di /admin) */
export const IGNORE_FLAG = "vintec_ignore_me";

type EventType = "view" | "click";

interface EventPayload {
  type: EventType;
  visitor_id: string;
  session_id: string;
  link_id?: string;
  label?: string;
  source: string;
  referrer: string | null;
  device: "mobile" | "tablet" | "desktop";
  path: string;
}

// ---- storage yang aman (in-app browser kadang ngeblok localStorage) ----
function safeGet(store: () => Storage, key: string): string | null {
  try {
    return store().getItem(key);
  } catch {
    return null;
  }
}
function safeSet(store: () => Storage, key: string, value: string) {
  try {
    store().setItem(key, value);
  } catch {
    /* biarin */
  }
}

function randomId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

function persistentId(store: () => Storage, key: string): string {
  const existing = safeGet(store, key);
  if (existing) return existing;
  const id = randomId();
  safeSet(store, key, id);
  return id;
}

const visitorId = () => persistentId(() => localStorage, "vintec_vid");
const sessionId = () => persistentId(() => sessionStorage, "vintec_sid");

function isIgnored(): boolean {
  return safeGet(() => localStorage, IGNORE_FLAG) === "1";
}

function device(): EventPayload["device"] {
  const ua = navigator.userAgent;
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "mobile";
  return "desktop";
}

/**
 * Nebak sumber traffic. Urutannya:
 * 1. ?utm_source=... di URL (paling akurat, lu yang ngatur)
 * 2. in-app browser (TikTok/IG/FB sering gak ngirim referrer, tapi ketahuan dari user-agent)
 * 3. domain referrer
 * 4. kalau kosong semua: "langsung"
 */
function detectSource(): string {
  const utm = new URLSearchParams(location.search).get("utm_source");
  if (utm) return utm.toLowerCase().slice(0, 40);

  const ua = navigator.userAgent;
  if (/musical_ly|Bytedance|TikTok/i.test(ua)) return "tiktok";
  if (/Instagram/i.test(ua)) return "instagram";
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "facebook";
  if (/WhatsApp/i.test(ua)) return "whatsapp";

  const ref = document.referrer;
  if (ref) {
    try {
      const host = new globalThis.URL(ref).hostname.replace(/^www\.|^m\.|^l\./, "");
      if (host === location.hostname) return "langsung";
      if (host.includes("tiktok")) return "tiktok";
      if (host.includes("instagram")) return "instagram";
      if (host.includes("facebook")) return "facebook";
      if (host.includes("youtube") || host === "youtu.be") return "youtube";
      if (host.includes("google")) return "google";
      if (host.includes("whatsapp")) return "whatsapp";
      return host.slice(0, 40);
    } catch {
      /* referrer aneh, lanjut */
    }
  }
  return "langsung";
}

// sumber dihitung sekali per sesi, biar klik ikut sumber yang sama kayak kunjungannya
function sessionSource(): string {
  const saved = safeGet(() => sessionStorage, "vintec_src");
  if (saved) return saved;
  const src = detectSource();
  safeSet(() => sessionStorage, "vintec_src", src);
  return src;
}

function send(type: EventType, extra: { link_id?: string; label?: string } = {}) {
  if (!URL || !KEY || isIgnored()) return;

  const payload: EventPayload = {
    type,
    visitor_id: visitorId(),
    session_id: sessionId(),
    source: sessionSource(),
    referrer: document.referrer ? document.referrer.slice(0, 300) : null,
    device: device(),
    path: location.pathname.slice(0, 200),
    ...extra,
  };

  try {
    // keepalive: request tetap kekirim walau halaman langsung pindah ke link tujuan
    fetch(`${URL}/rest/v1/events`, {
      method: "POST",
      keepalive: true,
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    }).catch(() => {
      /* analytics gagal gak boleh ganggu pengunjung */
    });
  } catch {
    /* sama */
  }
}

// StrictMode di dev jalanin effect 2x; ini nahan biar 1 load = 1 view
let viewSent = false;

/**
 * Cadangan doang. Kunjungan normalnya udah dicatat sama script kecil di <head>
 * index.html (jalan sebelum apa pun didownload). Fungsi ini cuma ngirim kalau
 * script itu gagal jalan, jadi gak ada kunjungan yang kehitung dobel.
 */
export function trackView() {
  if (viewSent) return;
  viewSent = true;
  if ((window as unknown as { __vintecView?: boolean }).__vintecView) return;
  send("view");
}

export function trackClick(linkId: string, label: string) {
  send("click", { link_id: linkId.slice(0, 64), label: label.slice(0, 120) });
}
