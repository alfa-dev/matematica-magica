"use client";
import { SupabaseClient } from "@supabase/supabase-js";
import { generateSession, generateQuestion, mulberry32, hashString, Question } from "./questionGenerator";
import { ADESIVOS } from "./xp";
import { hojeLocal } from "./progress";

export const QUESTOES_DESAFIO = 10;

// Questões do dia: determinísticas por (usuário + data).
// 7 da fase atual + 3 de revisão de fases anteriores (repetição espaçada).
export function questoesDoDia(userId: string, faseAtual: number, dateStr = hojeLocal()): Question[] {
  const rng = mulberry32(hashString(`${userId}|${dateStr}`));
  const principais = generateSession(faseAtual, 7, rng);
  const revisao: Question[] = [];
  for (let i = 0; i < 3; i++) {
    const f = faseAtual > 1 ? 1 + Math.floor(rng() * (faseAtual - 1)) : faseAtual;
    revisao.push(generateQuestion(f, rng));
  }
  // intercala revisões nas posições 3, 6 e 9
  const out = [...principais];
  out.splice(2, 0, revisao[0]);
  out.splice(5, 0, revisao[1]);
  out.splice(8, 0, revisao[2]);
  return out.slice(0, QUESTOES_DESAFIO);
}

export function adesivoDoDia(userId: string, dateStr = hojeLocal()): string {
  const rng = mulberry32(hashString(`sticker|${userId}|${dateStr}`));
  return ADESIVOS[Math.floor(rng() * ADESIVOS.length)];
}

export async function desafioCompletoHoje(supabase: SupabaseClient, userId: string): Promise<boolean> {
  // espelho local para resposta instantânea
  try {
    if (localStorage.getItem(`mm_daily_${hojeLocal()}`) === "1") return true;
  } catch {}
  try {
    const { data } = await supabase
      .from("daily_challenges")
      .select("completed")
      .eq("user_id", userId)
      .eq("challenge_date", hojeLocal())
      .maybeSingle();
    return !!data?.completed;
  } catch {
    return false;
  }
}

export async function marcarDesafioCompleto(
  supabase: SupabaseClient,
  userId: string,
  score: number
): Promise<string> {
  const sticker = adesivoDoDia(userId);
  try {
    localStorage.setItem(`mm_daily_${hojeLocal()}`, "1");
  } catch {}
  try {
    await supabase.from("daily_challenges").upsert({
      user_id: userId,
      challenge_date: hojeLocal(),
      completed: true,
      score,
      sticker_id: sticker,
    });
  } catch {}
  return sticker;
}

export interface DiaCalendario {
  date: string;
  sticker: string | null;
}

export async function diasDoMes(supabase: SupabaseClient, userId: string, ano: number, mes: number): Promise<DiaCalendario[]> {
  const inicio = `${ano}-${String(mes).padStart(2, "0")}-01`;
  const fimDate = new Date(ano, mes, 0).getDate();
  const fim = `${ano}-${String(mes).padStart(2, "0")}-${String(fimDate).padStart(2, "0")}`;
  try {
    const { data } = await supabase
      .from("daily_challenges")
      .select("challenge_date, sticker_id, completed")
      .eq("user_id", userId)
      .gte("challenge_date", inicio)
      .lte("challenge_date", fim);
    return (data ?? [])
      .filter((d: any) => d.completed)
      .map((d: any) => ({ date: d.challenge_date, sticker: d.sticker_id }));
  } catch {
    return [];
  }
}
