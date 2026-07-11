"use client";
import { useEffect, useState } from "react";
import { Question } from "@/lib/questionGenerator";
import { playClick, playCorrect, playWrong } from "@/lib/audio";

export default function QuestionCard({
  question,
  onAnswer,
}: {
  question: Question;
  onAnswer: (correct: boolean) => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [state, setState] = useState<"idle" | "certo" | "errado">("idle");

  useEffect(() => {
    setPicked(null);
    setState("idle");
  }, [question]);

  function escolher(v: number) {
    if (state !== "idle") return;
    playClick();
    setPicked(v);
    const ok = v === question.answer;
    setState(ok ? "certo" : "errado");
    if (ok) playCorrect();
    else playWrong();
    setTimeout(() => onAnswer(ok), ok ? 900 : 2600);
  }

  return (
    <div className="w-full max-w-md">
      <div
        className={`rounded-3xl border-4 bg-white p-6 text-center shadow-candy transition ${
          state === "certo" ? "border-grama" : state === "errado" ? "border-coral treme" : "border-tinta/10"
        }`}
      >
        {question.visual && (
          <div className="mb-3 whitespace-pre-wrap font-body text-3xl leading-relaxed">{question.visual}</div>
        )}
        <div className="font-display text-6xl font-bold text-tinta">{question.text} = ?</div>
        {state === "errado" && (
          <div className="mt-4 rounded-2xl bg-ceu p-3 font-body font-bold text-tinta">
            <p>
              Quase! A resposta era <span className="text-xl text-uva">{question.answer}</span>.
            </p>
            {question.hint && <p className="mt-1 text-sm font-semibold text-tinta/70">💡 {question.hint}</p>}
          </div>
        )}
        {state === "certo" && (
          <div className="mt-4 font-display text-2xl font-bold text-grama">Isso aí! 🎯</div>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        {question.choices.map((c) => {
          const isPicked = picked === c;
          const isAnswer = c === question.answer;
          let cls = "bg-white text-tinta border-tinta/15";
          if (state !== "idle" && isAnswer) cls = "bg-grama text-white border-grama";
          else if (state === "errado" && isPicked) cls = "bg-coral text-white border-coral";
          return (
            <button
              key={c}
              onClick={() => escolher(c)}
              disabled={state !== "idle"}
              className={`rounded-2xl border-4 py-6 font-display text-4xl font-bold shadow-candy transition active:translate-y-1 active:shadow-candyPressed ${cls}`}
            >
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}
