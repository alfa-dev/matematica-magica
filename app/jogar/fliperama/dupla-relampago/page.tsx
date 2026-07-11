"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Mascot from "@/components/Mascot";
import Confetti from "@/components/Confetti";
import { generateQuestion, Question } from "@/lib/questionGenerator";
import { playClick, playCorrect, playWrong, playFanfare } from "@/lib/audio";
import {
  Progresso,
  carregarProgresso,
  salvarProgresso,
  logResposta,
  xpArcadeHoje,
  registrarXpArcade,
} from "@/lib/progress";
import { XP_TETO_DIARIO_MINIGAMES } from "@/lib/xp";

interface Carta {
  id: number;
  parId: number;
  texto: string;
  ehPergunta: boolean;
  q: Question;
  virada: boolean;
  achada: boolean;
}

function embaralhar<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function montarBaralho(faseMax: number): Carta[] {
  const cartas: Carta[] = [];
  const respostas = new Set<number>();
  let parId = 0;
  let guard = 0;
  while (parId < 8 && guard < 200) {
    guard++;
    const fase = 1 + Math.floor(Math.random() * faseMax);
    const q = generateQuestion(fase);
    if (respostas.has(q.answer)) continue; // respostas únicas: sem pares ambíguos
    respostas.add(q.answer);
    cartas.push({ id: parId * 2, parId, texto: q.text, ehPergunta: true, q, virada: false, achada: false });
    cartas.push({ id: parId * 2 + 1, parId, texto: String(q.answer), ehPergunta: false, q, virada: false, achada: false });
    parId++;
  }
  return embaralhar(cartas);
}

export default function DuplaRelampagoPage() {
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [prog, setProg] = useState<Progresso | null>(null);
  const [rodada, setRodada] = useState(0);
  const [cartas, setCartas] = useState<Carta[]>([]);
  const [tentativas, setTentativas] = useState(0);
  const [fim, setFim] = useState(false);
  const [xpGanho, setXpGanho] = useState(0);
  const travado = useRef(false);
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

  useEffect(() => {
    if (prog) {
      setCartas(montarBaralho(Math.max(1, prog.currentFase - 1)));
      setTentativas(0);
      setFim(false);
      setXpGanho(0);
    }
  }, [prog, rodada]);

  async function virar(carta: Carta) {
    if (travado.current || carta.virada || carta.achada || fim) return;
    playClick();
    const viradas = cartas.filter((c) => c.virada && !c.achada);
    const novas = cartas.map((c) => (c.id === carta.id ? { ...c, virada: true } : c));
    setCartas(novas);

    if (viradas.length === 1) {
      const outra = viradas[0];
      setTentativas((t) => t + 1);
      const par = outra.parId === carta.parId;
      if (userId) logResposta(supabase, userId, carta.q.fase, carta.q.text, par, "dupla_relampago");
      travado.current = true;
      setTimeout(async () => {
        travado.current = false;
        if (par) {
          playCorrect();
          const aposPar = novas.map((c) => (c.parId === carta.parId ? { ...c, achada: true } : c));
          setCartas(aposPar);
          if (aposPar.every((c) => c.achada)) {
            playFanfare();
            setFim(true);
            // XP: 40 por partida completa, respeitando o teto do fliperama
            const restante = Math.max(0, XP_TETO_DIARIO_MINIGAMES - xpArcadeHoje());
            const xp = Math.min(40, restante);
            setXpGanho(xp);
            if (xp > 0 && progRef.current && userId) {
              registrarXpArcade(xp);
              const novo = { ...progRef.current, totalXp: progRef.current.totalXp + xp };
              progRef.current = novo;
              setProg(novo);
              await salvarProgresso(supabase, userId, novo);
            }
          }
        } else {
          playWrong();
          setCartas(novas.map((c) => (!c.achada ? { ...c, virada: false } : c)));
        }
      }, par ? 350 : 900);
    }
  }

  if (!prog) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ceunoite">
        <div className="animate-bounce font-display text-2xl font-bold text-white">Embaralhando... ⚡</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ceunoite p-4 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-3 flex items-center justify-between">
          <Link href="/jogar/fliperama" className="font-display font-bold text-white/60">
            ← sair
          </Link>
          <h1 className="font-display text-lg font-bold">⚡ Dupla Relâmpago</h1>
          <span className="font-body text-sm font-bold text-white/70">{tentativas} tentativas</span>
        </div>

        {fim ? (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <Confetti count={70} />
            <Mascot humor="comemorando" hat={prog.equippedHat} size={110} />
            <h2 className="font-display text-3xl font-bold">Todas as duplas! ⚡</h2>
            <p className="font-body font-bold opacity-80">
              Em {tentativas} tentativas · +{xpGanho} XP
              {xpGanho === 0 && " (teto do dia, mas valeu o treino!)"}
            </p>
            <div className="flex w-full max-w-xs flex-col gap-3">
              <button
                onClick={() => setRodada((r) => r + 1)}
                className="rounded-2xl bg-sol py-4 font-display text-xl font-bold text-tinta shadow-candy active:translate-y-1"
              >
                Mais uma!
              </button>
              <Link href="/jogar/fliperama" className="rounded-2xl bg-white/15 py-4 text-center font-display text-xl font-bold">
                Voltar ao fliperama
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p className="mb-3 text-center font-body text-sm font-bold text-white/70">
              Ache o par: a continha e a resposta dela!
            </p>
            <div className="grid grid-cols-4 gap-2">
              {cartas.map((c) => (
                <button
                  key={c.id}
                  onClick={() => virar(c)}
                  className={`flex aspect-[3/4] items-center justify-center rounded-2xl border-4 p-1 font-display font-bold shadow-candy transition active:translate-y-1 ${
                    c.achada
                      ? "border-grama bg-grama/30 text-white opacity-60"
                      : c.virada
                        ? "border-sol bg-white text-tinta"
                        : "border-white/20 bg-uva text-3xl"
                  }`}
                >
                  {c.virada || c.achada ? (
                    <span className={c.ehPergunta ? "text-sm leading-tight" : "text-2xl"}>{c.texto}</span>
                  ) : (
                    "✨"
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
