const MENSAGENS = [
  'Economizar um pouquinho todo dia vira muito no fim do mês! 🐷',
  'Cada moedinha que entra no cofrinho é um passo mais perto do seu sonho!',
  'Quem poupa hoje realiza amanhã! 🚀',
  'Planejar seus gastos é coisa de gente inteligente. 🧠',
  'Saber a diferença entre querer e precisar é o primeiro passo! ✨',
  'Pequenas economias, grandes conquistas!',
  'Você está no controle do seu dinheiro. 💪',
];

/** Retorna a mensagem motivacional do dia (rotaciona por data). */
export function mensagemDoDia(date = new Date()): string {
  const diasDoAno = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000,
  );
  return MENSAGENS[diasDoAno % MENSAGENS.length];
}
