"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import GameEngine, { ResultadoSessao } from "@/components/GameEngine";
import Mascot from "@/components/Mascot";
import Confetti from "@/components/Confetti";
import { questoesDoDia, marcarDesafioCompleto, desafioCompletoHoje } from "@/lib/daily";
import { XP_DESAFIO_DIARIO, MARCOS, nivelDoXp, COSMETICOS_POR_NIVEL } from "@/lib/xp";
import { Progresso, carregarProgresso, salvarProgresso, logResposta } from "@/lib/progress";
import { playSleep } from "@/lib/audio";

export default function DesafioPage() {
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [prog, setProg] = useState<Progresso | null>(null);
  const [sticker, setSticker] = useState<string | null>(null);
  const [marcoNovo, setMarcoNovo] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoSessao | null>(null);
  const progRef = useRef<Progresso | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.replace("/");
      if (await desafioCompletoHoje(supabase, user.id)) return router.replace("/jogar");
      setUserId(user.id);
      const p = await carregarProgresso(supabase, user.id);
      setProg(p);
      progRef.current = p;
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const questoes = useMemo(() => {
    if (!userId || !prog) return null;
    const faseJogavel = Math.max(1, Math.min(prog.currentFase, 16));
    return questoesDoDia(userId, faseJogavel);
  }, [userId, prog]);

  function aoXp(novoTotal: number) {
    if (!progRef.current || !userId) return;
    const nivel = nivelDoXp(novoTotal).nivel;
    const cos = new Set(progRef.current.unlockedCosmetics);
    for (let n = 2; n <= nivel; n++) if (COSMETICOS_POR_NIVEL[n]) cos.add(COSMETICOS_POR_NIVEL[n].id);
    progRef.current = { ...progRef.current, totalXp: novoTotal, unlockedCosmetics: [...cos] };
    salvarProgresso(supabase, userId, progRef.current);
  }

  async function aoFim(r: ResultadoSessao) {
    if (!progRef.current || !userId) return;
    let p = progRef.current;
    const novosDias = p.totalTrainingDays + 1;
    const cos = new Set(p.unlockedCosmetics);
    const marcos = new Set(p.claimedMilestones);
    let marcoDesbloqueado: string | null = null;
    for (const m of MARCOS) {
      if (novosDias >= m.dias && !marcos.has(m.dias)) {
        marcos.add(m.dias);
        cos.add(m.cosmetico.id);
        marcoDesbloqueado = `${m.cosmetico.emoji} ${m.cosmetico.nome}`;
      }
    }
    p = {
      ...p,
      totalXp: p.totalXp + XP_DESAFIO_DIARIO,
      totalTrainingDays: novosDias,
      claimedMilestones: [...marcos],
      unlockedCosmetics: [...cos],
      bestStreak: Math.max(p.bestStreak, r.melhorStreak),
    };
    progRef.current = p;
    setProg(p);
    const st = await marcarDesafioCompleto(supabase, userId, r.acertos);
    await salvarProgresso(supabase, userId, p);
    setSticker(st);
    setMarcoNovo(marcoDesbloqueado);
    setResultado(r);
    playSleep();
  }

  if (!prog || !userId || !questoes) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ceu">
        <div className="animate-bounce font-display text-2xl font-bold text-tinta">Abrindo o baú do dia... 🎁</div>
      </main>
    );
  }

  if (resultado) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-ceunoite to-[#2E3D7A] p-6 text-white">
        <Confetti count={80} />
        <h1 className="text-center font-display text-3xl font-bold">MISSÃO DO DIA COMPLETA! ✅</h1>
        <div className="rounded-3xl bg-white/15 p-6 text-center backdrop-blur">
          <p className="font-body text-lg font-bold">Adesivo de hoje:</p>
          <p className="my-2 text-7xl">{sticker}</p>
          <p className="font-body font-semibold opacity-80">
            {resultado.acertos}/{resultado.total} certas · +{XP_DESAFIO_DIARIO} XP de bônus!
          </p>
          <p className="mt-1 font-body text-sm opacity-70">🗓️ {prog.totalTrainingDays} dias de treino no total</p>
        </div>
        {marcoNovo && (
          <div className="rounded-2xl bg-sol px-5 py-3 text-center font-display text-lg font-bold text-tinta shadow-candy">
            🎁 Brinde de dedicação: {marcoNovo}!
          </div>
        )}
        <div className="flex flex-col items-center">
          <Mascot humor="dormindo" hat={prog.equippedHat} size={110} />
          <p className="max-w-xs text-center font-body font-semibold opacity-80">
            "Ufa, treino feito! Agora vou tirar uma soneca. Até amanhã!" 💤
          </p>
        </div>
        <Link
          href="/jogar"
          className="w-full max-w-xs rounded-2xl bg-white py-4 text-center font-display text-xl font-bold text-tinta shadow-candy active:translate-y-1"
        >
          Voltar ao mapa
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-ceu p-4">
      <div className="mb-3 flex w-full max-w-md items-center justify-between">
        <Link href="/jogar" className="font-display font-bold text-tinta/60">
          ← mapa
        </Link>
        <h1 className="font-display text-lg font-bold text-tinta">🎁 Desafio do Dia</h1>
        <span />
      </div>
      <GameEngine
        faseId={prog.currentFase}
        questoesFixas={questoes}
        totalXpInicial={prog.totalXp}
        hat={prog.equippedHat}
        onXp={aoXp}
        onResposta={(q, ok) => logResposta(supabase, userId, q.fase, q.text, ok, "desafio")}
        onFim={aoFim}
      />
    </main>
  );
}
