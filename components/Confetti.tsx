"use client";
import { useMemo } from "react";

const CORES = ["#FFC93C", "#FF6B6B", "#58C472", "#7C5CE0", "#4FC3F7", "#FF9E9E"];

export default function Confetti({ count = 80 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        dur: 2 + Math.random() * 2,
        color: CORES[i % CORES.length],
        size: 8 + Math.random() * 8,
        rot: Math.random() * 360,
      })),
    [count]
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <div
          key={i}
          className="confete absolute rounded-sm"
          style={{
            left: `${p.left}%`,
            top: -20,
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            transform: `rotate(${p.rot}deg)`,
          }}
        />
      ))}
    </div>
  );
}
