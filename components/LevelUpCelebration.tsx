"use client";
import { useEffect } from "react";
import Confetti from "./Confetti";
import Mascot from "./Mascot";
import { tituloDoNivel, COSMETICOS_POR_NIVEL } from "@/lib/xp";
import { playFanfare } from "@/lib/audio";

export default function LevelUpCelebration({
  nivel,
  hat,
  onClose,
}: {
  nivel: number;
  hat: string | null;
  onClose: () => void;
}) {
  useEffect(() => {
    playFanfare();
  }, []);

  const novoCosmetico = COSMETICOS_POR_NIVEL[nivel];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-tinta/80 p-6 backdrop-blur-sm">
      <Confetti count={100} />
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-candy">
        <div className="mb-2 font-display text-5xl">🎉</div>
        <h2 className="font-display text-3xl font-bold text-coral">SUBIU DE NÍVEL!</h2>
        <div className="my-4 flex justify-center">
          <Mascot humor="comemorando" hat={novoCosmetico?.id ?? hat} size={130} />
        </div>
        <p className="font-display text-xl font-semibold text-tinta">Nível {nivel}</p>
        <p className="mb-4 font-body text-lg font-bold text-uva">{tituloDoNivel(nivel)}</p>
        {novoCosmetico && (
          <div className="mb-4 rounded-2xl bg-ceu p-3">
            <p className="font-body text-sm font-bold text-tinta">Você ganhou um presente!</p>
            <p className="font-display text-2xl">
              {novoCosmetico.emoji} {novoCosmetico.nome}
            </p>
          </div>
        )}
        <button
          onClick={onClose}
          className="w-full rounded-2xl bg-grama py-4 font-display text-xl font-bold text-white shadow-candy transition active:translate-y-1 active:shadow-candyPressed"
        >
          Continuar a aventura!
        </button>
      </div>
    </div>
  );
}
