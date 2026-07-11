import { Fase, getFase } from "./levels";

export interface Question {
  fase: number;
  text: string; // ex: "7 + 8"
  visual?: string; // apoio visual em emoji, ex: "🍎🍎🍎  +  🍎🍎"
  hint?: string; // dica pedagógica mostrada no erro
  answer: number;
  choices: number[]; // 4 opções embaralhadas, inclui a resposta
}

// ---------- RNG com seed (determinístico p/ desafio do dia) ----------
export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const randomRng: Rng = Math.random;

function ri(rng: Rng, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pick<T>(rng: Rng, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function shuffle<T>(rng: Rng, arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- Distratores plausíveis (erros de "quase") ----------
function buildChoices(rng: Rng, answer: number, candidates: number[]): number[] {
  const set = new Set<number>([answer]);
  const pool = shuffle(
    rng,
    candidates.filter((c) => c !== answer && c > 0)
  );
  for (const c of pool) {
    if (set.size >= 4) break;
    set.add(c);
  }
  // fallback: vizinhos simples se faltou candidato
  let delta = 1;
  while (set.size < 4) {
    if (answer - delta > 0) set.add(answer - delta);
    if (set.size < 4) set.add(answer + delta);
    delta++;
  }
  return shuffle(rng, [...set]);
}

function somaChoices(rng: Rng, a: number, b: number): number[] {
  const ans = a + b;
  return buildChoices(rng, ans, [ans - 1, ans + 1, ans - 2, ans + 2, ans + 10, ans - 10, a + b + (b >= 10 ? 10 : 0)]);
}

function multChoices(rng: Rng, a: number, b: number): number[] {
  const ans = a * b;
  return buildChoices(rng, ans, [
    (a + 1) * b, // errou a tabuada por uma linha
    (a - 1) * b,
    a * (b + 1),
    a * (b - 1),
    a + b, // confundiu com soma
    ans + 1,
    ans - 1,
  ]);
}

const FRUTAS = ["🍎", "🍌", "🍓", "🍊", "🐞", "⭐", "🐟", "🌸"];

// ---------- Geradores por tipo de fase ----------
function gen(fase: Fase, rng: Rng): Question {
  switch (fase.tipo) {
    case "soma_visual": {
      const a = ri(rng, 1, 5);
      const b = ri(rng, 1, Math.min(5, 10 - a));
      const f = pick(rng, FRUTAS);
      return {
        fase: fase.id,
        text: `${a} + ${b}`,
        visual: `${f.repeat(a)}  +  ${f.repeat(b)}`,
        hint: "Conte todos os desenhos juntos!",
        answer: a + b,
        choices: somaChoices(rng, a, b),
      };
    }
    case "soma_ate_10": {
      const a = ri(rng, 1, 9);
      const b = ri(rng, 1, 10 - a);
      return { fase: fase.id, text: `${a} + ${b}`, hint: "Se ajudar, conte nos dedos!", answer: a + b, choices: somaChoices(rng, a, b) };
    }
    case "soma_ate_20_sem_reagrupar": {
      const a = ri(rng, 10, 15);
      const b = ri(rng, 1, Math.min(9, 19 - a, 9 - (a % 10)));
      return { fase: fase.id, text: `${a} + ${b}`, hint: "Some só as unidades: a dezena não muda!", answer: a + b, choices: somaChoices(rng, a, b) };
    }
    case "soma_atravessa_dezena": {
      let a = ri(rng, 5, 9);
      let b = ri(rng, 11 - a, 9);
      return {
        fase: fase.id,
        text: `${a} + ${b}`,
        hint: `Truque: ${a} + ${10 - a} = 10, e ainda sobram ${b - (10 - a)}!`,
        answer: a + b,
        choices: somaChoices(rng, a, b),
      };
    }
    case "soma_dezenas_cheias": {
      const a = ri(rng, 1, 5) * 10;
      const b = ri(rng, 1, Math.min(4, (90 - a) / 10)) * 10;
      return {
        fase: fase.id,
        text: `${a} + ${b}`,
        hint: `É igual a ${a / 10} + ${b / 10}, com um zero no final!`,
        answer: a + b,
        choices: buildChoices(rng, a + b, [a + b - 10, a + b + 10, a + b - 20, a + b + 20, (a + b) / 10]),
      };
    }
    case "soma_2dig_sem_reagrupar": {
      const ua = ri(rng, 1, 8);
      const ub = ri(rng, 1, 9 - ua);
      const da = ri(rng, 1, 5);
      const db = ri(rng, 1, 8 - da);
      const a = da * 10 + ua;
      const b = db * 10 + ub;
      return { fase: fase.id, text: `${a} + ${b}`, hint: "Some as unidades, depois as dezenas!", answer: a + b, choices: somaChoices(rng, a, b) };
    }
    case "soma_2dig_com_reagrupar": {
      const ua = ri(rng, 3, 9);
      const ub = ri(rng, 11 - ua > 9 ? 9 : 11 - ua, 9); // força ua+ub > 9
      const da = ri(rng, 1, 4);
      const db = ri(rng, 1, 4);
      const a = da * 10 + ua;
      const b = db * 10 + ub;
      return {
        fase: fase.id,
        text: `${a} + ${b}`,
        hint: `As unidades passam de 10: ${ua} + ${ub} = ${ua + ub}. Vai um!`,
        answer: a + b,
        choices: buildChoices(rng, a + b, [a + b - 10, a + b + 10, a + b - 1, a + b + 1, (da + db) * 10 + ((ua + ub) % 10) ]),
      };
    }
    case "soma_repetida": {
      const n = ri(rng, 2, 4); // quantas vezes
      const v = ri(rng, 2, 5); // valor
      const parts = Array(n).fill(v).join(" + ");
      return {
        fase: fase.id,
        text: parts,
        hint: `São ${n} grupinhos de ${v}. Vai somando de ${v} em ${v}!`,
        answer: n * v,
        choices: multChoices(rng, n, v),
      };
    }
    case "revelacao_multiplicacao": {
      const n = ri(rng, 2, 5);
      const v = ri(rng, 2, 5);
      const parts = Array(n).fill(v).join(" + ");
      return {
        fase: fase.id,
        text: `${n} × ${v}`,
        visual: `✨ ${n} × ${v} é o mesmo que ${parts} ✨`,
        hint: `Multiplicar é somar repetido: ${parts} = ${n * v}!`,
        answer: n * v,
        choices: multChoices(rng, n, v),
      };
    }
    case "grupos_visuais": {
      const n = ri(rng, 2, 4);
      const v = ri(rng, 2, 5);
      const f = pick(rng, FRUTAS);
      const caixa = `[${f.repeat(v)}]`;
      return {
        fase: fase.id,
        text: `${n} × ${v}`,
        visual: Array(n).fill(caixa).join("  "),
        hint: `${n} caixinhas com ${v} em cada. Conte tudo!`,
        answer: n * v,
        choices: multChoices(rng, n, v),
      };
    }
    case "tabuada": {
      const t = pick(rng, fase.tabuadas ?? [2]);
      const m = ri(rng, 2, 9);
      // comutatividade: às vezes mostra invertido pra ensinar que 7×8 = 8×7
      const inverte = rng() < 0.3;
      const [a, b] = inverte ? [m, t] : [t, m];
      let hint = `Vá somando de ${t} em ${t}, ${m} vezes!`;
      if (t === 9) hint = `Truque do 9: os dígitos da resposta somam 9! (${9 * m} → ${Math.floor((9 * m) / 10)} + ${(9 * m) % 10} = 9)`;
      if (inverte) hint = `${a} × ${b} é igual a ${b} × ${a}. Você já conhece essa!`;
      return { fase: fase.id, text: `${a} × ${b}`, hint, answer: a * b, choices: multChoices(rng, a, b) };
    }
    case "mult_dezenas": {
      const a = ri(rng, 2, 5);
      const b = ri(rng, 2, 5) * 10;
      return {
        fase: fase.id,
        text: `${a} × ${b}`,
        hint: `Faça ${a} × ${b / 10} e coloque um zero no final!`,
        answer: a * b,
        choices: buildChoices(rng, a * b, [a * (b / 10), a * b + 10, a * b - 10, (a + 1) * b, (a - 1) * b]),
      };
    }
    case "mult_2dig_1dig": {
      const d = ri(rng, 1, 3);
      const u = ri(rng, 1, 5);
      const a = d * 10 + u;
      const b = ri(rng, 2, 4);
      return {
        fase: fase.id,
        text: `${a} × ${b}`,
        hint: `Separe: ${d * 10} × ${b} = ${d * 10 * b}, e ${u} × ${b} = ${u * b}. Agora some!`,
        answer: a * b,
        choices: buildChoices(rng, a * b, [a * b + 10, a * b - 10, d * 10 * b + u, a * b + b, a * b - b]),
      };
    }
  }
}

export function generateQuestion(faseId: number, rng: Rng = randomRng): Question {
  return gen(getFase(faseId), rng);
}

export function generateSession(faseId: number, count: number, rng: Rng = randomRng): Question[] {
  const out: Question[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (out.length < count && guard < count * 20) {
    guard++;
    const q = generateQuestion(faseId, rng);
    if (seen.has(q.text)) continue;
    seen.add(q.text);
    out.push(q);
  }
  return out;
}
