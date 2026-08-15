import React from "react";
import vintecLogo from "/public/logovintec2.jpg";

/**
 * Blok kode di hero.
 * Mau ganti isi kodenya? edit array CODE di bawah ini.
 * `c` = warna token (pakai kelas tailwind), `t` = teksnya.
 */
const CODE: { t: string; c?: string }[][] = [
  [{ t: "# belajar ML & AI — dari dasar sampai bisa", c: "italic text-slate-500" }],
  [
    { t: "for ", c: "text-[#c678dd]" },
    { t: "epoch ", c: "text-slate-200" },
    { t: "in ", c: "text-[#c678dd]" },
    { t: "range", c: "text-[#61afef]" },
    { t: "(", c: "text-slate-400" },
    { t: "dari_nol", c: "text-[#e5c07b]" },
    { t: ", ", c: "text-slate-400" },
    { t: "jago", c: "text-[#e5c07b]" },
    { t: "):", c: "text-slate-400" },
  ],
  [
    { t: "    loss ", c: "text-slate-200" },
    { t: "= ", c: "text-slate-400" },
    { t: "belajar", c: "text-[#61afef]" },
    { t: "(", c: "text-slate-400" },
    { t: "'ML & DL'", c: "text-[#98c379]" },
    { t: ")", c: "text-slate-400" },
  ],
  [
    { t: "    loss", c: "text-slate-200" },
    { t: ".backward", c: "text-[#61afef]" },
    { t: "()", c: "text-slate-400" },
  ],
];

const CodeBlock: React.FC = () => (
  <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] text-left backdrop-blur-sm">
    {CODE.map((line, i) => (
      <div key={i} className="flex items-start">
        <span className="w-10 shrink-0 select-none border-r border-white/[0.06] py-2 pr-3 text-right font-mono text-xs text-slate-600 sm:w-12 sm:py-2.5 sm:text-sm">
          {i + 1}
        </span>
        <code className="overflow-x-auto whitespace-pre py-2 pl-3 font-mono text-[11px] leading-relaxed sm:py-2.5 sm:pl-5 sm:text-base">
          {line.map((tok, j) => (
            <span key={j} className={tok.c}>
              {tok.t}
            </span>
          ))}
          {i === CODE.length - 1 && (
            <span className="ml-1 inline-block h-3.5 w-[7px] translate-y-0.5 animate-pulse bg-blue-400 sm:h-4 sm:w-2" />
          )}
        </code>
      </div>
    ))}
  </div>
);

interface Props {
  name: string;
  role: string;
  taglines: string[];
}

const Hero: React.FC<Props> = ({ name, role, taglines }) => (
  <section className="flex flex-col items-center text-center">
    {/* logo */}
    <div className="relative">
      <div className="absolute inset-0 rounded-[28px] bg-blue-400/25 blur-2xl" />
      <div className="relative flex h-24 w-24 items-center justify-center rounded-[22px] bg-white p-3 shadow-2xl shadow-black/40 sm:h-32 sm:w-32 sm:rounded-[28px] sm:p-4">
        <img src={vintecLogo} alt={name} className="h-full w-full object-contain" />
      </div>
    </div>

    <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:mt-8 sm:text-6xl">
      {name}
    </h1>

    <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-blue-400 sm:mt-4 sm:text-base sm:tracking-[0.2em]">
      <span className="text-slate-600">// </span>
      {role}
    </p>

    <div className="mt-8 w-full sm:mt-10">
      <CodeBlock />
    </div>

    <p className="mt-6 px-2 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500 sm:mt-8 sm:text-xs sm:tracking-[0.2em]">
      {taglines.join(" · ")}
    </p>
  </section>
);

export default Hero;
