"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdminEmail(user?.email)) {
    throw new Error("Não autorizado");
  }
}

export async function atualizarJogador(userId: string, formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const displayName = String(formData.get("displayName") ?? "").trim();
  const currentFase = Number(formData.get("currentFase"));
  const totalXp = Number(formData.get("totalXp"));
  const bestStreak = Number(formData.get("bestStreak"));
  const totalTrainingDays = Number(formData.get("totalTrainingDays"));

  await Promise.all([
    admin
      .from("progress")
      .update({
        current_fase: currentFase,
        total_xp: totalXp,
        best_streak: bestStreak,
        total_training_days: totalTrainingDays,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId),
    admin.from("profiles").update({ display_name: displayName || null }).eq("id", userId),
  ]);

  revalidatePath(`/admin/jogadores/${userId}`);
  revalidatePath("/admin");
}

export async function resetarProgresso(userId: string) {
  await requireAdmin();
  const admin = createAdminClient();

  await admin
    .from("progress")
    .update({
      current_fase: 1,
      total_xp: 0,
      unlocked_cosmetics: [],
      best_streak: 0,
      total_training_days: 0,
      claimed_milestones: [],
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  revalidatePath(`/admin/jogadores/${userId}`);
  revalidatePath("/admin");
}

export async function excluirJogador(userId: string) {
  await requireAdmin();
  const admin = createAdminClient();

  // apaga a conta de auth; as tabelas (profiles, progress, daily_challenges,
  // answer_log) têm "on delete cascade" e somem junto.
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw error;

  revalidatePath("/admin");
  redirect("/admin");
}
