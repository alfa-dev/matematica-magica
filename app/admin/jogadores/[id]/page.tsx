import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { MUNDOS, fasesDoMundo } from "@/lib/levels";
import EditForm from "./EditForm";
import DangerZone from "./DangerZone";

export default async function JogadorDetalhe({ params }: { params: { id: string } }) {
  const admin = createAdminClient();
  const userId = params.id;

  const [{ data: userData }, { data: perfil }, { data: prog }, { count: totalRespostas }, { count: acertos }, { data: diario }] =
    await Promise.all([
      admin.auth.admin.getUserById(userId),
      admin.from("profiles").select("*").eq("id", userId).maybeSingle(),
      admin.from("progress").select("*").eq("user_id", userId).maybeSingle(),
      admin.from("answer_log").select("*", { count: "exact", head: true }).eq("user_id", userId),
      admin.from("answer_log").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("correct", true),
      admin
        .from("daily_challenges")
        .select("*")
        .eq("user_id", userId)
        .order("challenge_date", { ascending: false })
        .limit(10),
    ]);

  const user = userData?.user;
  if (!user) notFound();

  const taxaAcerto = totalRespostas ? Math.round(((acertos ?? 0) / totalRespostas) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">{perfil?.display_name ?? "(sem nome)"}</h1>
        <p className="font-body text-sm text-tinta/60">{user.email}</p>
      </div>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Cartao titulo="XP total" valor={(prog?.total_xp ?? 0).toLocaleString("pt-BR")} />
        <Cartao titulo="Fase atual" valor={prog?.current_fase ?? 1} />
        <Cartao titulo="Melhor sequência" valor={prog?.best_streak ?? 0} />
        <Cartao titulo="Taxa de acerto" valor={`${taxaAcerto}%`} sub={`${totalRespostas ?? 0} respostas`} />
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-candy">
        <h2 className="mb-3 font-display text-lg font-bold">Editar progresso</h2>
        <EditForm
          userId={userId}
          displayName={perfil?.display_name ?? ""}
          currentFase={prog?.current_fase ?? 1}
          totalXp={prog?.total_xp ?? 0}
          bestStreak={prog?.best_streak ?? 0}
          totalTrainingDays={prog?.total_training_days ?? 0}
          mundos={MUNDOS.map((m) => ({ ...m, fases: fasesDoMundo(m.id) }))}
        />
      </section>

      {diario && diario.length > 0 && (
        <section className="rounded-3xl bg-white p-5 shadow-candy">
          <h2 className="mb-3 font-display text-lg font-bold">Últimos desafios do dia</h2>
          <table className="w-full text-left font-body text-sm">
            <thead>
              <tr className="border-b border-tinta/10 text-tinta/50">
                <th className="py-2 pr-3">Data</th>
                <th className="py-2 pr-3">Completo</th>
                <th className="py-2 pr-3">Pontuação</th>
                <th className="py-2">Adesivo</th>
              </tr>
            </thead>
            <tbody>
              {diario.map((d) => (
                <tr key={d.challenge_date} className="border-b border-tinta/5">
                  <td className="py-2 pr-3">{d.challenge_date}</td>
                  <td className="py-2 pr-3">{d.completed ? "✅" : "—"}</td>
                  <td className="py-2 pr-3">{d.score}</td>
                  <td className="py-2">{d.sticker_id ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <DangerZone userId={userId} />
    </div>
  );
}

function Cartao({ titulo, valor, sub }: { titulo: string; valor: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-candy">
      <p className="font-body text-xs font-bold uppercase tracking-wide text-tinta/50">{titulo}</p>
      <p className="font-display text-2xl font-bold">{valor}</p>
      {sub && <p className="font-body text-xs text-tinta/50">{sub}</p>}
    </div>
  );
}
