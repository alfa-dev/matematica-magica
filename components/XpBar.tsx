"use client";
import { nivelDoXp, tituloDoNivel } from "@/lib/xp";

export default function XpBar({ totalXp }: { totalXp: number }) {
  const { nivel, xpNoNivel, xpNecessario } = nivelDoXp(totalXp);
  const pct = Math.min(100, Math.round((xpNoNivel / xpNecessario) * 100));
  const faltam = xpNecessario - xpNoNivel;
  return (
    <div className="w-full">
      <div className="mb-1 flex items-end justify-between">
        <span className="font-display text-sm font-semibold text-tinta">
          Nível {nivel} · {tituloDoNivel(nivel)}
        </span>
        <span className="font-body text-xs font-bold text-tinta/70">
          {faltam <= 30 ? `Só mais ${faltam} XP! ✨` : `${xpNoNivel}/${xpNecessario} XP`}
        </span>
      </div>
      <div className="h-5 w-full overflow-hidden rounded-full border-2 border-tinta/20 bg-white">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sol to-coral transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
