import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getFase } from "@/lib/levels";

function hojeLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function AdminDashboard() {
  const admin = createAdminClient();

  const [{ data: usersList }, { data: profiles }, { data: progress }, { data: dailyHoje }, { count: totalRespostas }, { count: acertos }] =
    await Promise.all([
      admin.auth.admin.listUsers({ perPage: 1000 }),
      admin.from("profiles").select("*"),
      admin.from("progress").select("*"),
      admin.from("daily_challenges").select("user_id").eq("challenge_date", hojeLocal()).eq("completed", true),
      admin.from("answer_log").select("*", { count: "exact", head: true }),
      admin.from("answer_log").select("*", { count: "exact", head: true }).eq("correct", true),
    ]);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const progressMap = new Map((progress ?? []).map((p) => [p.user_id, p]));
  const dailySet = new Set((dailyHoje ?? []).map((d) => d.user_id));

  const jogadores = (usersList?.users ?? [])
    .map((u) => {
      const perfil = profileMap.get(u.id);
      const prog = progressMap.get(u.id);
      return {
        id: u.id,
        email: u.email ?? "—",
        nome: perfil?.display_name ?? "(sem nome)",
        fase: prog?.current_fase ?? 1,
        xp: prog?.total_xp ?? 0,
        streak: prog?.best_streak ?? 0,
        diasTreino: prog?.total_training_days ?? 0,
        fezHoje: dailySet.has(u.id),
        criadoEm: u.created_at,
      };
    })
    .sort((a, b) => b.xp - a.xp);

  const totalXp = jogadores.reduce((soma, j) => soma + j.xp, 0);
  const taxaAcerto = totalRespostas ? Math.round(((acertos ?? 0) / totalRespostas) * 100) : 0;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Visão geral</h1>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Cartao titulo="Jogadores" valor={jogadores.length} />
        <Cartao titulo="XP total" valor={totalXp.toLocaleString("pt-BR")} />
        <Cartao titulo="Missões hoje" valor={`${dailySet.size}/${jogadores.length}`} />
        <Cartao titulo="Taxa de acerto" valor={`${taxaAcerto}%`} sub={`${totalRespostas ?? 0} respostas`} />
      </section>

      <section className="rounded-3xl bg-white p-4 shadow-candy">
        <h2 className="mb-3 font-display text-lg font-bold">Jogadores</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left font-body text-sm">
            <thead>
              <tr className="border-b border-tinta/10 text-tinta/50">
                <th className="py-2 pr-3">Nome</th>
                <th className="py-2 pr-3">E-mail</th>
                <th className="py-2 pr-3">Fase</th>
                <th className="py-2 pr-3">XP</th>
                <th className="py-2 pr-3">Sequência</th>
                <th className="py-2 pr-3">Dias treino</th>
                <th className="py-2 pr-3">Hoje</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {jogadores.map((j) => (
                <tr key={j.id} className="border-b border-tinta/5">
                  <td className="py-2 pr-3 font-semibold">{j.nome}</td>
                  <td className="py-2 pr-3 text-tinta/70">{j.email}</td>
                  <td className="py-2 pr-3">
                    {j.fase} · {getFase(j.fase).nome}
                  </td>
                  <td className="py-2 pr-3">{j.xp.toLocaleString("pt-BR")}</td>
                  <td className="py-2 pr-3">{j.streak}</td>
                  <td className="py-2 pr-3">{j.diasTreino}</td>
                  <td className="py-2 pr-3">{j.fezHoje ? "✅" : "—"}</td>
                  <td className="py-2">
                    <Link href={`/admin/jogadores/${j.id}`} className="font-bold text-uva hover:underline">
                      gerenciar
                    </Link>
                  </td>
                </tr>
              ))}
              {jogadores.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-tinta/50">
                    Nenhum jogador ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
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
