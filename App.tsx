import React, { useEffect, useRef, useState } from "react";
import Hero from "./src/components/Hero";
import CommandPalette from "./src/components/CommandPalette";
import TechBackground from "./src/components/TechBackground";
import SocialIcons from "./src/components/SocialIcons";
import VisitorCounter from "./src/components/VisitorCounter";
import { SITE_DATA } from "./constants";
import { AccuracyLevel, LinkItem, ProfileData } from "./types";
import { LinkPromo, isPromoRunning } from "./src/lib/promo";
import { restGet } from "./src/lib/rest";
import { trackView } from "./src/lib/tracking";
import vintecLogo from "/public/vintec-logo.svg";

const WindowBar: React.FC<{ tabName: string; visitor: ProfileData["visitor"] }> = ({
  tabName,
  visitor,
}) => (
  <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#060d16]/80 backdrop-blur-xl">
    <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 sm:gap-4 sm:px-6">
      {/* mac dots */}
      <div className="flex shrink-0 items-center gap-1.5 py-3 sm:gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57] sm:h-3 sm:w-3" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e] sm:h-3 sm:w-3" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840] sm:h-3 sm:w-3" />
      </div>

      {/* tab aktif */}
      <div className="flex min-w-0 flex-1 items-end">
        <div className="flex items-center gap-2 rounded-t-lg border border-b-0 border-white/10 bg-white/[0.06] px-3 py-3 sm:px-4">
          <img src={vintecLogo} alt="" className="h-4 w-4 shrink-0 rounded-sm object-cover" />
          <span className="truncate font-mono text-[11px] text-slate-200 sm:text-sm">{tabName}</span>
        </div>
      </div>

      <div className="shrink-0 py-3">
        <VisitorCounter
          namespace={visitor.namespace}
          counterKey={visitor.key}
          fallback={visitor.fallback}
        />
      </div>
    </div>
  </header>
);

const AccuracyBar: React.FC<{ levels: AccuracyLevel[]; value: number }> = ({ levels, value }) => {
  const [width, setWidth] = useState(0);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // animasi awal: dari 0 ke nilai default
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 300);
    return () => clearTimeout(t);
  }, [value]);

  // cari label yang cocok: level dengan `min` terbesar yang <= nilai sekarang
  const label =
    [...levels].sort((a, b) => b.min - a.min).find((l) => width >= l.min)?.label ?? "";

  const setFromPointer = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setWidth(Math.round(Math.min(100, Math.max(0, pct))));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 1;
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = width + step;
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = width - step;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = 100;
    else if (e.key === "Enter") e.stopPropagation(); // jangan sampai buka link di palette
    if (next !== null) {
      e.preventDefault();
      e.stopPropagation(); // biar panah gak ikut gerakin command palette
      setWidth(Math.min(100, Math.max(0, next)));
    }
  };

  return (
    <div className="mt-8 w-full">
      <div className="flex items-end justify-between gap-4 font-mono text-xs text-slate-500 sm:text-sm">
        <span className="truncate">
          accuracy <span className="text-slate-600">//</span> {label}
        </span>
        <span className="shrink-0 text-lg font-bold tabular-nums text-blue-400 sm:text-xl">
          {width}%
        </span>
      </div>

      {/* area sentuh dibikin lebih tinggi dari bar-nya biar gampang digeser di HP */}
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label="accuracy"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={width}
        aria-valuetext={`${width}% — ${label}`}
        onKeyDown={onKeyDown}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
          setFromPointer(e.clientX);
        }}
        onPointerMove={(e) => dragging && setFromPointer(e.clientX)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        className="group relative mt-1 flex h-8 cursor-pointer touch-none select-none items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50"
      >
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className={[
              "h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400",
              dragging ? "" : "transition-[width] duration-500 ease-out",
            ].join(" ")}
            style={{ width: `${width}%` }}
          />
        </div>

        {/* knob */}
        <div
          className={[
            "absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-emerald-400 bg-[#060d16] shadow-[0_0_10px_rgba(52,211,153,0.6)] transition-transform group-hover:scale-125",
            dragging ? "scale-125" : "transition-[left] duration-500 ease-out",
          ].join(" ")}
          style={{ left: `${width}%` }}
        />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const data = SITE_DATA;
  const [links, setLinks] = useState<LinkItem[]>(data.links);

  // catat kunjungan + ambil promo yang diatur dari /admin
  useEffect(() => {
    trackView();
    restGet<LinkPromo[]>("link_promos?select=*&active=eq.true").then((promos) => {
      const running = (promos ?? []).filter((p) => isPromoRunning(p));
      if (!running.length) return;
      const byId = new Map(running.map((p) => [p.link_id, p]));
      setLinks(
        data.links.map((l) => {
          const p = byId.get(l.id);
          if (!p) return l;
          return {
            ...l,
            promo: {
              badge: p.badge.trim(),
              endsAt: p.ends_at,
              priceNormal: p.price_normal,
              pricePromo: p.price_promo,
            },
          };
        })
      );
    });
  }, []);

  // hitung mundur habis → promo langsung hilang tanpa perlu refresh
  const removePromo = (linkId: string) =>
    setLinks((ls) => ls.map((l) => (l.id === linkId ? { ...l, promo: undefined } : l)));

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="relative min-h-screen bg-[#060d16] text-white">
      <TechBackground />

      <div className="relative z-10">
        <WindowBar tabName={data.tabName} visitor={data.visitor} />

        <main className="mx-auto flex max-w-4xl flex-col px-4 pb-4 pt-12 sm:px-6 sm:pt-20">
          <Hero name={data.name} role={data.role} taglines={data.taglines} />

          <div className="mt-8 sm:mt-10">
            <CommandPalette prompt={data.prompt} items={links} onPromoExpire={removePromo} />
          </div>

          <AccuracyBar levels={data.accuracyLevels} value={data.accuracyValue} />

          <SocialIcons socials={data.socials} />

          <footer className="pb-10 text-center font-mono text-[11px] text-slate-600">
            © {new Date().getFullYear()} {data.name} · {data.role}
          </footer>
        </main>
      </div>
    </div>
  );
};

export default App;
