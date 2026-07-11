"use client";
import { useEffect, useRef, useState } from "react";
import { generateQuestion, Question } from "@/lib/questionGenerator";
import { playPew, playBoom, playWrong, playClick } from "@/lib/audio";

interface Inimigo {
  id: number;
  x: number; // 5..75 (%)
  y: number; // 0..100 (% da área)
  vel: number; // % por segundo
  q: Question;
  dourado: boolean;
  explodindo: boolean;
}

const EMOJIS_INIMIGOS = ["👾", "🛸", "🤖", "👻", "🦠"];

export default function MathAttack({
  faseMax,
  onResposta,
  onFim,
}: {
  faseMax: number; // maior fase desbloqueada: limita as contas
  onResposta: (q: Question, correct: boolean) => void;
  onFim: (r: { pontos: number; abatidos: number; onda: number }) => void;
}) {
  const [, setTick] = useState(0);
  const [vidas, setVidas] = useState(3);
  const [pontos, setPontos] = useState(0);
  const [abatidos, setAbatidos] = useState(0);
  const [onda, setOnda] = useState(1);
  const [tranquilo, setTranquilo] = useState(false);
  const [tremendo, setTremendo] = useState(false);
  const [fim, setFim] = useState(false);

  const inimigos = useRef<Inimigo[]>([]);
  const proxId = useRef(1);
  const spawnados = useRef(0);
  const ultimoSpawn = useRef(0);
  const rodando = useRef(true);
  const stats = useRef({ pontos: 0, abatidos: 0, onda: 1, vidas: 3 });

  function faseSorteada(): number {
    // sorteia entre as fases já desbloqueadas (pesa pras mais recentes)
    const f = Math.random() < 0.5 ? faseMax : 1 + Math.floor(Math.random() * faseMax);
    return Math.max(1, Math.min(16, f));
  }

  function spawn() {
    spawnados.current++;
    const dourado = spawnados.current % 10 === 0;
    const fase = dourado ? Math.min(16, faseMax + 1) : faseSorteada();
    const velocidadeBase = 3.5 + stats.current.onda * 1.2;
    inimigos.current.push({
      id: proxId.current++,
      x: 8 + Math.random() * 64,
      y: -8,
      vel: (dourado ? velocidadeBase * 1.15 : velocidadeBase) * (tranquilo ? 0.5 : 1),
      q: generateQuestion(fase),
      dourado,
      explodindo: false,
    });
  }

  useEffect(() => {
    let raf: number;
    let prev = performance.now();
    rodando.current = true;

    function loop(now: number) {
      if (!rodando.current) return;
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;

      // spawn: mantém até 3 na tela, intervalo diminui com a onda
      const intervalo = Math.max(1.4, 3.2 - stats.current.onda * 0.25) * (tranquilo ? 1.6 : 1);
      ultimoSpawn.current += dt;
      if (inimigos.current.filter((i) => !i.explodindo).length < 3 && ultimoSpawn.current > intervalo) {
        ultimoSpawn.current = 0;
        spawn();
      }

      // movimento
      for (const ini of inimigos.current) {
        if (ini.explodindo) continue;
        ini.y += ini.vel * dt;
        if (ini.y >= 88) {
          // mordeu um coração; a conta volta lá pra cima
          ini.y = -8;
          ini.x = 8 + Math.random() * 64;
          if (!ini.dourado) {
            stats.current.vidas--;
            setVidas(stats.current.vidas);
            playWrong();
            if (stats.current.vidas <= 0) {
              rodando.current = false;
              setFim(true);
              return;
            }
          }
        }
      }
      setTick((t) => t + 1);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => {
      rodando.current = false;
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tranquilo]);

  useEffect(() => {
    if (fim) onFim(stats.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fim]);

  const vivos = inimigos.current.filter((i) => !i.explodindo);
  const ativo = vivos.length ? vivos.reduce((a, b) => (a.y > b.y ? a : b)) : null;

  function atirar(valor: number) {
    if (!ativo || fim) return;
    playClick();
    const ok = valor === ativo.q.answer;
    onResposta(ativo.q, ok);
    if (ok) {
      playPew();
      ativo.explodindo = true;
      setTimeout(() => {
        inimigos.current = inimigos.current.filter((i) => i.id !== ativo.id);
      }, 300);
      playBoom();
      const ganho = ativo.dourado ? 30 : 10;
      stats.current.pontos += ganho;
      stats.current.abatidos++;
      setPontos(stats.current.pontos);
      setAbatidos(stats.current.abatidos);
      if (stats.current.abatidos % 8 === 0) {
        stats.current.onda++;
        setOnda(stats.current.onda);
      }
    } else {
      // sem perder vida: só uma tremidinha e o inimigo acelera um tiquinho
      playWrong();
      setTremendo(true);
      setTimeout(() => setTremendo(false), 350);
      ativo.vel *= 1.1;
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col">
      {/* HUD */}
      <div className="mb-2 flex items-center justify-between font-display font-bold text-white">
        <span>{"❤️".repeat(Math.max(0, vidas))}{"🖤".repeat(Math.max(0, 3 - vidas))}</span>
        <span>Onda {onda}</span>
        <span>⭐ {pontos}</span>
      </div>

      {/* céu */}
      <div className={`relative h-[50vh] min-h-[320px] overflow-hidden rounded-3xl border-4 border-white/20 bg-gradient-to-b from-[#12183B] to-[#2E3D7A] ${tremendo ? "treme" : ""}`}>
        {inimigos.current.map((ini) => (
          <div
            key={ini.id}
            className="absolute flex -translate-x-1/2 flex-col items-center transition-transform"
            style={{ left: `${ini.x}%`, top: `${ini.y}%` }}
          >
            {ini.explodindo ? (
              <span className="text-4xl">💥</span>
            ) : (
              <>
                <span
                  className={`rounded-xl px-2 py-0.5 font-display text-lg font-bold ${
                    ativo?.id === ini.id ? "bg-sol text-tinta ring-4 ring-white" : "bg-white/20 text-white/80"
                  } ${ini.dourado ? "ring-4 ring-yellow-300" : ""}`}
                >
                  {ini.q.text}
                </span>
                <span className={`${ativo?.id === ini.id ? "text-4xl" : "text-2xl opacity-70"}`}>
                  {ini.dourado ? "👑" : EMOJIS_INIMIGOS[ini.id % EMOJIS_INIMIGOS.length]}
                </span>
              </>
            )}
          </div>
        ))}
        {/* canhão */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-3xl">🛡️</div>
        {ativo?.dourado && (
          <div className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-yellow-300 px-3 py-1 font-display text-xs font-bold text-tinta">
            👑 INIMIGO DOURADO: vale 3x! Errar não perde vida!
          </div>
        )}
      </div>

      {/* botões de resposta */}
      <div className="mt-3 grid grid-cols-4 gap-2">
        {(ativo?.q.choices ?? []).map((c) => (
          <button
            key={`${ativo?.id}-${c}`}
            onClick={() => atirar(c)}
            className="rounded-2xl bg-white py-4 font-display text-2xl font-bold text-tinta shadow-candy transition active:translate-y-1 active:shadow-candyPressed"
          >
            {c}
          </button>
        ))}
      </div>

      <label className="mt-3 flex items-center justify-center gap-2 font-body text-sm font-bold text-white/70">
        <input type="checkbox" checked={tranquilo} onChange={(e) => setTranquilo(e.target.checked)} className="h-4 w-4" />
        Modo tranquilo (mais devagar)
      </label>
    </div>
  );
}
