// Registro declarativo dos minigames do Fliperama
export interface MinigameInfo {
  id: string;
  nome: string;
  emoji: string;
  descricao: string;
  rota: string;
  // mundo que precisa estar COMPLETO para desbloquear (fase final do mundo concluída)
  desbloqueiaAposFase: number;
  disponivel: boolean; // false = "em breve"
}

export const MINIGAMES: MinigameInfo[] = [
  {
    id: "math_attack",
    nome: "Math Attack",
    emoji: "👾",
    descricao: "Inimigos caem do céu com continhas. Destrua todos!",
    rota: "/jogar/fliperama/math-attack",
    desbloqueiaAposFase: 4, // completou o Mundo 1
    disponivel: true,
  },
  {
    id: "dupla_relampago",
    nome: "Dupla Relâmpago",
    emoji: "⚡",
    descricao: "Jogo da memória: ache o par da continha com a resposta!",
    rota: "/jogar/fliperama/dupla-relampago",
    desbloqueiaAposFase: 4,
    disponivel: true,
  },
  {
    id: "ponte_numerica",
    nome: "Ponte Numérica",
    emoji: "🌉",
    descricao: "Ajude o Pip a atravessar pisando nas pedras certas!",
    rota: "#",
    desbloqueiaAposFase: 7, // completou o Mundo 2
    disponivel: false,
  },
  {
    id: "mercadinho",
    nome: "Mercadinho Maluco",
    emoji: "🛒",
    descricao: "Seja a caixa da lojinha e some as compras dos bichinhos!",
    rota: "#",
    desbloqueiaAposFase: 10, // completou o Mundo 3
    disponivel: false,
  },
];
