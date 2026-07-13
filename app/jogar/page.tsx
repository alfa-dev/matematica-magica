"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Mascot from "@/components/Mascot";
import XpBar from "@/components/XpBar";
import { MUNDOS, fasesDoMundo } from "@/lib/levels";
import { MARCOS, cosmeticoPorId } from "@/lib/xp";
import { Progresso, PROGRESSO_INICIAL, carregarProgresso, salvarProgresso } from "@/lib/progress";
import { desafioCompletoHoje } from "@/lib/daily";
import { isAdminEmail } from "@/lib/admin";

export default function Hub() {
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [souAdmin, setSouAdmin] = useState(false);
  const [prog, setProg] = useState<Progresso>(PROGRESSO_INICIAL);
  const [carregado, setCarregado] = useState(false);
  const [diarioFeito, setDiarioFeito] = useState(false);
  const [nomeTemp, setNomeTemp] = useState("");
  const [mostrarGuardaRoupa, setMostrarGuardaRoupa] = useState(false);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/");
        return;
      }
      setUserId(user.id);
      setSouAdmin(isAdminEmail(user.email));
      const p = await carregarProgresso(supabase, user.id);
      setProg(p);
      setDiarioFeito(await desafioCompletoHoje(supabase, user.id));
      setCarregado(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function salvarNome() {
    if (!userId || nomeTemp.trim().length < 2) return;
    const novo = { ...prog, displayName: nomeTemp.trim() };
    setProg(novo);
    await salvarProgresso(supabase, userId, novo);
  }

  async function equipar(hatId: string | null) {
    if (!userId) return;
    const novo = { ...prog, equippedHat: hatId };
    setProg(novo);
    setMostrarGuardaRoupa(false);
    await salvarProgresso(supabase, userId, novo);
  }

  async function sair() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (!carregado) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ceu">
        <div className="animate-bounce font-display text-2xl font-bold text-tinta">Carregando a magia... ✨</div>
      </main>
    );
  }

  const noite = diarioFeito;
  const proximoMarco = MARCOS.find((m) => m.dias > prog.totalTrainingDays);

  return (
    <main
      className={`min-h-screen p-4 pb-16 transition-colors duration-1000 ${
        noite ? "bg-gradient-to-b from-ceunoite to-[#2E3D7A] text-white" : "bg-ceu text-tinta"
      }`}
    >
      {noite && (
        <div className="pointer-events-none fixed inset-0" aria-hidden>
          {[...Array(24)].map((_, i) => (
            <div
              key={i}
              className="estrela absolute text-xs"
              style={{ left: `${(i * 37) % 100}%`, top: `${(i * 23) % 60}%`, animationDelay: `${i * 0.3}s` }}
            >
              ⭐
            </div>
          ))}
        </div>
      )}

      <div className="relative mx-auto max-w-md">
        {/* modal do nome no primeiro acesso */}
        {!prog.displayName && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-tinta/70 p-6">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center text-tinta shadow-candy">
              <Mascot humor="feliz" size={100} />
              <h2 className="font-display text-2xl font-bold">Oi! Eu sou o Pip!</h2>
              <p className="mb-3 font-body font-semibold text-tinta/70">Como você quer ser chamada na aventura?</p>
              <input
                value={nomeTemp}
                onChange={(e) => setNomeTemp(e.target.value)}
                maxLength={20}
                placeholder="Seu nome de aventureira"
                className="w-full rounded-2xl border-4 border-tinta/15 p-3 text-center font-display text-xl font-bold outline-none focus:border-sol"
              />
              <button
                onClick={salvarNome}
                disabled={nomeTemp.trim().length < 2}
                className="mt-3 w-full rounded-2xl bg-grama py-3 font-display text-xl font-bold text-white shadow-candy transition active:translate-y-1 disabled:opacity-50"
              >
                Começar!
              </button>
            </div>
          </div>
        )}

        {/* topo: mascote + status */}
        <header className="flex items-center gap-4">
          <button onClick={() => setMostrarGuardaRoupa(!mostrarGuardaRoupa)} aria-label="Trocar chapéu do Pip">
            <Mascot humor={noite ? "dormindo" : "feliz"} hat={prog.equippedHat} size={90} />
          </button>
          <div className="flex-1">
            <p className="font-display text-xl font-bold">
              {noite ? "Boa noite" : "Olá"}, {prog.displayName ?? "aventureira"}!
            </p>
            <XpBar totalXp={prog.totalXp} />
          </div>
          {souAdmin && (
            <Link href="/admin" className="font-body text-xs font-bold opacity-50" aria-label="Painel admin">
              🛠️ admin
            </Link>
          )}
          <button onClick={sair} className="font-body text-xs font-bold opacity-50" aria-label="Sair">
            sair
          </button>
        </header>

        {/* guarda-roupa de chapéus */}
        {mostrarGuardaRoupa && (
          <div className="mt-3 rounded-3xl bg-white p-4 text-tinta shadow-candy">
            <p className="mb-2 font-display font-bold">Chapéus do Pip</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => equipar(null)} className="rounded-xl border-2 border-tinta/15 px-3 py-2 text-2xl">
                🚫
              </button>
              {prog.unlockedCosmetics.map((id) => {
                const c = cosmeticoPorId(id);
                if (!c) return null;
                return (
                  <button
                    key={id}
                    onClick={() => equipar(id)}
                    className={`rounded-xl border-2 px-3 py-2 text-2xl ${prog.equippedHat === id ? "border-sol bg-sol/30" : "border-tinta/15"}`}
                    title={c.nome}
                  >
                    {c.emoji}
                  </button>
                );
              })}
              {prog.unlockedCosmetics.length === 0 && (
                <p className="font-body text-sm text-tinta/60">Suba de nível e treine todo dia pra ganhar chapéus!</p>
              )}
            </div>
          </div>
        )}

        {/* desafio do dia */}
        <section className="mt-5">
          {diarioFeito ? (
            <div className="rounded-3xl bg-white/15 p-5 text-center backdrop-blur">
              <p className="font-display text-2xl font-bold">✅ Missão do dia completa!</p>
              <p className="font-body font-semibold opacity-80">
                O Pip já foi dormir. Amanhã tem desafio novo! Você ainda pode explorar a trilha ou o fliperama. 💤
              </p>
            </div>
          ) : (
            <Link
              href="/jogar/desafio"
              className="block rounded-3xl bg-sol p-5 text-center text-tinta shadow-candy transition active:translate-y-1 active:shadow-candyPressed"
            >
              <p className="font-display text-2xl font-bold">🎁 Desafio do Dia!</p>
              <p className="font-body font-bold text-tinta/70">10 continhas rápidas · ganhe um adesivo novo</p>
            </Link>
          )}
        </section>

        {/* marcos de treino */}
        {proximoMarco && (
          <div className="mt-3 flex items-center justify-between rounded-2xl bg-white/60 px-4 py-2 text-tinta backdrop-blur">
            <span className="font-body text-sm font-bold">
              🗓️ {prog.totalTrainingDays} {prog.totalTrainingDays === 1 ? "dia" : "dias"} de treino
            </span>
            <span className="font-body text-sm font-bold text-uva">
              Faltam {proximoMarco.dias - prog.totalTrainingDays} pro brinde misterioso! 🎁
            </span>
          </div>
        )}

        {/* mapa dos mundos */}
        <section className="mt-6 space-y-5">
          {MUNDOS.map((mundo) => {
            const fases = fasesDoMundo(mundo.id);
            const mundoDesbloqueado = fases.some((f) => f.id <= prog.currentFase);
            return (
              <div
                key={mundo.id}
                className={`rounded-3xl bg-white p-4 text-tinta shadow-candy ${mundoDesbloqueado ? "" : "opacity-50"}`}
              >
                <h3 className="font-display text-lg font-bold">
                  {mundo.emoji} Mundo {mundo.id}: {mundo.nome}
                </h3>
                <div className="mt-3 flex flex-wrap gap-3">
                  {fases.map((fase) => {
                    const feita = fase.id < prog.currentFase;
                    const atual = fase.id === prog.currentFase;
                    const bloqueada = fase.id > prog.currentFase;
                    return (
                      <Link
                        key={fase.id}
                        href={bloqueada ? "#" : `/jogar/nivel/${fase.id}`}
                        aria-disabled={bloqueada}
                        onClick={(e) => bloqueada && e.preventDefault()}
                        className={`flex h-16 w-16 flex-col items-center justify-center rounded-2xl border-4 font-display font-bold shadow-candy transition active:translate-y-1 ${
                          feita
                            ? "border-grama bg-grama text-white"
                            : atual
                              ? "animate-pulse border-sol bg-sol text-tinta"
                              : "border-tinta/10 bg-ceu text-tinta/40"
                        }`}
                        title={`${fase.nome}: ${fase.descricao}`}
                      >
                        <span className="text-xl">{feita ? "⭐" : bloqueada ? "🔒" : fase.id}</span>
                        <span className="text-[10px] leading-none">{feita ? "feita!" : atual ? "jogar" : ""}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>

        {/* atalhos */}
        <nav className="mt-6 grid grid-cols-2 gap-4">
          <Link
            href="/jogar/fliperama"
            className="rounded-3xl bg-uva p-4 text-center font-display text-lg font-bold text-white shadow-candy transition active:translate-y-1"
          >
            🕹️ Fliperama
          </Link>
          <Link
            href="/jogar/calendario"
            className="rounded-3xl bg-coral p-4 text-center font-display text-lg font-bold text-white shadow-candy transition active:translate-y-1"
          >
            📅 Meus Adesivos
          </Link>
        </nav>
      </div>
    </main>
  );
}
