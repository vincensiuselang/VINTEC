import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { IGNORE_FLAG } from "../lib/track";
import { SITE_DATA } from "../../constants";

// ---------------------------------------------------------------------------
// Tipe data dari fungsi admin_stats() di Supabase
// ---------------------------------------------------------------------------
interface Stats {
  views: number;
  visitors: number;
  clicks: number;
  clickers: number;
  links: { link_id: string; label: string | null; clicks: number; uniques: number }[];
  sources: { source: string; visitors: number; views: number }[];
  devices: { device: string; visitors: number }[];
  daily: { day: string; views: number; visitors: number; clicks: number }[];
  /** opsional: cuma ada kalau schema.sql versi terbaru udah dijalanin */
  active_now?: number;
  recent?: RecentEvent[];
}

interface RecentEvent {
  created_at: string;
  type: "view" | "click";
  link_id: string | null;
  label: string | null;
  source: string | null;
  device: string | null;
  visitor: string;
}

/** dashboard ambil data ulang otomatis tiap segini (selama tab-nya lagi dibuka) */
const LIVE_INTERVAL_MS = 10_000;

type RangeKey = "today" | "7d" | "30d" | "90d";
const RANGES: { key: RangeKey; label: string; days: number }[] = [
  { key: "today", label: "Hari ini", days: 1 },
  { key: "7d", label: "7 hari", days: 7 },
  { key: "30d", label: "30 hari", days: 30 },
  { key: "90d", label: "90 hari", days: 90 },
];

// ---------------------------------------------------------------------------
// Helper tanggal (WIB, UTC+7, gak ada daylight saving)
// ---------------------------------------------------------------------------
const WIB_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** jam 00:00 WIB hari ini, dalam bentuk Date UTC */
function startOfTodayWIB(): Date {
  const wib = new Date(Date.now() + WIB_MS);
  return new Date(Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), wib.getUTCDate()) - WIB_MS);
}

/** daftar "YYYY-MM-DD" (WIB) dari `days` hari terakhir, termasuk hari ini */
function dayKeys(days: number): string[] {
  const start = startOfTodayWIB().getTime() + WIB_MS;
  return Array.from({ length: days }, (_, i) =>
    new Date(start - (days - 1 - i) * DAY_MS).toISOString().slice(0, 10)
  );
}

function shortDate(key: string): string {
  const [, m, d] = key.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return `${d} ${months[m - 1]}`;
}

const fmt = (n: number) => n.toLocaleString("id-ID");
const pct = (a: number, b: number) => (b > 0 ? `${((a / b) * 100).toFixed(1).replace(".", ",")}%` : "–");

function safeLocal(fn: () => void) {
  try {
    fn();
  } catch {
    /* storage diblok, gpp */
  }
}

// nama yang enak dibaca buat link_id
const LINK_NAMES: Record<string, string> = Object.fromEntries(
  SITE_DATA.links.map((l) => [l.id, l.title])
);
const SOCIAL_NAMES: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
  youtube: "YouTube",
  twitter: "Twitter",
  linkedin: "LinkedIn",
  github: "GitHub",
  email: "Email",
};

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------
export default function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#060d16] text-slate-200">
      <div className="pointer-events-none fixed left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]" />
      <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {!supabase ? (
          <SetupNotice />
        ) : checking ? (
          <p className="font-mono text-sm text-slate-500">memuat…</p>
        ) : session ? (
          <Dashboard session={session} />
        ) : (
          <Login />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Kalau .env belum diisi
// ---------------------------------------------------------------------------
function SetupNotice() {
  return (
    <Card className="mx-auto max-w-lg">
      <h1 className="text-xl font-bold text-white">Supabase belum disambungin</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-400">
        Isi <code className="text-blue-300">VITE_SUPABASE_URL</code> dan{" "}
        <code className="text-blue-300">VITE_SUPABASE_ANON_KEY</code> di file{" "}
        <code className="text-blue-300">.env</code>, terus jalanin ulang{" "}
        <code className="text-blue-300">npm run dev</code> atau build ulang.
      </p>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      setError(
        error.message.toLowerCase().includes("invalid")
          ? "Email atau password salah."
          : `Gagal login: ${error.message}`
      );
    } else {
      // browser admin otomatis gak ikut dihitung
      safeLocal(() => localStorage.setItem(IGNORE_FLAG, "1"));
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-sm sm:mt-20">
      <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-blue-400">
        <span className="text-slate-600">// </span>vintec admin
      </p>
      <Card className="mt-4">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Email">
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
            />
          </Field>
          {error && (
            <p role="alert" className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-400 disabled:opacity-60"
          >
            {busy ? "Masuk…" : "Masuk"}
          </button>
        </form>
      </Card>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-blue-400/70 focus:bg-white/[0.06]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-400">{label}</span>
      {children}
    </label>
  );
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
function Dashboard({ session }: { session: Session }) {
  const [range, setRange] = useState<RangeKey>("7d");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [ignored, setIgnored] = useState(() => {
    try {
      return localStorage.getItem(IGNORE_FLAG) === "1";
    } catch {
      return false;
    }
  });

  const days = RANGES.find((r) => r.key === range)!.days;

  // silent = refresh otomatis di background, tanpa efek loading yang bikin kedip
  const load = useCallback(async (silent = false) => {
    if (!supabase) return;
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    const from = new Date(startOfTodayWIB().getTime() - (days - 1) * DAY_MS);
    const to = new Date(Date.now() + 60_000);
    const { data, error } = await supabase.rpc("admin_stats", {
      p_from: from.toISOString(),
      p_to: to.toISOString(),
    });
    setLoading(false);
    if (error) {
      if (silent) return; // gagal sekali di background gpp, coba lagi di putaran berikutnya
      setStats(null);
      setError(
        error.code === "42501" || /akses ditolak|permission/i.test(error.message)
          ? `Akun ${session.user.email} bukan admin. Tambahin email-nya ke tabel admin_users di Supabase.`
          : `Gagal ambil data: ${error.message}`
      );
      return;
    }
    setError(null);
    setStats(data as Stats);
    setUpdatedAt(new Date());
  }, [days, session.user.email]);

  useEffect(() => {
    load();
  }, [load]);

  // LIVE: refresh otomatis selama tab dibuka, dan langsung refresh pas tab dibuka lagi
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") load(true);
    };
    const id = window.setInterval(tick, LIVE_INTERVAL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [load]);

  const toggleIgnore = () => {
    const next = !ignored;
    safeLocal(() =>
      next ? localStorage.setItem(IGNORE_FLAG, "1") : localStorage.removeItem(IGNORE_FLAG)
    );
    setIgnored(next);
  };

  return (
    <>
      {/* header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-blue-400">
            <span className="text-slate-600">// </span>vintec admin
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Statistik website</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => load()} disabled={loading} className={ghostBtn}>
            {loading ? "Memuat…" : "Refresh"}
          </button>
          <button onClick={() => supabase?.auth.signOut()} className={ghostBtn}>
            Keluar
          </button>
        </div>
      </header>

      {/* filter waktu */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Rentang waktu" className="inline-flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              role="tab"
              aria-selected={range === r.key}
              onClick={() => setRange(r.key)}
              className={[
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                range === r.key ? "bg-blue-500 text-white" : "text-slate-400 hover:text-white",
              ].join(" ")}
            >
              {r.label}
            </button>
          ))}
        </div>
        {updatedAt && (
          <span className="flex items-center gap-2 font-mono text-xs text-slate-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            live · update{" "}
            {updatedAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} WIB
          </span>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {stats && (
        <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
          {typeof stats.active_now === "number" && <ActiveNow count={stats.active_now} />}
          <KpiRow stats={stats} />
          {days > 1 && <DailyChart stats={stats} days={days} />}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <LinkClicks stats={stats} />
            <Sources stats={stats} />
          </div>
          {stats.recent && <RecentFeed events={stats.recent} />}
        </div>
      )}

      {/* pengaturan kecil */}
      <label className="mt-8 flex cursor-pointer items-start gap-3 text-sm text-slate-400">
        <input type="checkbox" checked={ignored} onChange={toggleIgnore} className="mt-0.5 h-4 w-4 accent-blue-500" />
        <span>
          Jangan hitung kunjungan &amp; klik dari browser ini
          <span className="block text-xs text-slate-500">
            Biar angka gak kecampur sama lu sendiri pas ngecek website. Berlaku per browser, jadi nyalain juga di HP lu
            dengan login ke /admin sekali.
          </span>
        </span>
      </label>

      <p className="mt-6 font-mono text-[11px] text-slate-600">login sebagai {session.user.email}</p>
    </>
  );
}

const ghostBtn =
  "rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 transition-colors hover:border-white/25 hover:text-white disabled:opacity-50";

// ---------------------------------------------------------------------------
// Komponen kecil
// ---------------------------------------------------------------------------
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
  return (
    <div className={`rounded-2xl border border-white/10 bg-[#0b1622]/85 p-5 backdrop-blur-xl sm:p-6 ${className}`}>
      {children}
    </div>
  );
};

function SectionTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

// ---- KPI ------------------------------------------------------------------
function KpiRow({ stats }: { stats: Stats }) {
  const items = [
    { label: "Pengunjung unik", value: fmt(stats.visitors), note: "orang (per browser)" },
    { label: "Kunjungan", value: fmt(stats.views), note: "total halaman dibuka" },
    { label: "Klik link", value: fmt(stats.clicks), note: "semua link + ikon sosial" },
    {
      label: "Conversion",
      value: pct(stats.clickers, stats.visitors),
      note: `${fmt(stats.clickers)} pengunjung klik minimal 1 link`,
    },
  ];
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {items.map((k) => (
        <Card key={k.label} className="!p-4 sm:!p-5">
          <p className="text-xs font-medium text-slate-400">{k.label}</p>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-white sm:text-3xl">{k.value}</p>
          <p className="mt-1 text-[11px] leading-snug text-slate-500">{k.note}</p>
        </Card>
      ))}
    </div>
  );
}

// ---- grafik harian ---------------------------------------------------------
function DailyChart({ stats, days }: { stats: Stats; days: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  const rows = useMemo(() => {
    const byDay = new Map(stats.daily.map((d) => [d.day, d]));
    return dayKeys(days).map((key) => {
      const d = byDay.get(key);
      return { key, visitors: d?.visitors ?? 0, views: d?.views ?? 0, clicks: d?.clicks ?? 0 };
    });
  }, [stats, days]);

  const max = Math.max(1, ...rows.map((r) => r.visitors));
  // garis bantu di angka bulat yang enak dibaca
  const step = niceStep(max);
  const top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: Math.floor(top / step) + 1 }, (_, i) => i * step);

  const H = 180;
  const labelEvery = days <= 7 ? 1 : days <= 30 ? 7 : 21;
  const active = hover !== null ? rows[hover] : null;

  return (
    <Card className="mt-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <SectionTitle title="Pengunjung unik per hari" hint="Jam WIB. Arahin kursor / tap batang buat detail." />
        <button onClick={() => setShowTable((v) => !v)} className="text-xs text-blue-300 hover:text-blue-200">
          {showTable ? "Lihat grafik" : "Lihat tabel"}
        </button>
      </div>

      {showTable ? (
        <div className="max-h-72 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-[#0b1622] text-xs text-slate-500">
              <tr>
                <th className="py-2 font-medium">Tanggal</th>
                <th className="py-2 text-right font-medium">Pengunjung</th>
                <th className="py-2 text-right font-medium">Kunjungan</th>
                <th className="py-2 text-right font-medium">Klik</th>
              </tr>
            </thead>
            <tbody className="font-mono tabular-nums">
              {[...rows].reverse().map((r) => (
                <tr key={r.key} className="border-t border-white/[0.06]">
                  <td className="py-1.5 font-sans text-slate-300">{shortDate(r.key)}</td>
                  <td className="py-1.5 text-right text-white">{fmt(r.visitors)}</td>
                  <td className="py-1.5 text-right text-slate-400">{fmt(r.views)}</td>
                  <td className="py-1.5 text-right text-slate-400">{fmt(r.clicks)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative">
          {/* tooltip */}
          <div className="h-10">
            {active ? (
              <div className="font-mono text-xs text-slate-400">
                <span className="text-slate-200">{shortDate(active.key)}</span>
                {"  ·  "}
                <span className="text-white">{fmt(active.visitors)}</span> pengunjung
                {"  ·  "}
                {fmt(active.views)} kunjungan
                {"  ·  "}
                {fmt(active.clicks)} klik
              </div>
            ) : (
              <div className="font-mono text-xs text-slate-600">
                total {fmt(rows.reduce((a, r) => a + r.visitors, 0))} pengunjung-hari
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {/* sumbu y */}
            <div className="relative w-8 shrink-0" style={{ height: H }}>
              {ticks.map((t) => (
                <span
                  key={t}
                  className="absolute right-0 -translate-y-1/2 font-mono text-[10px] tabular-nums text-slate-600"
                  style={{ top: H - (t / top) * H }}
                >
                  {fmt(t)}
                </span>
              ))}
            </div>

            <div className="relative min-w-0 flex-1">
              {/* grid */}
              <div className="absolute inset-x-0 top-0" style={{ height: H }}>
                {ticks.map((t) => (
                  <div
                    key={t}
                    className={`absolute inset-x-0 h-px ${t === 0 ? "bg-white/20" : "bg-white/[0.05]"}`}
                    style={{ top: H - (t / top) * H }}
                  />
                ))}
              </div>

              {/* batang */}
              <div className="relative flex items-end" style={{ height: H }} onMouseLeave={() => setHover(null)}>
                {rows.map((r, i) => (
                  <button
                    key={r.key}
                    type="button"
                    aria-label={`${shortDate(r.key)}: ${r.visitors} pengunjung`}
                    onMouseEnter={() => setHover(i)}
                    onFocus={() => setHover(i)}
                    onClick={() => setHover(i)}
                    className="group flex h-full min-w-0 flex-1 items-end justify-center px-[1px] outline-none"
                  >
                    <span
                      className={[
                        "block w-full max-w-[28px] rounded-t-[4px] transition-colors",
                        hover === i ? "bg-blue-300" : "bg-blue-500 group-focus-visible:bg-blue-300",
                      ].join(" ")}
                      style={{ height: r.visitors > 0 ? Math.max(2, (r.visitors / top) * H) : 0 }}
                    />
                  </button>
                ))}
              </div>

              {/* label tanggal */}
              <div className="mt-2 flex">
                {rows.map((r, i) => (
                  <span
                    key={r.key}
                    className={[
                      "flex min-w-0 flex-1 whitespace-nowrap font-mono text-[10px] text-slate-600",
                      // label terakhir rata kanan biar gak kepotong di pinggir layar
                      i === rows.length - 1 ? "justify-end" : "justify-center",
                    ].join(" ")}
                  >
                    {(rows.length - 1 - i) % labelEvery === 0 ? shortDate(r.key) : ""}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function niceStep(max: number): number {
  const raw = max / 4;
  const pow = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 1))));
  const n = raw / pow;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return Math.max(1, nice * pow);
}

// ---- bar horizontal (dipakai klik link & sumber) ---------------------------
const HBar: React.FC<{
  label: string;
  value: number;
  max: number;
  right: string;
  sub?: string;
  muted?: boolean;
}> = ({ label, value, max, right, sub, muted }) => {
  const w = max > 0 ? (value / max) * 100 : 0;
  return (
    <li className="py-2.5" title={`${label}: ${right}${sub ? ` · ${sub}` : ""}`}>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className={`min-w-0 truncate ${muted ? "text-slate-400" : "text-slate-200"}`}>{label}</span>
        <span className="shrink-0 font-mono tabular-nums text-white">{right}</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full ${muted ? "bg-blue-500/50" : "bg-blue-500"}`}
          style={{ width: `${value > 0 ? Math.max(w, 1.5) : 0}%` }}
        />
      </div>
      {sub && <p className="mt-1 font-mono text-[11px] text-slate-500">{sub}</p>}
    </li>
  );
};

// ---- klik per link --------------------------------------------------------
function LinkClicks({ stats }: { stats: Stats }) {
  const byId = new Map(stats.links.map((l) => [l.link_id, l]));

  // semua link yang ada di website, termasuk yang 0 klik
  const mainRows = SITE_DATA.links.map((l) => {
    const s = byId.get(l.id);
    byId.delete(l.id);
    return { id: l.id, name: l.title, clicks: s?.clicks ?? 0, uniques: s?.uniques ?? 0 };
  });
  // link lama yang udah dihapus dari website tapi masih ada datanya
  const oldRows: typeof mainRows = [];
  // semua ikon medsos yang ada di website, termasuk yang 0 klik
  const socialRows: typeof mainRows = SITE_DATA.socials.map((so) => {
    const id = `social:${so.platform}`;
    const s = byId.get(id);
    byId.delete(id);
    return { id, name: SOCIAL_NAMES[so.platform] ?? so.platform, clicks: s?.clicks ?? 0, uniques: s?.uniques ?? 0 };
  });
  byId.forEach((s) => {
    if (s.link_id.startsWith("social:")) {
      const p = s.link_id.slice(7);
      // ikon yang udah dihapus dari website tapi masih ada datanya
      socialRows.push({ id: s.link_id, name: `${SOCIAL_NAMES[p] ?? p} (lama)`, clicks: s.clicks, uniques: s.uniques });
    } else {
      oldRows.push({
        id: s.link_id,
        name: `${s.label ?? LINK_NAMES[s.link_id] ?? s.link_id} (link lama)`,
        clicks: s.clicks,
        uniques: s.uniques,
      });
    }
  });

  const main = [...mainRows, ...oldRows].sort((a, b) => b.clicks - a.clicks);
  socialRows.sort((a, b) => b.clicks - a.clicks);
  const max = Math.max(1, ...main.map((r) => r.clicks), ...socialRows.map((r) => r.clicks));

  const sub = (r: (typeof main)[number]) =>
    `${fmt(r.uniques)} orang · ${pct(r.uniques, stats.visitors)} dari pengunjung`;

  return (
    <Card>
      <SectionTitle title="Klik per link" hint="Angka kanan = total klik. Persen = berapa banyak pengunjung yang klik link itu." />
      <ul className="divide-y divide-white/[0.05]">
        {main.map((r) => (
          <HBar key={r.id} label={r.name} value={r.clicks} max={max} right={fmt(r.clicks)} sub={sub(r)} />
        ))}
      </ul>

      <p className="mt-5 text-xs font-medium uppercase tracking-wider text-slate-500">Ikon sosial</p>
      {socialRows.length ? (
        <ul className="mt-1 divide-y divide-white/[0.05]">
          {socialRows.map((r) => (
            <HBar key={r.id} label={r.name} value={r.clicks} max={max} right={fmt(r.clicks)} sub={sub(r)} muted />
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-slate-500">Belum ada yang klik ikon sosial.</p>
      )}
    </Card>
  );
}

// ---- sumber traffic -------------------------------------------------------
const SOURCE_NAMES: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  whatsapp: "WhatsApp",
  google: "Google",
  langsung: "Langsung / gak diketahui",
};

function Sources({ stats }: { stats: Stats }) {
  const max = Math.max(1, ...stats.sources.map((s) => s.visitors));
  return (
    <Card>
      <SectionTitle
        title="Sumber pengunjung"
        hint="Dibaca dari ?utm_source, in-app browser (TikTok/IG/FB), atau referrer."
      />
      {stats.sources.length ? (
        <ul className="divide-y divide-white/[0.05]">
          {stats.sources.map((s) => (
            <HBar
              key={s.source}
              label={SOURCE_NAMES[s.source] ?? s.source}
              value={s.visitors}
              max={max}
              right={fmt(s.visitors)}
              sub={pct(s.visitors, stats.visitors) + " dari pengunjung"}
            />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">Belum ada data di rentang ini.</p>
      )}

      {stats.devices.length > 0 && (
        <>
          <p className="mt-5 text-xs font-medium uppercase tracking-wider text-slate-500">Device</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {stats.devices.map((d) => (
              <span
                key={d.device}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-xs text-slate-300"
              >
                {d.device} <span className="text-white">{fmt(d.visitors)}</span>{" "}
                <span className="text-slate-500">{pct(d.visitors, stats.visitors)}</span>
              </span>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

// ---- lagi online ----------------------------------------------------------
function ActiveNow({ count }: { count: number }) {
  return (
    <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.06] px-5 py-4">
      <span className="relative flex h-3 w-3 shrink-0">
        {count > 0 && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
        )}
        <span className={`relative inline-flex h-3 w-3 rounded-full ${count > 0 ? "bg-emerald-400" : "bg-slate-600"}`} />
      </span>
      <p className="text-sm text-slate-300">
        <span className="font-mono text-lg font-bold tabular-nums text-white">{fmt(count)}</span> orang lagi buka website
        <span className="text-slate-500"> · aktif dalam 5 menit terakhir</span>
      </p>
    </div>
  );
}

// ---- feed aktivitas terbaru -----------------------------------------------
function timeAgo(iso: string, now: number): string {
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s} dtk lalu`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} mnt lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

function eventName(e: RecentEvent): string {
  if (e.type === "view") return "buka website";
  if (e.link_id?.startsWith("social:")) {
    const p = e.link_id.slice(7);
    return `klik ikon ${SOCIAL_NAMES[p] ?? p}`;
  }
  return `klik ${(e.link_id && LINK_NAMES[e.link_id]) || e.label || e.link_id}`;
}

function RecentFeed({ events }: { events: RecentEvent[] }) {
  const [now, setNow] = useState(Date.now());
  // event yang baru muncul sejak refresh sebelumnya dikasih highlight sebentar
  const [seen, setSeen] = useState<Set<string> | null>(null);
  const keyOf = (e: RecentEvent) => `${e.created_at}|${e.visitor}|${e.type}|${e.link_id ?? ""}`;

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const fresh = useMemo(() => {
    if (!seen) return new Set<string>();
    return new Set(events.map(keyOf).filter((k) => !seen.has(k)));
  }, [events, seen]);

  useEffect(() => {
    const t = window.setTimeout(() => setSeen(new Set(events.map(keyOf))), seen ? 2500 : 0);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  return (
    <Card className="mt-6">
      <SectionTitle
        title="Aktivitas terbaru"
        hint="20 kunjungan & klik terakhir, gak ikut filter tanggal. Ke-update sendiri tiap 10 detik."
      />
      {events.length === 0 ? (
        <p className="text-sm text-slate-500">
          Belum ada aktivitas. Coba buka website lu di jendela incognito, nanti muncul di sini.
        </p>
      ) : (
        <ul className="divide-y divide-white/[0.05]">
          {events.map((e) => {
            const k = keyOf(e);
            return (
              <li
                key={k}
                className={[
                  "flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors duration-1000",
                  fresh.has(k) ? "bg-emerald-500/10" : "bg-transparent",
                ].join(" ")}
              >
                <span
                  className={[
                    "shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                    e.type === "click" ? "bg-blue-500/15 text-blue-300" : "bg-white/[0.06] text-slate-400",
                  ].join(" ")}
                >
                  {e.type === "click" ? "klik" : "view"}
                </span>
                <span className="min-w-0 flex-1 truncate text-slate-200">{eventName(e)}</span>
                <span className="hidden shrink-0 font-mono text-[11px] text-slate-500 sm:inline">
                  {SOURCE_NAMES[e.source ?? ""] ?? e.source ?? "-"} · {e.device ?? "-"} · #{e.visitor}
                </span>
                <span className="w-20 shrink-0 text-right font-mono text-[11px] tabular-nums text-slate-500">
                  {timeAgo(e.created_at, now)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
