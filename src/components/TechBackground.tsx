import React from "react";

// logo disimpan lokal di /public/tech biar gak nunggu CDN
const DEVICON = "/tech";

type Item = {
  /** path devicon, atau emoji kalau pakai `emoji` */
  src?: string;
  emoji?: string;
  /** posisi dalam persen */
  top: number;
  left: number;
  size: number;
  opacity: number;
  delay: number;
};

const ITEMS: Item[] = [
  { src: `${DEVICON}/pytorch.svg`, top: 8, left: 6, size: 92, opacity: 0.22, delay: 0 },
  { src: `${DEVICON}/python.svg`, top: 34, left: 4, size: 78, opacity: 0.2, delay: 1.2 },
  { src: `${DEVICON}/kaggle.svg`, top: 47, left: 12, size: 62, opacity: 0.16, delay: 2.4 },
  { src: `${DEVICON}/numpy.svg`, top: 60, left: 3, size: 70, opacity: 0.18, delay: 0.6 },
  { src: `${DEVICON}/opencv.svg`, top: 76, left: 9, size: 66, opacity: 0.16, delay: 1.8 },
  { src: `${DEVICON}/jupyter.svg`, top: 20, left: 17, size: 58, opacity: 0.14, delay: 3 },

  { src: `${DEVICON}/tensorflow.svg`, top: 12, left: 88, size: 88, opacity: 0.2, delay: 0.9 },
  { src: `${DEVICON}/docker.svg`, top: 40, left: 91, size: 74, opacity: 0.18, delay: 2.1 },
  { src: `${DEVICON}/scikitlearn.svg`, top: 55, left: 84, size: 60, opacity: 0.16, delay: 1.5 },
  { src: `${DEVICON}/pandas.svg`, top: 68, left: 92, size: 66, opacity: 0.16, delay: 0.3 },
  { src: `${DEVICON}/github.svg`, top: 82, left: 80, size: 70, opacity: 0.16, delay: 2.7 },
  { src: `${DEVICON}/googlecloud.svg`, top: 26, left: 82, size: 56, opacity: 0.13, delay: 3.3 },

  { emoji: "🤗", top: 84, left: 90, size: 62, opacity: 0.3, delay: 1.1 },
  { emoji: "🧠", top: 63, left: 22, size: 46, opacity: 0.18, delay: 2.2 },
  { emoji: "📊", top: 15, left: 30, size: 40, opacity: 0.14, delay: 0.4 },
  { emoji: "🦙", top: 78, left: 20, size: 52, opacity: 0.2, delay: 1.7 },
  { emoji: "✨", top: 55, left: 74, size: 38, opacity: 0.22, delay: 2.9 },
  { emoji: "👑", top: 10, left: 68, size: 44, opacity: 0.16, delay: 0.8 },
];

const TechBackground: React.FC = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
    {/* glow lembut di tengah */}
    <div className="absolute left-1/2 top-1/3 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[120px]" />
    <div className="absolute left-1/4 bottom-0 h-[380px] w-[380px] rounded-full bg-emerald-500/5 blur-[110px]" />

    {ITEMS.map((item, i) => (
      <div
        key={i}
        className="absolute animate-float select-none"
        style={{
          top: `${item.top}%`,
          left: `${item.left}%`,
          opacity: item.opacity,
          animationDelay: `${item.delay}s`,
          fontSize: item.emoji ? `${item.size}px` : undefined,
          lineHeight: 1,
        }}
      >
        {item.emoji ? (
          item.emoji
        ) : (
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
