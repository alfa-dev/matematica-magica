"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { diasDoMes, DiaCalendario } from "@/lib/daily";
import { MARCOS } from "@/lib/xp";
import { carregarProgresso } from "@/lib/progress";

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

export default function CalendarioPage() {
  const router = useRouter();
  const supabase = createClient();
  const hoje = new Date();
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth() + 1); // 1-12
  const [dias, setDias] = useState<DiaCalendario[]>([]);
  const [totalDias, setTotalDias] = useState(0);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.replace("/");
      setDias(await diasDoMes(supabase, user.id, ano, mes));
      const p = await carregarProgresso(supabase, user.id);
      setTotalDias(p.totalTrainingDays);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ano, mes]);

  function mudarMes(delta: number) {
    let m = mes + delta;
    let a = ano;
    if (m < 1) {
      m = 12;
      a--;
    }
    if (m > 12) {
      m = 1;
      a++;
    }
    setMes(m);
    setAno(a);
  }

  const primeiroDiaSemana = new Date(ano, mes - 1, 1).getDay();
  const diasNoMes = new Date(ano, mes, 0).getDate();
  const stickerPorDia = new Map(dias.map((d) => [parseInt(d.date.slice(8), 10), d.sticker]));
  const proximoMarco = MARCOS.find((m) => m.dias > totalDias);

  return (
    <main className="min-h-screen bg-ceu p-4">
      <div className="mx-auto max-w-md">
        <div className="mb-3 flex items-center justify-between">
          <Link href="/jogar" className="font-display font-bold text-tinta/60">
            ← mapa
          </Link>
          <h1 className="font-display text-lg font-bold text-tinta">📅 Meus Adesivos</h1>
          <span />
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-candy">
          <div className="mb-3 flex items-center justify-between">
            <button onClick={() => mudarMes(-1)} className="rounded-xl bg-ceu px-3 py-1 font-display text-xl font-bold">
              ←
            </button>
            <span className="font-display text-xl font-bold text-tinta">
              {MESES[mes - 1]} {ano}
            </span>
            <button onClick={() => mudarMes(1)} className="rounded-xl bg-ceu px-3 py-1 font-display text-xl font-bold">
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {SEMANA.map((d, i) => (
              <div key={i} className="font-body text-xs font-bold text-tinta/50">
                {d}
              </div>
            ))}
            {Array.from({ length: primeiroDiaSemana }).map((_, i) => (
              <div key={`v${i}`} />
            ))}
            {Array.from({ length: diasNoMes }).map((_, i) => {
              const dia = i + 1;
              const sticker = stickerPorDia.get(dia);
              const ehHoje = ano === hoje.getFullYear() && mes === hoje.getMonth() + 1 && dia === hoje.getDate();
              return (
                <div
                  key={dia}
                  className={`flex aspect-square flex-col items-center justify-center rounded-xl ${
                    sticker ? "bg-sol/40" : "bg-ceu"
                  } ${ehHoje ? "ring-2 ring-coral" : ""}`}
                >
                  <span className="font-body text-[10px] font-bold text-tinta/50">{dia}</span>
                  <span className="text-xl leading-none">{sticker ?? ""}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* trilha de marcos */}
        <div className="mt-4 rounded-3xl bg-white p-4 shadow-candy">
          <p className="font-display font-bold text-tinta">🗓️ {totalDias} dias de treino</p>
          <div className="mt-2 space-y-2">
            {MARCOS.map((m) => {
              const feito = totalDias >= m.dias;
              const proximo = proximoMarco?.dias === m.dias;
              return (
                <div
                  key={m.dias}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 font-body font-bold ${
                    feito ? "bg-grama/20 text-tinta" : proximo ? "bg-sol/30 text-tinta" : "bg-ceu text-tinta/40"
                  }`}
                >
                  <span>
                    {m.dias} dias {feito && "✅"}
                  </span>
                  <span className="text-lg">{feito || proximo ? m.cosmetico.emoji : "❓"} {feito ? m.cosmetico.nome : proximo ? "quase lá!" : "mistério"}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
