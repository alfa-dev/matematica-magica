"use client";
import { cosmeticoPorId } from "@/lib/xp";

export type Humor = "feliz" | "comemorando" | "pensando" | "dormindo";

// Pip, a estrelinha mascote. SVG puro, sem assets.
export default function Mascot({
  humor = "feliz",
  hat,
  size = 120,
}: {
  humor?: Humor;
  hat?: string | null;
  size?: number;
}) {
  const chapeu = hat ? cosmeticoPorId(hat)?.emoji : null;
  const olhos =
    humor === "dormindo" ? (
      <>
        <path d="M38 52 q6 5 12 0" stroke="#2B3A67" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M70 52 q6 5 12 0" stroke="#2B3A67" strokeWidth="3" fill="none" strokeLinecap="round" />
      </>
    ) : humor === "pensando" ? (
      <>
        <circle cx="44" cy="52" r="4" fill="#2B3A67" />
        <circle cx="76" cy="52" r="4" fill="#2B3A67" />
        <circle cx="45" cy="50" r="1.5" fill="#fff" />
        <circle cx="77" cy="50" r="1.5" fill="#fff" />
      </>
    ) : (
      <>
        <circle cx="44" cy="52" r="5" fill="#2B3A67" />
        <circle cx="76" cy="52" r="5" fill="#2B3A67" />
        <circle cx="46" cy="50" r="2" fill="#fff" />
        <circle cx="78" cy="50" r="2" fill="#fff" />
      </>
    );

  const boca =
    humor === "comemorando" ? (
      <path d="M48 66 q12 14 24 0 z" fill="#E2554F" />
    ) : humor === "dormindo" ? (
      <ellipse cx="60" cy="68" rx="5" ry="6" fill="#E2554F" opacity="0.7" />
    ) : humor === "pensando" ? (
      <path d="M52 68 q8 -4 16 0" stroke="#2B3A67" strokeWidth="3" fill="none" strokeLinecap="round" />
    ) : (
      <path d="M50 66 q10 8 20 0" stroke="#2B3A67" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    );

  return (
    <div className="relative inline-block select-none" style={{ width: size, height: size }} aria-label={`Pip, o mascote (${humor})`}>
      <svg viewBox="0 0 120 120" width={size} height={size} className={humor === "comemorando" ? "animate-bounce" : ""}>
        {/* corpo estrela */}
        <path
          d="M60 6 L74 40 L110 44 L83 68 L91 104 L60 85 L29 104 L37 68 L10 44 L46 40 Z"
          fill="#FFC93C"
          stroke="#E8A800"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* bochechas */}
        <circle cx="36" cy="62" r="6" fill="#FF9E9E" opacity="0.8" />
        <circle cx="84" cy="62" r="6" fill="#FF9E9E" opacity="0.8" />
        {olhos}
        {boca}
      </svg>
      {chapeu && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-4xl" style={{ fontSize: size * 0.32 }}>
          {chapeu}
        </div>
      )}
      {humor === "dormindo" && (
        <div className="absolute -top-2 right-0 animate-pulse font-display text-xl text-white/90">💤</div>
      )}
    </div>
  );
}
