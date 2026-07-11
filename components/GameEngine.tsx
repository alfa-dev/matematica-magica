"use client";
import { useMemo, useRef, useState } from "react";
import QuestionCard from "./QuestionCard";
import Mascot, { Humor } from "./Mascot";
import LevelUpCelebration from "./LevelUpCelebration";
import { Question, generateQuestion, generateSession } from "@/lib/questionGenerator";
import { nivelDoXp, XP_ACERTO, XP_BONUS_STREAK } from "@/lib/xp";
import { playStreak } from "@/lib/audio";

export interface ResultadoSessao {
  acertos: number;
  total: number;
  xpGanho: number;
  melhorStreak: number;
}

// Motor de sessão: usado pela trilha e pelo desafio do dia.
export default function GameEngine({
  faseId,
  questoesFixas, // se fornecido (desafio do dia), usa essas em vez de gerar
  totalXpInicial,
  hat,
  xpPorAcerto = XP_ACERTO,
  onXp, // chamado a cada ganho de XP (para persistir incrementalmente)
  onResposta, // log de resposta
  onFim,
}: {
  faseId: number;
  questoesFixas?: Question[];
  totalXpInicial: number;
  hat: string | null;
  xpPorAcerto?: number;
  onXp?: (novoTotalXp: number) => void;
  onResposta?: (q: Question, correct: boolean) => void;
  onFim: (r: ResultadoSessao) => void;
}) {
  const inicial = useMemo(
    () => questoesFixas ?? generateSession(faseId, 10),
    [faseId, questoesFixas]
  );
  const [fila, setFila] = useState<Question[]>(inicial);
  const [idx, setIdx] = useState(0);
  const total = inicial.length;

  const [respondidas, setRespondidas] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [streak, setStreak] = useState(0);
  const [melhorStreak, setMelhorStreak] = useState(0);
  const [errosSeguidos, setErrosSeguidos] = useState(0);
  const [xpGanho, setXpGanho] = useState(0);
  const [totalXp, setTotalXp] = useState(totalXpInicial);
  const [levelUpPara, setLevelUpPara] = useState<number | null>(null);
  const [humor, setHumor] = useState<Humor>("feliz");
  const fimRef = useRef(false);

  const questaoAtual = fila[idx];

  function responder(correct: boolean) {
    const q = questaoAtual;
    onResposta?.(q, correct);
    const novasRespondidas = respondidas + 1;
    setRespondidas(novasRespondidas);

    let novaFila = fila;
    let ganhou = 0;

    if (correct) {
      const novaStreak = streak + 1;
      setStreak(novaStreak);
      setMelhorStreak((m) => Math.max(m, novaStreak));
      setErrosSeguidos(0);
      setHumor("comemorando");
      ganhou = xpPorAcerto + ((XP_BONUS_STREAK as any)[novaStreak] ?? 0);
      if ((XP_BONUS_STREAK as any)[novaStreak]) playStreak();
      setAcertos((a) => a + 1);
    } else {
      setStreak(0);
      const novosErros = errosSeguidos + 1;
      setErrosSeguidos(novosErros);
      setHumor("pensando");
      // a questão errada volta disfarçada 3 posições depois (repetição espaçada)
      const reinsercao = Math.min(idx + 4, novaFila.length);
      novaFila = [...novaFila.slice(0, reinsercao), q, ...novaFila.slice(reinsercao)];
      // dificuldade adaptativa: 3 erros seguidos injetam silenciosamente
      // uma questão mais fácil da fase anterior pra recuperar a confiança
      if (novosErros >= 3 && faseId > 1) {
        const facil = generateQuestion(faseId - 1);
        novaFila = [...novaFila.slice(0, idx + 1), facil, ...novaFila.slice(idx + 1)];
        setErrosSeguidos(0);
      }
      setFila(novaFila);
    }

    if (ganhou > 0) {
      const nivelAntes = nivelDoXp(totalXp).nivel;
      const novoTotal = totalXp + ganhou;
      const nivelDepois = nivelDoXp(novoTotal).nivel;
      setTotalXp(novoTotal);
      setXpGanho((x) => x + ganhou);
      onXp?.(novoTotal);
      if (nivelDepois > nivelAntes) setLevelUpPara(nivelDepois);
    }

    // fim: quando respondeu "total" questões originais (repetidas não contam pro placar)
    if (novasRespondidas >= total) {
      if (!fimRef.current) {
        fimRef.current = true;
        setTimeout(
          () =>
            onFim({
              acertos: correct ? acertos + 1 : acertos,
              total,
              xpGanho: xpGanho + ganhou,
              melhorStreak: Math.max(melhorStreak, correct ? streak + 1 : 0),
            }),
          400
        );
      }
      return;
    }
    setIdx((i) => i + 1);
    setTimeout(() => setHumor("feliz"), 1500);
  }

  if (!questaoAtual) return null;

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {levelUpPara && (
        <LevelUpCelebration nivel={levelUpPara} hat={hat} onClose={() => setLevelUpPara(null)} />
      )}

      <div className="flex w-full max-w-md items-center justify-between">
        <div className="font-display text-lg font-bold text-tinta">
          {Math.min(respondidas + 1, total)} / {total}
        </div>
        {streak >= 3 && (
          <div className="animate-pulse rounded-full bg-sol px-3 py-1 font-display font-bold text-tinta">
            🔥 {streak} seguidas!
          </div>
        )}
        <div className="font-display text-lg font-bold text-uva">+{xpGanho} XP</div>
      </div>

      {/* barra de progresso da sessão */}
      <div className="h-3 w-full max-w-md overflow-hidden rounded-full bg-white/70">
        <div
          className="h-full rounded-full bg-grama transition-all duration-500"
          style={{ width: `${(respondidas / total) * 100}%` }}
        />
      </div>

      <div className="flex w-full max-w-md items-start gap-3">
        <div className="hidden sm:block">
          <Mascot humor={humor} hat={hat} size={90} />
        </div>
        <div className="flex-1">
          <QuestionCard question={questaoAtual} onAnswer={responder} />
        </div>
      </div>
    </div>
  );
}
