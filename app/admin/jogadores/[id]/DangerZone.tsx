"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resetarProgresso, excluirJogador } from "@/app/admin/actions";

export default function DangerZone({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirmText, setConfirmText] = useState("");
  const router = useRouter();

  function onReset() {
    if (!confirm("Zerar todo o progresso desta criança (fase, XP, adesivos e sequência)? Não dá pra desfazer.")) return;
    startTransition(async () => {
      await resetarProgresso(userId);
      router.refresh();
    });
  }

  function onDelete() {
    startTransition(async () => {
      await excluirJogador(userId);
    });
  }

  return (
    <section className="rounded-3xl border-2 border-coral/40 bg-coral/5 p-5">
      <h2 className="mb-1 font-display text-lg font-bold text-coral">Zona de perigo</h2>
      <p className="mb-4 font-body text-sm text-tinta/60">Estas ações não podem ser desfeitas.</p>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <button
          onClick={onReset}
          disabled={isPending}
          className="rounded-2xl bg-white px-5 py-3 font-display font-bold text-tinta shadow-candy transition active:translate-y-1 disabled:opacity-60"
        >
          Zerar progresso
        </button>

        <div className="flex flex-col gap-2">
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder='Digite "excluir" para confirmar'
            className="rounded-xl border-2 border-coral/30 p-2 font-body text-sm outline-none focus:border-coral"
          />
          <button
            onClick={onDelete}
            disabled={isPending || confirmText.trim().toLowerCase() !== "excluir"}
            className="rounded-2xl bg-coral px-5 py-3 font-display font-bold text-white shadow-candy transition active:translate-y-1 disabled:opacity-40"
          >
            Excluir conta permanentemente
          </button>
        </div>
      </div>
    </section>
  );
}
