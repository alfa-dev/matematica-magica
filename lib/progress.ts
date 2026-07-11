"use client";
import { SupabaseClient } from "@supabase/supabase-js";

export interface Progresso {
  currentFase: number; // maior fase desbloqueada
  totalXp: number;
  unlockedCosmetics: string[];
  bestStreak: number;
  totalTrainingDays: number;
  claimedMilestones: number[];
  displayName: string | null;
  equippedHat: string | null;
}

export const PROGRESSO_INICIAL: Progresso = {
  currentFase: 1,
  totalXp: 0,
  unlockedCosmetics: [],
  bestStreak: 0,
  totalTrainingDays: 0,
  claimedMilestones: [],
  displayName: null,
  equippedHat: null,
};

const LS_KEY = "mm_progresso";

// Data local (fuso do aparelho), formato YYYY-MM-DD. Nunca UTC!
export function hojeLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function lerLocal(): Progresso | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? { ...PROGRESSO_INICIAL, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

export function salvarLocal(p: Progresso) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(p));
  } catch {}
}

export async function carregarProgresso(supabase: SupabaseClient, userId: string): Promise<Progresso> {
  const local = lerLocal();
  try {
    const [{ data: prog }, { data: prof }] = await Promise.all([
      supabase.from("progress").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    ]);
    if (!prog && !prof && local) return local; // offline recém-migrado
    const p: Progresso = {
      currentFase: prog?.current_fase ?? local?.currentFase ?? 1,
      totalXp: Math.max(prog?.total_xp ?? 0, local?.totalXp ?? 0),
      unlockedCosmetics: prog?.unlocked_cosmetics ?? local?.unlockedCosmetics ?? [],
      bestStreak: Math.max(prog?.best_streak ?? 0, local?.bestStreak ?? 0),
      totalTrainingDays: prog?.total_training_days ?? local?.totalTrainingDays ?? 0,
      claimedMilestones: prog?.claimed_milestones ?? local?.claimedMilestones ?? [],
      displayName: prof?.display_name ?? local?.displayName ?? null,
      equippedHat: prof?.avatar_config?.hat ?? local?.equippedHat ?? null,
    };
    salvarLocal(p);
    return p;
  } catch {
    return local ?? PROGRESSO_INICIAL;
  }
}

export async function salvarProgresso(supabase: SupabaseClient, userId: string, p: Progresso) {
  salvarLocal(p);
  try {
    await Promise.all([
      supabase.from("progress").upsert({
        user_id: userId,
        current_fase: p.currentFase,
        total_xp: p.totalXp,
        unlocked_cosmetics: p.unlockedCosmetics,
        best_streak: p.bestStreak,
        total_training_days: p.totalTrainingDays,
        claimed_milestones: p.claimedMilestones,
        updated_at: new Date().toISOString(),
      }),
      supabase.from("profiles").upsert({
        id: userId,
        display_name: p.displayName,
        avatar_config: { hat: p.equippedHat },
      }),
    ]);
  } catch {
    // offline: fica no localStorage e sincroniza na próxima
  }
}

export function logResposta(
  supabase: SupabaseClient,
  userId: string,
  fase: number,
  question: string,
  correct: boolean,
  source: string
) {
  // fire and forget
  supabase
    .from("answer_log")
    .insert({ user_id: userId, fase, question, correct, source })
    .then(() => {});
}

// ---- Teto diário de XP dos minigames (guardado localmente) ----
const LS_ARCADE = "mm_arcade_xp";

export function xpArcadeHoje(): number {
  try {
    const raw = localStorage.getItem(LS_ARCADE);
    if (!raw) return 0;
    const { date, xp } = JSON.parse(raw);
    return date === hojeLocal() ? xp : 0;
  } catch {
    return 0;
  }
}

export function registrarXpArcade(ganho: number) {
  try {
    localStorage.setItem(LS_ARCADE, JSON.stringify({ date: hojeLocal(), xp: xpArcadeHoje() + ganho }));
  } catch {}
}
