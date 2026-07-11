"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MINIGAMES } from "@/lib/minigames";
import { carregarProgresso } from "@/lib/progress";
import { xpArcadeHoje } from "@/lib/progress";
import { XP_TETO_DIARIO_MINIGAMES } from "@/lib/xp";

export default function FliperamaPage() {
  const router = useRouter();
  const supabase = createClient();
  const [faseAtual, setFaseAtual] = useState(1);
  const [carregado, setCarregado] = useState(false);
  const [xpHoje, setXpHoje] = useState(0);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.replace("/");
      const p = await carregarProgresso(supabase, user.id);
      setFaseAtual(p.currentFase);
      setXpHoje(xpArcadeHoje());
      setCarregado(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!carregado) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ceunoite">
        <div className="animate-bounce font-display text-2xl font-bold text-white">Ligando o fliperama... 🕹️</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ceunoite p-4 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/jogar" className="font-display font-bold text-white/60">
            ← mapa
          </Link>
          <h1 className="font-display text-2xl font-bold">🕹️ Fliperama</h1>
          <span />
        </div>

        <p className="mb-4 rounded-2xl bg-white/10 p-3 text-center font-body text-sm font-bold">
          XP de fliperama hoje: {Math.min(xpHoje, XP_TETO_DIARIO_MINIGAMES)}/{XP_TETO_DIARIO_MINIGAMES}
          {xpHoje >= XP_TETO_DIARIO_MINIGAMES && " · você ainda pode jogar por diversão! 🎉"}
        </p>

        <div className="space-y-4">
          {MINIGAMES.map((m) => {
            const desbloqueado = faseAtual > m.desbloqueiaAposFase;
            const jogavel = desbloqueado && m.disponivel;
            return (
              <Link
                key={m.id}
                href={jogavel ? m.rota : "#"}
                onClick={(e) => !jogavel && e.preventDefault()}
                className={`block rounded-3xl border-4 p-5 transition ${
                  jogavel
                    ? "border-sol bg-white/10 shadow-candy active:translate-y-1"
                    : "border-white/10 bg-white/5 opacity-60"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{jogavel ? m.emoji : "🔒"}</span>
                  <div>
                    <p className="font-display text-xl font-bold">{m.nome}</p>
                    <p className="font-body text-sm font-semibold text-white/70">
                      {!desbloqueado
                        ? `Complete a fase ${m.desbloqueiaAposFase} pra desbloquear!`
                        : !m.disponivel
                          ? "Em breve! 🚧"
                          : m.descricao}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
