// Curva de XP, títulos e cosméticos

export const XP_ACERTO = 10;
export const XP_BONUS_STREAK = { 3: 5, 5: 10, 10: 25 } as const;
export const XP_FASE_COMPLETA = 100;
export const XP_DESAFIO_DIARIO = 80;
export const XP_TETO_DIARIO_MINIGAMES = 120;

// XP necessário para ir do nível n para o n+1
export function xpParaProximoNivel(nivel: number): number {
  return 100 + (nivel - 1) * 50;
}

// Converte XP total em { nivel, xpNoNivel, xpNecessario }
export function nivelDoXp(totalXp: number): { nivel: number; xpNoNivel: number; xpNecessario: number } {
  let nivel = 1;
  let resto = totalXp;
  while (resto >= xpParaProximoNivel(nivel)) {
    resto -= xpParaProximoNivel(nivel);
    nivel++;
  }
  return { nivel, xpNoNivel: resto, xpNecessario: xpParaProximoNivel(nivel) };
}

const TITULOS = [
  "Aprendiz das Somas",
  "Exploradora dos Números",
  "Guardiã das Dezenas",
  "Heroína da Ponte Mágica",
  "Domadora de Tabuadas",
  "Feiticeira da Multiplicação",
  "Mestra do Castelo",
  "Estrela da Matemática",
];

export function tituloDoNivel(nivel: number): string {
  if (nivel <= TITULOS.length) return TITULOS[nivel - 1];
  return `Lenda da Matemática ${"⭐".repeat(Math.min(3, nivel - TITULOS.length))}`;
}

// Cosméticos: chapéus do mascote
export interface Cosmetico {
  id: string;
  nome: string;
  emoji: string;
  origem: string; // como desbloqueia
}

export const COSMETICOS_POR_NIVEL: Record<number, Cosmetico> = {
  2: { id: "laco", nome: "Laço Rosa", emoji: "🎀", origem: "Nível 2" },
  3: { id: "bone", nome: "Boné Aventureiro", emoji: "🧢", origem: "Nível 3" },
  4: { id: "coroa", nome: "Coroinha", emoji: "👑", origem: "Nível 4" },
  5: { id: "cartola", nome: "Cartola Mágica", emoji: "🎩", origem: "Nível 5" },
  6: { id: "unicornio", nome: "Chifre de Unicórnio", emoji: "🦄", origem: "Nível 6" },
  7: { id: "estrela", nome: "Estrela Cadente", emoji: "🌟", origem: "Nível 7" },
};

// Marcos de dias treinados (TOTAL acumulado, não consecutivo!)
export interface Marco {
  dias: number;
  cosmetico: Cosmetico;
}

export const MARCOS: Marco[] = [
  { dias: 3, cosmetico: { id: "lua", nome: "Touca de Dorminhoco", emoji: "🌙", origem: "3 dias de treino" } },
  { dias: 7, cosmetico: { id: "formatura", nome: "Chapéu de Sabida", emoji: "🎓", origem: "7 dias de treino" } },
  { dias: 14, cosmetico: { id: "coruja", nome: "Coruja de Estimação", emoji: "🦉", origem: "14 dias de treino" } },
  { dias: 30, cosmetico: { id: "arcoiris", nome: "Aura Arco-Íris", emoji: "🌈", origem: "30 dias de treino" } },
  { dias: 60, cosmetico: { id: "trofeu", nome: "Troféu Lendário", emoji: "🏆", origem: "60 dias de treino" } },
];

export function todosOsCosmeticos(): Cosmetico[] {
  return [...Object.values(COSMETICOS_POR_NIVEL), ...MARCOS.map((m) => m.cosmetico)];
}

export function cosmeticoPorId(id: string): Cosmetico | undefined {
  return todosOsCosmeticos().find((c) => c.id === id);
}

// Adesivos do calendário (um por dia completo, escolhido por seed)
export const ADESIVOS = ["🌟", "🐣", "🍭", "🦋", "🐬", "🌈", "🍀", "🧁", "🚀", "🐨", "🎈", "🍉", "🐙", "🌸", "⚡", "🎠", "🐝", "🍩", "🎨", "🦖"];
