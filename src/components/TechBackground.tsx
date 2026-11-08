import React from "react";

/**
 * Logo & emoji yang melayang di background.
 *
 * - Mau nambah logo? masukin ke LOGOS (file svg di /public/tech) atau EMOJIS.
 * - Posisinya disebar otomatis ke kiri & kanan halaman (grid + acak dikit),
 *   jadi gak dempet-dempetan.
 * - Tiap logo punya jalur gerak sendiri (--dx / --dy / --r) & kecepatan beda,
 *   animasinya ada di tailwind.config.js → keyframes.drift.
 */

const LOGOS = [
  "pytorch", "tensorflow", "python", "docker", "kaggle", "scikitlearn",
  "numpy", "pandas", "opencv", "github", "jupyter", "googlecloud",
].map((n) => ({ src: `/tech/${n}.svg` }));

const EMOJIS = ["🤗", "🧠", "📊", "🦙", "✨", "👑", "🤖", "📈", "⚡", "🧪", "💡", "🎯"].map(
  (e) => ({ emoji: e })
);

// random yang hasilnya selalu sama tiap reload (biar layout gak loncat-loncat)
const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};
const between = (seed: number, min: number, max: number) => min + rand(seed) * (max - min);

type Item = {
  src?: string;
  emoji?: string;
  top: number; // %
  left: number; // %
  size: number; // px
  opacity: number;
  dx: number; // px — lebar gerak horizontal
  dy: number; // px — lebar gerak vertikal
  rot: number; // deg
  duration: number; // detik
  delay: number; // detik (negatif biar langsung gerak)
  mobile: boolean; // tampil di HP?
};

// selang-seling logo & emoji
const SOURCES = LOGOS.flatMap((l, i) => [l, EMOJIS[i]]);

// 2 kolom di kiri + 2 kolom di kanan, tiap kolom 6 baris = 24 slot
const COLUMNS = [3, 14, 82, 93];
const ROWS = 6;

const ITEMS: Item[] = SOURCES.map((s, i) => {
  const col = COLUMNS[i % COLUMNS.length];
  const row = Math.floor(i / COLUMNS.length);
  const isEmoji = "emoji" in s;
  return {
    ...s,
    top: 4 + row * (88 / ROWS) + between(i + 1, -3, 3),
    left: col + between(i + 101, -2.5, 2.5),
    size: Math.round(isEmoji ? between(i + 201, 34, 54) : between(i + 201, 50, 84)),
    opacity: +(isEmoji ? between(i + 301, 0.18, 0.3) : between(i + 301, 0.13, 0.22)).toFixed(2),
    dx: Math.round(between(i + 401, 35, 80)) * (rand(i + 501) > 0.5 ? 1 : -1),
    dy: Math.round(between(i + 601, 35, 75)),
    rot: Math.round(between(i + 701, 8, 22)) * (rand(i + 801) > 0.5 ? 1 : -1),
    duration: +between(i + 901, 4, 7).toFixed(1),
    delay: -+between(i + 1001, 0, 7).toFixed(1),
    // di HP layarnya sempit — tampilin kolom paling pinggir aja
    mobile: col === COLUMNS[0] || col === COLUMNS[3],
  };
});

const TechBackground: React.FC = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
    {/* glow lembut di tengah */}
    <div className="absolute left-1/2 top-1/3 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[120px]" />
    <div className="absolute bottom-0 left-1/4 h-[380px] w-[380px] rounded-full bg-emerald-500/5 blur-[110px]" />

    {ITEMS.map((item, i) => (
      <div
        key={i}
        className={[
          "absolute animate-drift select-none will-change-transform",
          item.mobile ? "" : "hidden sm:block",
        ].join(" ")}
        style={
          {
            top: `${item.top}%`,
            left: `${item.left}%`,
            opacity: item.opacity,
            animationDuration: `${item.duration}s`,
            animationDelay: `${item.delay}s`,
            fontSize: item.emoji ? `${item.size}px` : undefined,
            lineHeight: 1,
            "--dx": `${item.dx}px`,
            "--dy": `${item.dy}px`,
            "--r": `${item.rot}deg`,
          } as React.CSSProperties
        }
      >
        {item.emoji ?? (
          <img
            src={item.src}
            alt=""
            loading="lazy"
            width={item.size}
            height={item.size}
            style={{ width: item.size, height: item.size }}
          />
        )}
      </div>
    ))}
  </div>
);

export default TechBackground;
