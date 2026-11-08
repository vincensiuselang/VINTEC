import React, { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { LinkPromo, LYNK_LINK_ID, formatRupiah, isPromoRunning } from "../lib/promo";
import { PromoBadge, PromoDetails } from "../components/CommandPalette";
import { SITE_DATA } from "../../constants";
import lynkIdLogo from "/public/lynkidlogo.png";

const MAX_LEN = 24;
const PRESETS = ["PROMO", "DISKON 50%", "FLASH SALE", "GRATIS ONGKIR", "PROMO HARI INI"];

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-mono text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400/60 [color-scheme:dark]";
const chipCls =
  "rounded-lg border border-white/10 px-2.5 py-1 font-mono text-[11px] text-slate-400 hover:border-white/25 hover:text-slate-200";
const btnPrimary =
  "w-full rounded-xl bg-blue-500 py-3 font-mono text-sm font-bold text-white transition-colors hover:bg-blue-400 disabled:opacity-50";
const labelCls = "font-mono text-xs text-slate-500";

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-full rounded-3xl border border-white/10 bg-[#0b1622]/85 p-6 shadow-2xl shadow-black/50 sm:p-8">
    {children}
  </div>
);

type DurUnit = "menit" | "jam" | "hari";
const UNIT_MS: Record<DurUnit, number> = { menit: 60_000, jam: 3_600_000, hari: 86_400_000 };
const DUR_PRESETS: { amount: number; unit: DurUnit; label: string }[] = [
  { amount: 1, unit: "jam", label: "1 jam" },
  { amount: 2, unit: "jam", label: "2 jam" },
  { amount: 6, unit: "jam", label: "6 jam" },
  { amount: 12, unit: "jam", label: "12 jam" },
  { amount: 1, unit: "hari", label: "1 hari" },
  { amount: 3, unit: "hari", label: "3 hari" },
  { amount: 7, unit: "hari", label: "7 hari" },
];

const formatWaktu = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatSisa = (ms: number) => {
  const m = Math.max(0, Math.round(ms / 60_000));
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  const mm = m % 60;
  return [d && `${d} hari`, h && `${h} jam`, (mm || (!d && !h)) && `${mm} menit`]
    .filter(Boolean)
    .join(" ");
};

const toNumber = (v: string) => {
  const n = parseInt(v.replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? n : null;
};

/* ================= login ================= */

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError("Email atau password salah.");
    setLoading(false);
  };

  return (
    <Card>
      <h1 className="font-mono text-xl text-slate-200">admin login</h1>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls}
        />
        <input
          type="password"
          required
          autoComplete="current-password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputCls}
        />
        {error && <p className="font-mono text-xs text-red-400">{error}</p>}
        <button type="submit" disabled={loading} className={btnPrimary}>
          {loading ? "masuk..." : "masuk"}
        </button>
      </form>
    </Card>
  );
};

/* ================= tab: promo ================= */

const PromoEditor: React.FC = () => {
  const [badge, setBadge] = useState("");
  const [active, setActive] = useState(false);
  // waktu berakhir yang udah tersimpan di database (null = tanpa batas)
  const [savedEnds, setSavedEnds] = useState<string | null>(null);
  // durasi baru yang diketik admin — kosong = pakai yang tersimpan
  const [durAmount, setDurAmount] = useState("");
  const [durUnit, setDurUnit] = useState<DurUnit>("jam");
  const [priceNormal, setPriceNormal] = useState("");
  const [pricePromo, setPricePromo] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("link_promos")
      .select("*")
      .eq("link_id", LYNK_LINK_ID)
      .maybeSingle<LinkPromo>()
      .then(({ data, error }) => {
        if (error) setMsg({ ok: false, text: "Gagal ambil data: " + error.message });
        if (data) {
          setBadge(data.badge);
          setActive(data.active);
          setSavedEnds(data.ends_at ?? null);
          setPriceNormal(data.price_normal != null ? String(data.price_normal) : "");
          setPricePromo(data.price_promo != null ? String(data.price_promo) : "");
        }
        setLoading(false);
      });
  }, []);

  const durNum = toNumber(durAmount);
  const hasDuration = durNum != null && durNum > 0;
  const endsFromDuration = () => new Date(Date.now() + durNum! * UNIT_MS[durUnit]).toISOString();
  // dibekukan per perubahan input biar preview hitung mundurnya stabil
  const previewEnds = useMemo(
    () => (hasDuration ? endsFromDuration() : savedEnds),
    [durAmount, durUnit, savedEnds]
  );

  const pickPreset = (amount: number, unit: DurUnit) => {
    setDurAmount(String(amount));
    setDurUnit(unit);
  };
  const clearDuration = () => {
    setDurAmount("");
    setSavedEnds(null);
  };

  const nNormal = toNumber(priceNormal);
  const nPromo = toNumber(pricePromo);
  const endsIso = previewEnds;
  const expired = !hasDuration && !!savedEnds && new Date(savedEnds).getTime() <= Date.now();
  const priceWarn = nNormal != null && nPromo != null && nPromo >= nNormal;
  const running = isPromoRunning({ active, badge, ends_at: endsIso });
  const isPreset = (p: (typeof DUR_PRESETS)[number]) => hasDuration && durNum === p.amount && durUnit === p.unit;

  const save = async () => {
    if (!supabase) return;
    setSaving(true);
    setMsg(null);
    // durasi dihitung dari detik tombol simpan diklik
    const endsToSave = hasDuration ? endsFromDuration() : savedEnds;
    const { data, error } = await supabase
      .from("link_promos")
      .update({
        badge: badge.trim(),
        active,
        ends_at: endsToSave,
        price_normal: nNormal,
        price_promo: nPromo,
        updated_at: new Date().toISOString(),
      })
      .eq("link_id", LYNK_LINK_ID)
      .select();
    setSaving(false);

    if (error) {
      const needsUpdate = /ends_at|price_/.test(error.message);
      setMsg({
        ok: false,
        text: needsUpdate
          ? "Database belum di-update. Jalanin supabase/update-2-promo-statistik.sql di SQL Editor dulu."
          : "Gagal simpan: " + error.message,
      });
    } else if (!data?.length)
      setMsg({ ok: false, text: "Gagal simpan: akun ini belum terdaftar di tabel admins." });
    else {
      setSavedEnds(endsToSave);
      setDurAmount("");
      setMsg({
        ok: true,
        text: running
          ? "Tersimpan! Promo langsung kelihatan di halaman utama."
          : "Tersimpan. Promo lagi gak tampil (nonaktif / teks kosong / waktunya udah lewat).",
      });
    }
  };

  if (loading) return <p className="font-mono text-sm text-slate-500">memuat...</p>;

  return (
    <div className="space-y-7">
      {/* toggle */}
      <div className="flex items-center justify-between gap-4">
        <span className="font-mono text-sm text-slate-300">tampilkan promo</span>
        <button
          type="button"
          role="switch"
          aria-checked={active}
          onClick={() => setActive((a) => !a)}
          className={[
            "relative h-7 w-12 shrink-0 rounded-full transition-colors",
            active ? "bg-emerald-500" : "bg-white/10",
          ].join(" ")}
        >
          <span
            className={[
              "absolute top-1 h-5 w-5 rounded-full bg-white transition-all",
              active ? "left-6" : "left-1",
            ].join(" ")}
          />
        </button>
      </div>

      {/* teks badge */}
      <div>
        <div className={"flex justify-between " + labelCls}>
          <span>teks badge</span>
          <span>
            {badge.length}/{MAX_LEN}
          </span>
        </div>
        <input
          value={badge}
          maxLength={MAX_LEN}
          placeholder="contoh: DISKON 50%"
          onChange={(e) => setBadge(e.target.value.toUpperCase())}
          className={inputCls + " mt-2"}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p} type="button" onClick={() => setBadge(p)} className={chipCls}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* harga */}
      <div>
        <p className={labelCls}>harga (opsional — kosongin kalau gak mau ditampilin)</p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <div>
            <input
              inputMode="numeric"
              placeholder="harga normal"
              value={priceNormal}
              onChange={(e) => setPriceNormal(e.target.value.replace(/\D/g, ""))}
              className={inputCls}
            />
            <p className="mt-1 font-mono text-[11px] text-slate-600">
              dicoret{nNormal != null ? ` · ${formatRupiah(nNormal)}` : ""}
            </p>
          </div>
          <div>
            <input
              inputMode="numeric"
              placeholder="harga promo"
              value={pricePromo}
              onChange={(e) => setPricePromo(e.target.value.replace(/\D/g, ""))}
              className={inputCls}
            />
            <p className="mt-1 font-mono text-[11px] text-slate-600">
              harga jual{nPromo != null ? ` · ${formatRupiah(nPromo)}` : ""}
            </p>
          </div>
        </div>
        {priceWarn && (
          <p className="mt-2 font-mono text-xs text-amber-400">
            harga promo gak lebih murah dari harga normal — harga coret gak bakal ditampilin
          </p>
        )}
      </div>

      {/* durasi promo */}
      <div>
        <p className={labelCls}>promo berlangsung selama</p>
        <div className="mt-2 flex gap-2">
          <input
            inputMode="numeric"
            placeholder="2"
            value={durAmount}
            onChange={(e) => setDurAmount(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className={inputCls + " w-24 shrink-0 text-center"}
          />
          <div className="flex flex-1 gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
            {(["menit", "jam", "hari"] as DurUnit[]).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setDurUnit(u)}
                className={[
                  "flex-1 rounded-lg font-mono text-sm transition-colors",
                  durUnit === u ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300",
                ].join(" ")}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {DUR_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => pickPreset(p.amount, p.unit)}
              className={chipCls + (isPreset(p) ? " border-blue-400/60 bg-blue-500/10 text-blue-300" : "")}
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={clearDuration}
            className={
              chipCls +
              (!hasDuration && !savedEnds ? " border-blue-400/60 bg-blue-500/10 text-blue-300" : "")
            }
          >
            tanpa batas
          </button>
        </div>

        <p className="mt-3 font-mono text-xs text-slate-500">
          {hasDuration ? (
            <>
              berakhir <span className="text-slate-300">{formatWaktu(endsFromDuration())}</span> —
              dihitung dari waktu klik simpan
            </>
          ) : savedEnds ? (
            expired ? (
              <span className="text-amber-400">
                promo tersimpan udah berakhir ({formatWaktu(savedEnds)}) — isi durasi baru
              </span>
            ) : (
              <>
                promo yang jalan berakhir{" "}
                <span className="text-slate-300">{formatWaktu(savedEnds)}</span> · sisa{" "}
                {formatSisa(new Date(savedEnds).getTime() - Date.now())}
              </>
            )
          ) : (
            "tanpa batas waktu — gak ada hitung mundur"
          )}
        </p>
      </div>

      {/* preview */}
      <div>
        <p className={labelCls}>preview</p>
        <div className="mt-2 flex items-center gap-4 rounded-2xl border border-white/10 bg-emerald-500/[0.07] p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white p-2">
            <img src={lynkIdLogo} alt="" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-white">E-Course di Lynk.id</span>
              {running && <PromoBadge text={badge.trim()} />}
            </div>
            {running && (
              <PromoDetails
                promo={{ badge, endsAt: endsIso, priceNormal: nNormal, pricePromo: nPromo }}
              />
            )}
          </div>
        </div>
        {!running && (
          <p className="mt-2 font-mono text-xs text-slate-500">
            promo gak tampil{!active ? " — masih nonaktif" : !badge.trim() ? " — teks badge kosong" : ""}
          </p>
        )}
      </div>

      <button onClick={save} disabled={saving} className={btnPrimary}>
        {saving ? "menyimpan..." : "simpan"}
      </button>

      {msg && (
        <p className={["font-mono text-xs", msg.ok ? "text-emerald-400" : "text-red-400"].join(" ")}>
          {msg.text}
        </p>
      )}
    </div>
  );
};

/* ================= tab: statistik ================= */

interface StatRow {
  type: "view" | "click";
  link_id: string | null;
  source: string;
  total: number;
}

const RANGES = [
  { key: "today", label: "hari ini" },
  { key: "7", label: "7 hari" },
  { key: "30", label: "30 hari" },
  { key: "all", label: "semua" },
] as const;
type RangeKey = (typeof RANGES)[number]["key"];

const sinceFor = (r: RangeKey) => {
  if (r === "all") return new Date(0).toISOString();
  const d = new Date();
  if (r === "today") d.setHours(0, 0, 0, 0);
  else d.setDate(d.getDate() - Number(r));
  return d.toISOString();
};

const pct = (a: number, b: number) => (b > 0 ? `${((a / b) * 100).toFixed(1)}%` : "–");

const Bar: React.FC<{ value: number; max: number }> = ({ value, max }) => (
  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
    <div
      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400"
      style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
    />
  </div>
);

const Stats: React.FC = () => {
  const [range, setRange] = useState<RangeKey>("7");
  const [rows, setRows] = useState<StatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) return;
    setLoading(true);
    setError("");
    supabase.rpc("event_stats", { since: sinceFor(range) }).then(({ data, error }) => {
      if (error) {
        setError(
          /event_stats|function/i.test(error.message)
            ? "Statistik belum aktif. Jalanin supabase/update-2-promo-statistik.sql di SQL Editor dulu."
            : "Gagal ambil statistik: " + error.message
        );
        setRows([]);
      } else {
        setRows(((data ?? []) as StatRow[]).map((r) => ({ ...r, total: Number(r.total) })));
      }
      setLoading(false);
    });
  }, [range]);

  const s = useMemo(() => {
    const views = rows.filter((r) => r.type === "view").reduce((a, r) => a + r.total, 0);
    const clicks = rows.filter((r) => r.type === "click").reduce((a, r) => a + r.total, 0);

    const perLink = SITE_DATA.links.map((l) => ({
      title: l.title,
      clicks: rows
        .filter((r) => r.type === "click" && r.link_id === l.id)
        .reduce((a, r) => a + r.total, 0),
    }));

    const srcMap = new Map<string, { views: number; clicks: number }>();
    rows.forEach((r) => {
      const cur = srcMap.get(r.source) ?? { views: 0, clicks: 0 };
      if (r.type === "view") cur.views += r.total;
      else cur.clicks += r.total;
      srcMap.set(r.source, cur);
    });
    const perSource = [...srcMap.entries()]
      .map(([source, v]) => ({ source, ...v }))
      .sort((a, b) => b.views + b.clicks - (a.views + a.clicks));

    return { views, clicks, perLink, perSource };
  }, [rows]);

  const maxLink = Math.max(0, ...s.perLink.map((l) => l.clicks));
  const maxSrc = Math.max(0, ...s.perSource.map((x) => x.views));

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={
              chipCls + (range === r.key ? " border-blue-400/60 bg-blue-500/10 text-blue-300" : "")
            }
          >
            {r.label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="font-mono text-xs text-red-400">{error}</p>
      ) : loading ? (
        <p className="font-mono text-sm text-slate-500">memuat...</p>
      ) : (
        <>
          {/* ringkasan */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "kunjungan", value: s.views.toLocaleString("id-ID") },
              { label: "klik tombol", value: s.clicks.toLocaleString("id-ID") },
              { label: "rasio klik", value: pct(s.clicks, s.views) },
            ].map((x) => (
              <div key={x.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="font-mono text-[11px] text-slate-500">{x.label}</p>
                <p className="mt-1 text-xl font-bold tabular-nums text-white sm:text-2xl">{x.value}</p>
              </div>
            ))}
          </div>

          {/* per tombol */}
          <div>
            <p className={labelCls}>klik per tombol</p>
            <div className="mt-3 space-y-4">
              {s.perLink.map((l) => (
                <div key={l.title}>
                  <div className="flex justify-between gap-3 font-mono text-sm">
                    <span className="truncate text-slate-300">{l.title}</span>
                    <span className="shrink-0 tabular-nums text-slate-400">
                      {l.clicks.toLocaleString("id-ID")}
                      <span className="ml-2 text-slate-600">{pct(l.clicks, s.clicks)}</span>
                    </span>
                  </div>
                  <Bar value={l.clicks} max={maxLink} />
                </div>
              ))}
            </div>
          </div>

          {/* per sumber */}
          <div>
            <p className={labelCls}>sumber pengunjung</p>
            {s.perSource.length === 0 ? (
              <p className="mt-3 font-mono text-sm text-slate-600">belum ada data</p>
            ) : (
              <div className="mt-3 space-y-4">
                {s.perSource.map((x) => (
                  <div key={x.source}>
                    <div className="flex justify-between gap-3 font-mono text-sm">
                      <span className="truncate text-slate-300">{x.source}</span>
                      <span className="shrink-0 tabular-nums text-slate-400">
                        {x.views.toLocaleString("id-ID")} kunjungan · {x.clicks.toLocaleString("id-ID")} klik
                        <span className="ml-2 text-slate-600">{pct(x.clicks, x.views)}</span>
                      </span>
                    </div>
                    <Bar value={x.views} max={maxSrc} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="font-mono text-[11px] leading-relaxed text-slate-600">
            rasio klik = klik ÷ kunjungan. Pengunjung dari localhost gak dihitung. Sumber "direct" =
            gak ketahuan asalnya — pakai link di tab "link bio" biar kebaca.
          </p>
        </>
      )}
    </div>
  );
};

/* ================= tab: link bio (UTM) ================= */

const UTM_SOURCES = ["tiktok", "instagram", "facebook", "youtube", "whatsapp"];

const UtmLinks: React.FC = () => {
  const base = window.location.origin;
  const [copied, setCopied] = useState("");
  const [custom, setCustom] = useState("");

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      window.prompt("Copy link ini:", url);
    }
  };

  const customClean = custom.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  const sources = [...UTM_SOURCES, ...(customClean ? [customClean] : [])];

  return (
    <div className="space-y-5">
      <p className="font-mono text-xs leading-relaxed text-slate-500">
        Pasang link ini di bio tiap platform. Pengunjung yang masuk lewat situ bakal kecatat sumbernya
        di tab statistik.
      </p>
      <div className="space-y-2">
        {sources.map((src) => {
          const url = `${base}/?utm_source=${src}`;
          return (
            <div
              key={src}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <span className="w-20 shrink-0 font-mono text-xs text-slate-400">{src}</span>
              <span className="min-w-0 flex-1 truncate font-mono text-xs text-slate-300">{url}</span>
              <button
                onClick={() => copy(url)}
                className="shrink-0 font-mono text-xs text-blue-400 hover:text-blue-300"
              >
                {copied === url ? "✓ ke-copy" : "copy"}
              </button>
            </div>
          );
        })}
      </div>
      <div>
        <p className={labelCls}>sumber lain (contoh: story, ads, email)</p>
        <input
          value={custom}
          placeholder="nama sumber"
          onChange={(e) => setCustom(e.target.value)}
          className={inputCls + " mt-2"}
        />
      </div>
    </div>
  );
};

/* ================= halaman ================= */

const TABS = [
  { key: "promo", label: "promo" },
  { key: "stats", label: "statistik" },
  { key: "utm", label: "link bio" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const Dashboard: React.FC<{ session: Session }> = ({ session }) => {
  const [tab, setTab] = useState<TabKey>("promo");

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-mono text-xl text-slate-200">admin vintec</h1>
          <p className="mt-1 truncate font-mono text-xs text-slate-600">{session.user.email}</p>
        </div>
        <button
          onClick={() => supabase?.auth.signOut()}
          className="shrink-0 font-mono text-xs text-slate-500 hover:text-slate-300"
        >
          keluar
        </button>
      </div>

      <div className="mt-6 flex gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={[
              "flex-1 rounded-lg py-2 font-mono text-xs transition-colors sm:text-sm",
              tab === t.key ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "promo" && <PromoEditor />}
        {tab === "stats" && <Stats />}
        {tab === "utm" && <UtmLinks />}
      </div>
    </Card>
  );
};

const AdminPage: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    document.title = "Admin · Vintec";
    if (!supabase) return setReady(true);

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <div className="flex min-h-screen items-start justify-center bg-[#060d16] px-4 py-16 text-white sm:py-24">
      <div className="w-full max-w-xl">
        <a href="/" className="mb-4 inline-block font-mono text-xs text-slate-500 hover:text-slate-300">
          ← kembali ke website
        </a>
        {!supabase ? (
          <Card>
            <p className="font-mono text-sm text-red-400">
              Supabase belum disetting. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env
              (atau di Environment Variables hosting), lalu restart / deploy ulang.
            </p>
          </Card>
        ) : !ready ? null : session ? (
          <Dashboard session={session} />
        ) : (
          <LoginForm />
        )}
      </div>
    </div>
  );
};

export default AdminPage;
