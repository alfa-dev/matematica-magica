// Configuração declarativa dos mundos e fases.
// Para adicionar conteúdo novo (ex: subtração), basta criar novas entradas.

export interface Fase {
  id: number;
  mundo: number;
  nome: string;
  descricao: string;
  // tipo usado pelo questionGenerator
  tipo:
    | "soma_visual" // soma até 10 com apoio visual
    | "soma_ate_10"
    | "soma_ate_20_sem_reagrupar"
    | "soma_atravessa_dezena"
    | "soma_dezenas_cheias"
    | "soma_2dig_sem_reagrupar"
    | "soma_2dig_com_reagrupar"
    | "soma_repetida"
    | "revelacao_multiplicacao"
    | "grupos_visuais"
    | "tabuada"
    | "mult_dezenas"
    | "mult_2dig_1dig";
  tabuadas?: number[]; // para tipo "tabuada"
}

export interface Mundo {
  id: number;
  nome: string;
  emoji: string;
  cor: string; // classe tailwind de fundo do nó
}

export const MUNDOS: Mundo[] = [
  { id: 1, nome: "O Jardim dos Números", emoji: "🌻", cor: "bg-grama" },
  { id: 2, nome: "A Montanha das Dezenas", emoji: "⛰️", cor: "bg-sol" },
  { id: 3, nome: "A Ponte Mágica", emoji: "🌈", cor: "bg-coral" },
  { id: 4, nome: "O Reino da Multiplicação", emoji: "🏰", cor: "bg-uva" },
  { id: 5, nome: "O Castelo dos Mestres", emoji: "👑", cor: "bg-ceunoite" },
];

export const FASES: Fase[] = [
  { id: 1, mundo: 1, nome: "Primeiras Sementes", descricao: "Somas até 10, com desenhos pra ajudar", tipo: "soma_visual" },
  { id: 2, mundo: 1, nome: "Brotinhos", descricao: "Somas até 10, agora só com números", tipo: "soma_ate_10" },
  { id: 3, mundo: 1, nome: "Flores Gêmeas", descricao: "Somas até 20, sem pegadinha", tipo: "soma_ate_20_sem_reagrupar" },
  { id: 4, mundo: 1, nome: "O Portão da Dezena", descricao: "Atravessando a dezena! (8 + 7)", tipo: "soma_atravessa_dezena" },
  { id: 5, mundo: 2, nome: "Trilha das Dezenas", descricao: "Dezenas cheias (20 + 30)", tipo: "soma_dezenas_cheias" },
  { id: 6, mundo: 2, nome: "Subida Tranquila", descricao: "Números grandes, soma calma (23 + 45)", tipo: "soma_2dig_sem_reagrupar" },
  { id: 7, mundo: 2, nome: "O Pico do Vai-Um", descricao: "O famoso 'vai um'! (27 + 48)", tipo: "soma_2dig_com_reagrupar" },
  { id: 8, mundo: 3, nome: "Passos Repetidos", descricao: "Somas repetidas (4 + 4 + 4)", tipo: "soma_repetida" },
  { id: 9, mundo: 3, nome: "A Grande Revelação", descricao: "O segredo da multiplicação!", tipo: "revelacao_multiplicacao" },
  { id: 10, mundo: 3, nome: "Caixinhas Mágicas", descricao: "Grupos de coisas (3 caixas de 4)", tipo: "grupos_visuais" },
  { id: 11, mundo: 4, nome: "Os Amigáveis", descricao: "Tabuadas do 2, 5 e 10", tipo: "tabuada", tabuadas: [2, 5, 10] },
  { id: 12, mundo: 4, nome: "Os Vizinhos", descricao: "Tabuadas do 3 e do 4", tipo: "tabuada", tabuadas: [3, 4] },
  { id: 13, mundo: 4, nome: "Os Valentões", descricao: "Tabuadas do 6, 7 e 8", tipo: "tabuada", tabuadas: [6, 7, 8] },
  { id: 14, mundo: 4, nome: "O Truque do Nove", descricao: "Tabuada do 9 e seu segredo", tipo: "tabuada", tabuadas: [9] },
  { id: 15, mundo: 5, nome: "Salão das Dezenas", descricao: "Multiplicando dezenas (3 × 20)", tipo: "mult_dezenas" },
  { id: 16, mundo: 5, nome: "O Trono Dourado", descricao: "Contas de mestre (24 × 3)", tipo: "mult_2dig_1dig" },
];

export function getFase(id: number): Fase {
  return FASES.find((f) => f.id === id) ?? FASES[0];
}

export function fasesDoMundo(mundoId: number): Fase[] {
  return FASES.filter((f) => f.mundo === mundoId);
}

// Quantas questões por sessão de fase e quantos acertos para completar
export const QUESTOES_POR_FASE = 10;
export const ACERTOS_PARA_COMPLETAR = 8;
