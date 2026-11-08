import React, { useEffect, useRef, useState } from "react";
import { LinkItem } from "../../types";
import { formatRupiah } from "../lib/promo";
import { trackClick } from "../lib/tracking";
import lynkIdLogo from "/public/lynkidlogo.png";
import shopeeLogo from "/public/shopee-seeklogo.png";
import vintecLogo from "/public/vintec-logo.svg";

const WhatsappGlyph = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

/** badge promo merah — diatur dari halaman /admin */
export const PromoBadge: React.FC<{ text: string }> = ({ text }) => (
  <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-gradient-to-r from-rose-500 to-pink-500 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider text-white shadow-lg shadow-rose-500/30 sm:text-xs">
    <span className="relative flex h-1.5 w-1.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
    </span>
    {text}
  </span>
);

const pad = (n: number) => String(n).padStart(2, "0");

/** hitung mundur sampai `endsAt`. Manggil onExpire sekali pas waktunya habis. */
export const Countdown: React.FC<{ endsAt: string; onExpire?: () => void }> = ({
  endsAt,
  onExpire,
}) => {
  const end = new Date(endsAt).getTime();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const left = Math.max(0, end - now);
  useEffect(() => {
    if (left === 0) onExpire?.();
  }, [left === 0]);

  const s = Math.floor(left / 1000);
  const d = Math.floor(s / 86400);
  const clock = `${pad(Math.floor((s % 86400) / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;

  return (
    <span className="whitespace-nowrap tabular-nums text-rose-300">
      ⏱ berakhir {d > 0 ? `${d} hari ` : ""}
      {clock}
    </span>
  );
};

/** baris harga coret + hitung mundur di bawah judul tombol */
export const PromoDetails: React.FC<{
  promo: NonNullable<LinkItem["promo"]>;
  onExpire?: () => void;
}> = ({ promo, onExpire }) => {
  const hasPrice = promo.pricePromo != null;
  const hasStrike = promo.priceNormal != null && (!hasPrice || promo.priceNormal > promo.pricePromo!);
  if (!hasPrice && !hasStrike && !promo.endsAt) return null;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs sm:text-sm">
      {hasStrike && (
        <span className="text-slate-500 line-through decoration-rose-400/70">
          {formatRupiah(promo.priceNormal!)}
        </span>
      )}
      {hasPrice && (
        <span className="text-sm font-bold text-emerald-300 sm:text-base">
          {formatRupiah(promo.pricePromo!)}
        </span>
      )}
      {promo.endsAt && <Countdown endsAt={promo.endsAt} onExpire={onExpire} />}
    </div>
  );
};

const ItemIcon: React.FC<{ icon?: LinkItem["icon"] }> = ({ icon }) => {
  if (icon === "whatsapp") {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#25D366] shadow-lg shadow-emerald-500/20 sm:h-14 sm:w-14">
        <WhatsappGlyph />
      </div>
    );
  }

  if (icon === "website") {
    return (
      <img
        src={vintecLogo}
        alt=""
        className="h-12 w-12 shrink-0 rounded-2xl shadow-lg shadow-cyan-500/20 ring-1 ring-white/10 sm:h-14 sm:w-14"
      />
    );
  }

  const src = icon === "shopee" ? shopeeLogo : lynkIdLogo;
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white p-2 shadow-lg shadow-black/30 sm:h-14 sm:w-14">
      <img src={src} alt="" className="h-full w-full object-contain" />
    </div>
  );
};

interface Props {
  prompt: string;
  items: LinkItem[];
  /** dipanggil pas hitung mundur promo suatu tombol habis */
  onPromoExpire?: (linkId: string) => void;
}

const CommandPalette: React.FC<Props> = ({ prompt, items, onPromoExpire }) => {
  const [active, setActive] = useState(0);
  const rowRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  const open = (index: number) => {
    const item = items[index];
    if (!item) return;
    trackClick(item.id);
    window.open(item.url, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => (i + 1) % items.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => (i - 1 + items.length) % items.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        open(active);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, items]);

  useEffect(() => {
    rowRefs.current[active]?.focus({ preventScroll: true });
  }, [active]);

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0b1622]/85 shadow-2xl shadow-black/50 backdrop-blur-xl">
      {/* header */}
      <div className="flex items-center gap-3 px-6 py-5 sm:px-8 sm:py-6">
        <span className="text-[10px] text-blue-400">▼</span>
        <span className="truncate font-mono text-base text-slate-200 sm:text-2xl">{prompt}</span>
      </div>

      <div className="h-px w-full bg-white/10" />

      {/* rows */}
      <div>
        {items.map((item, i) => {
          const isActive = i === active;
          return (
            <a
              key={item.id}
              ref={(el) => (rowRefs.current[i] = el)}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick(item.id)}
              onAuxClick={(e) => e.button === 1 && trackClick(item.id)}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className={[
                "group relative flex items-center gap-4 px-6 py-5 outline-none transition-colors sm:gap-6 sm:px-8 sm:py-6",
                isActive ? "bg-emerald-500/[0.07]" : "hover:bg-white/[0.03]",
              ].join(" ")}
            >
              {/* garis kiri saat aktif */}
              <span
                className={[
                  "absolute left-0 top-0 h-full w-[3px] transition-opacity",
                  isActive ? "bg-emerald-400 opacity-100" : "opacity-0",
                ].join(" ")}
              />

              <ItemIcon icon={item.icon} />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="text-base font-bold leading-snug text-white sm:text-2xl">
                    {item.title}
                  </span>
                  {item.badge && (
                    <span className="whitespace-nowrap rounded-md border border-orange-400/50 px-2.5 py-1 font-mono text-[10px] tracking-wider text-orange-300 sm:text-xs">
                      {item.badge}
                    </span>
                  )}
                  {item.promo && <PromoBadge text={item.promo.badge} />}
                </div>
                {item.subtitle && (
                  <p
                    className={[
                      "mt-1 line-clamp-2 font-mono text-xs sm:line-clamp-1 sm:text-sm",
                      isActive ? "text-emerald-400" : "text-slate-500",
                    ].join(" ")}
                  >
                    {item.subtitle}
                  </p>
                )}
                {item.promo && (
                  <PromoDetails promo={item.promo} onExpire={() => onPromoExpire?.(item.id)} />
                )}
              </div>

              <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition-colors group-hover:border-white/25 group-hover:text-slate-200 sm:flex">
                ↵
              </span>
            </a>
          );
        })}
      </div>

      <div className="h-px w-full bg-white/10" />

      {/* footer */}
      <div className="flex items-center justify-between px-6 py-4 font-mono text-[11px] text-slate-500 sm:px-8 sm:text-sm">
        <div className="flex items-center gap-4 sm:gap-6">
          <span>
            <span className="text-blue-400">↑↓</span> pilih
          </span>
          <span>
            <span className="text-blue-400">↵</span> buka
          </span>
        </div>
        <span>{items.length} results</span>
      </div>
    </div>
  );
};

export default CommandPalette;
