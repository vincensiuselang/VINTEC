import React, { useEffect, useState } from "react";
import Hero from "./src/components/Hero";
import CommandPalette from "./src/components/CommandPalette";
import TechBackground from "./src/components/TechBackground";
import SocialIcons from "./src/components/SocialIcons";
import VisitorCounter from "./src/components/VisitorCounter";
import { SITE_DATA } from "./constants";
import { ProfileData } from "./types";
import vintecLogo from "/public/logovintec2.jpg";
import { trackView } from "./src/lib/track";

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

/**
 * Bar accuracy yang bisa digeser kiri-kanan.
 * Pakai <input type="range"> transparan di atas bar custom, jadi drag di HP,
 * klik di laptop, dan tombol panah di keyboard semuanya jalan tanpa library.
 */
const AccuracyBar: React.FC<{
  levels: ProfileData["accuracyLevels"];
  initial: number;
}> = ({ levels, initial }) => {
  const [value, setValue] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);

  // animasi awal: bar keisi dari 0 ke nilai awal
  useEffect(() => {
    const t = setTimeout(() => setValue(initial), 300);
    return () => clearTimeout(t);
  }, [initial]);

  const label =
    [...levels].reverse().find((l) => value >= l.min)?.label ?? levels[0]?.label ?? "";

  // pas lagi digeser, transisi dimatiin biar bar nempel ke jari, gak telat
  const motion = dragging
    ? "transition-none"
    : "transition-all duration-700 ease-out motion-reduce:transition-none";

  const startDrag = () => {
    setDragging(true);
    setTouched(true);
  };
  const stopDrag = () => setDragging(false);

  return (
    <div className="mt-8 w-full select-none">
      <div className="flex items-end justify-between gap-4 font-mono text-xs text-slate-500 sm:text-sm">
        <span className="truncate">
          accuracy <span className="text-slate-600">//</span>{" "}
          <span key={label} className="inline-block animate-label-in text-slate-300">
            {label}
          </span>
        </span>
        <span className="shrink-0 text-lg font-bold tabular-nums text-blue-400 sm:text-xl">
          {value}%
        </span>
      </div>

      <div className="relative mt-3 flex h-6 items-center">
        {/* track + isi */}
        <div className="absolute inset-x-0 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className={`h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 ${motion}`}
            style={{ width: `${value}%` }}
          />
        </div>

        {/* input asli: gak keliatan, tapi dia yang nangkep drag/klik/keyboard */}
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(e) => {
            setValue(Number(e.target.value));
            setTouched(true);
          }}
          onPointerDown={startDrag}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
          onBlur={stopDrag}
          aria-label="geser accuracy"
          aria-valuetext={`${value}% — ${label}`}
          className="peer absolute inset-0 z-10 h-full w-full cursor-grab opacity-0 active:cursor-grabbing"
        />

        {/* jempol / handle */}
        <span
          className={[
            "pointer-events-none absolute h-4 w-4 -translate-x-1/2 rounded-full border-2 border-emerald-300 bg-[#060d16]",
            "shadow-[0_0_12px_rgba(52,211,153,0.7)] ring-0 ring-emerald-400/40 peer-focus-visible:ring-4",
            dragging ? "scale-125" : "scale-100",
            motion,
          ].join(" ")}
          style={{ left: `${value}%` }}
        />
      </div>

      <p
        className={[
          "mt-2 text-center font-mono text-[10px] text-slate-600 transition-opacity duration-500 sm:text-xs",
          touched ? "opacity-0" : "opacity-100",
        ].join(" ")}
        aria-hidden="true"
      >
        ← geser →
      </p>
    </div>
  );
};

const App: React.FC = () => {
  const data = SITE_DATA;

  useEffect(() => {
    document.documentElement.classList.add("dark");
    trackView();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#060d16] text-white">
      <TechBackground />

      <div className="relative z-10">
        <WindowBar tabName={data.tabName} visitor={data.visitor} />

        <main className="mx-auto flex max-w-4xl flex-col px-4 pb-4 pt-12 sm:px-6 sm:pt-20">
          <Hero name={data.name} role={data.role} taglines={data.taglines} />

          <div className="mt-12 sm:mt-16">
            <CommandPalette prompt={data.prompt} items={data.links} />
          </div>

          <AccuracyBar levels={data.accuracyLevels} initial={data.accuracyValue} />

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
