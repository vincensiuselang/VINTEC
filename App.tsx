import React, { useEffect, useState } from "react";
import Hero from "./src/components/Hero";
import CommandPalette from "./src/components/CommandPalette";
import TechBackground from "./src/components/TechBackground";
import SocialIcons from "./src/components/SocialIcons";
import VisitorCounter from "./src/components/VisitorCounter";
import { SITE_DATA } from "./constants";
import { ProfileData } from "./types";
import vintecLogo from "/public/logovintec2.jpg";

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

const AccuracyBar: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 300);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className="mt-8 w-full">
      <div className="flex items-end justify-between gap-4 font-mono text-xs text-slate-500 sm:text-sm">
        <span className="truncate">
          accuracy <span className="text-slate-600">//</span> {label} 🔥
        </span>
        <span className="shrink-0 text-lg font-bold text-blue-400 sm:text-xl">{value}%</span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-[width] duration-1000 ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const data = SITE_DATA;

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

          <div className="mt-12 sm:mt-16">
            <CommandPalette prompt={data.prompt} items={data.links} />
          </div>

          <AccuracyBar label={data.accuracyLabel} value={data.accuracyValue} />

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
