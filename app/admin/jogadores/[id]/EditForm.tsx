"use client";
import { useTransition } from "react";
import { atualizarJogador } from "@/app/admin/actions";
import type { Fase, Mundo } from "@/lib/levels";

interface Props {
  userId: string;
  displayName: string;
  currentFase: number;
  totalXp: number;
  bestStreak: number;
  totalTrainingDays: number;
  mundos: (Mundo & { fases: Fase[] })[];
}

export default function EditForm({ userId, displayName, currentFase, totalXp, bestStreak, totalTrainingDays, mundos }: Props) {
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      await atualizarJogador(userId, formData);
    });
  }

  return (
    <form action={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1">
        <span className="font-body text-xs font-bold text-tinta/60">Nome de aventureira</span>
        <input
          name="displayName"
          defaultValue={displayName}
          maxLength={20}
          className="rounded-xl border-2 border-tinta/15 p-2 font-body font-semibold outline-none focus:border-sol"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-body text-xs font-bold text-tinta/60">Fase atual</span>
        <select
          name="currentFase"
          defaultValue={currentFase}
          className="rounded-xl border-2 border-tinta/15 p-2 font-body font-semibold outline-none focus:border-sol"
        >
          {mundos.map((mundo) => (
            <optgroup key={mundo.id} label={`${mundo.emoji} Mundo ${mundo.id}: ${mundo.nome}`}>
              {mundo.fases.map((fase) => (
                <option key={fase.id} value={fase.id}>
                  {fase.id} · {fase.nome}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-body text-xs font-bold text-tinta/60">XP total</span>
        <input
          type="number"
          name="totalXp"
          min={0}
          defaultValue={totalXp}
          className="rounded-xl border-2 border-tinta/15 p-2 font-body font-semibold outline-none focus:border-sol"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-body text-xs font-bold text-tinta/60">Melhor sequência (dias)</span>
        <input
          type="number"
          name="bestStreak"
          min={0}
          defaultValue={bestStreak}
          className="rounded-xl border-2 border-tinta/15 p-2 font-body font-semibold outline-none focus:border-sol"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-body text-xs font-bold text-tinta/60">Dias de treino</span>
        <input
          type="number"
          name="totalTrainingDays"
          min={0}
          defaultValue={totalTrainingDays}
          className="rounded-xl border-2 border-tinta/15 p-2 font-body font-semibold outline-none focus:border-sol"
        />
      </label>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-2xl bg-grama px-6 py-3 font-display font-bold text-white shadow-candy transition active:translate-y-1 disabled:opacity-60"
        >
          {isPending ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
