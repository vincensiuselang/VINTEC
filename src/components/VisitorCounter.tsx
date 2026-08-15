import { useEffect, useState } from "react";

const API = "https://abacus.jasoncameron.dev";

/**
 * Counter pengunjung global.
 *
 * Tiap kali halaman dibuka / di-refresh, angkanya naik 1 — dan angkanya SAMA
 * buat semua orang, karena disimpan di abacus.jasoncameron.dev (gratis, tanpa
 * daftar, tanpa API key). Namespace & key-nya diatur di constants.tsx.
 *
 * Kalau API-nya lagi down, komponen ini nampilin angka `fallback` dan diam aja
 * — gak nampilin error ke pengunjung.
 */

// StrictMode di mode dev sengaja jalanin effect 2x. Flag ini nahan biar
// satu kali load = satu kali hit, bukan dua.
let alreadyCounted = false;

interface Props {
  namespace: string;
  counterKey: string;
  fallback: number;
}

export default function VisitorCounter({ namespace, counterKey, fallback }: Props) {
  const [count, setCount] = useState(fallback);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (alreadyCounted) return;
    alreadyCounted = true;

    const controller = new AbortController();
    // batalin cuma kalau kelamaan, BUKAN pas komponen unmount.
    // Kalau di-abort waktu unmount, StrictMode (dev) bakal motong request ini
    // tepat setelah server nambahin hitungannya — server naik, layar gak.
    const timeout = setTimeout(() => controller.abort(), 8000);

    fetch(`${API}/hit/${namespace}/${counterKey}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (typeof data?.value === "number") {
          setCount(data.value);
          setLive(true);
        }
      })
      .catch(() => {
        // biarin, tetap tampilkan angka fallback
      })
      .finally(() => clearTimeout(timeout));

    return () => clearTimeout(timeout);
  }, [namespace, counterKey]);

  return (
    <div className="flex items-center gap-2 whitespace-nowrap font-mono text-[11px] text-slate-400 sm:text-sm">
      <span
        className={[
          "h-2 w-2 rounded-full transition-colors",
          live
            ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"
            : "bg-slate-600",
        ].join(" ")}
      />
      {count.toLocaleString("en-US")} visitors
    </div>
  );
}
