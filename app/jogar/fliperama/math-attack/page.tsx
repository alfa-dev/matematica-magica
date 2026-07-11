"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import MathAttack from "@/components/minigames/MathAttack";
import Mascot from "@/components/Mascot";
import {
  Progresso,
  carregarProgresso,
  salvarProgresso,
  logResposta,
  xpArcadeHoje,
  registrarXpArcade,
} from "@/lib/progress";
import { XP_TETO_DIARIO_MINIGAMES } from "@/lib/xp";

export default function MathAttackPage() {
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [prog, setProg] = useState<Progresso | null>(null);
  const [resultado, setResultado] = useState<{ pontos: number; abatidos: number; onda: number; xp: number } | null>(null);
  const [rodada, setRodada] = useState(0);
  const progRef = useRef<Progresso | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.replace("/");
      setUserId(user.id);
      const p = await carregarProgresso(supabase, user.id);
      setProg(p);
      progRef.current = p;
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function aoFim(r: { pontos: number; abatidos: number; onda: number }) {
    if (!progRef.current || !userId) return;
    // XP = 1/5 dos pontos, respeitando o teto diário do fliperama
    const bruto = Math.round(r.pontos / 5);
    const restante = Math.max(0, XP_TETO_DIARIO_MINIGAMES - xpArcadeHoje());
    const xp = Math.min(bruto, restante);
    if (xp > 0) {
      registrarXpArcade(xp);
      const novo = { ...progRef.current, totalXp: progRef.current.totalXp + xp };
      progRef.current = novo;
      setProg(novo);
      await salvarProgresso(supabase, userId, novo);
    }
    setResultado({ ...r, xp });
  }

  if (!prog || !userId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ceunoite">
        <div className="animate-bounce font-display text-2xl font-bold text-white">Invasores chegando... 👾</div>
      </main>
    );
  }

  if (resultado) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ceunoite p-6 text-white">
        <Mascot humor="feliz" hat={prog.equippedHat} size={110} />
        <h1 className="font-display text-3xl font-bold">Fim de jogo!</h1>
        <div className="rounded-3xl bg-white/10 p-6 text-center font-body font-bold">
          <p className="font-display text-4xl text-sol">⭐ {resultado.pontos} pontos</p>
          <p className="mt-2 opacity-80">
            👾 {resultado.abatidos} inimigos · onda {resultado.onda}
          </p>
          <p className="mt-1 text-sol opacity-90">+{resultado.xp} XP {resultado.xp === 0 && "(teto do dia atingido, mas os pontos valeram!)"}</p>
        </div>
        <p className="max-w-xs text-center font-body font-semibold opacity-70">
          A Terra agradece, defensora! Quanto mais você treina, mais longe chega. 🚀
        </p>
        <div className="flex w-full max-w-xs flex-col gap-3">
          <button
            onClick={() => {
              setResultado(null);
              setRodada((r) => r + 1);
            }}
            className="rounded-2xl bg-sol py-4 font-display text-xl font-bold text-tinta shadow-candy active:translate-y-1"
          >
            Jogar de novo!
          </button>
          <Link href="/jogar/fliperama" className="rounded-2xl bg-white/15 py-4 text-center font-display text-xl font-bold shadow-candy active:translate-y-1">
            Voltar ao fliperama
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-ceunoite p-4">
      <div className="mb-2 flex w-full max-w-md items-center justify-between text-white">
        <Link href="/jogar/fliperama" className="font-display font-bold text-white/60">
          ← sair
        </Link>
        <h1 className="font-display text-lg font-bold">👾 Math Attack</h1>
        <span />
      </div>
      <MathAttack
        key={rodada}
        faseMax={Math.max(1, prog.currentFase - 1)}
        onResposta={(q, ok) => logResposta(supabase, userId, q.fase, q.text, ok, "math_attack")}
        onFim={aoFim}
      />
    </main>
  );
}
