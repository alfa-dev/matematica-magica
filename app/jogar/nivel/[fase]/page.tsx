"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import GameEngine, { ResultadoSessao } from "@/components/GameEngine";
import Mascot from "@/components/Mascot";
import Confetti from "@/components/Confetti";
import { getFase, FASES, ACERTOS_PARA_COMPLETAR } from "@/lib/levels";
import { XP_FASE_COMPLETA, COSMETICOS_POR_NIVEL, nivelDoXp } from "@/lib/xp";
import { Progresso, carregarProgresso, salvarProgresso, logResposta } from "@/lib/progress";

export default function NivelPage() {
  const params = useParams<{ fase: string }>();
  const faseId = Math.max(1, Math.min(FASES.length, parseInt(params.fase ?? "1", 10) || 1));
  const fase = getFase(faseId);
  const router = useRouter();
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [prog, setProg] = useState<Progresso | null>(null);
  const [resultado, setResultado] = useState<ResultadoSessao | null>(null);
  const [faseCompleta, setFaseCompleta] = useState(false);
  const progRef = useRef<Progresso | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.replace("/");
      setUserId(user.id);
      const p = await carregarProgresso(supabase, user.id);
      if (faseId > p.currentFase) return router.replace("/jogar"); // fase bloqueada
      setProg(p);
      progRef.current = p;
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faseId]);

  function aoXp(novoTotal: number) {
    if (!progRef.current || !userId) return;
    // desbloqueia cosméticos de nível na hora
    const nivel = nivelDoXp(novoTotal).nivel;
    const novosCosmeticos = new Set(progRef.current.unlockedCosmetics);
    for (let n = 2; n <= nivel; n++) {
      const c = COSMETICOS_POR_NIVEL[n];
      if (c) novosCosmeticos.add(c.id);
    }
    progRef.current = { ...progRef.current, totalXp: novoTotal, unlockedCosmetics: [...novosCosmeticos] };
    salvarProgresso(supabase, userId, progRef.current);
  }

  async function aoFim(r: ResultadoSessao) {
    if (!progRef.current || !userId) return;
    let p = progRef.current;
    const completou = r.acertos >= ACERTOS_PARA_COMPLETAR;
    if (completou && faseId === p.currentFase && faseId < FASES.length + 1) {
      p = {
        ...p,
        currentFase: Math.min(FASES.length + 1, p.currentFase + 1),
        totalXp: p.totalXp + XP_FASE_COMPLETA,
      };
      setFaseCompleta(true);
    }
    p = { ...p, bestStreak: Math.max(p.bestStreak, r.melhorStreak) };
    progRef.current = p;
    setProg(p);
    setResultado(r);
    await salvarProgresso(supabase, userId, p);
  }

  if (!prog || !userId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ceu">
        <div className="animate-bounce font-display text-2xl font-bold text-tinta">Preparando as continhas...</div>
      </main>
    );
  }

  if (resultado) {
    const boa = resultado.acertos >= ACERTOS_PARA_COMPLETAR;
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ceu p-6">
        {faseCompleta && <Confetti count={90} />}
        <Mascot humor={boa ? "comemorando" : "feliz"} hat={prog.equippedHat} size={130} />
        <h1 className="text-center font-display text-3xl font-bold text-tinta">
          {faseCompleta ? "FASE COMPLETA! 🏆" : boa ? "Mandou muito bem!" : "Bom treino!"}
        </h1>
        <p className="text-center font-body text-lg font-bold text-tinta/70">
          Você acertou {resultado.acertos} de {resultado.total} e ganhou{" "}
          <span className="text-uva">+{resultado.xpGanho + (faseCompleta ? XP_FASE_COMPLETA : 0)} XP</span>!
        </p>
        {!boa && (
          <p className="max-w-xs text-center font-body font-semibold text-tinta/60">
            O Pip acredita em você! Que tal tentar de novo? Cada tentativa deixa você mais forte. 💪
          </p>
        )}
        <div className="flex w-full max-w-xs flex-col gap-3">
          {!faseCompleta && (
            <button
              onClick={() => {
                setResultado(null);
                setFaseCompleta(false);
              }}
              className="rounded-2xl bg-sol py-4 font-display text-xl font-bold text-tinta shadow-candy active:translate-y-1"
            >
              Jogar de novo
            </button>
          )}
          {faseCompleta && prog.currentFase <= FASES.length && (
            <Link
              href={`/jogar/nivel/${prog.currentFase}`}
              onClick={() => {
                setResultado(null);
                setFaseCompleta(false);
              }}
              className="rounded-2xl bg-grama py-4 text-center font-display text-xl font-bold text-white shadow-candy active:translate-y-1"
            >
              Próxima fase! →
            </Link>
          )}
          <Link
            href="/jogar"
            className="rounded-2xl bg-white py-4 text-center font-display text-xl font-bold text-tinta shadow-candy active:translate-y-1"
          >
            Voltar ao mapa
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-ceu p-4">
      <div className="mb-3 flex w-full max-w-md items-center justify-between">
        <Link href="/jogar" className="font-display font-bold text-tinta/60">
          ← mapa
        </Link>
        <h1 className="font-display text-lg font-bold text-tinta">
          Fase {fase.id}: {fase.nome}
        </h1>
        <span />
      </div>
      <GameEngine
        key={`${faseId}-${resultado ? "r" : "j"}`}
        faseId={faseId}
        totalXpInicial={prog.totalXp}
        hat={prog.equippedHat}
        onXp={aoXp}
        onResposta={(q, ok) => logResposta(supabase, userId, faseId, q.text, ok, "trilha")}
        onFim={aoFim}
      />
    </main>
  );
}
