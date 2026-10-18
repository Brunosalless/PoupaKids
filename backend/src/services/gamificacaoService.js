// Pontos, níveis e conquistas (RN06, RN09, RN10, RN11).
const { Gamificacao } = require('../models');
const acessoService = require('./acessoService');

const PONTOS_POR_NIVEL = 100;

const CONQUISTAS = {
  PRIMEIRA_POUPANCA: { titulo: 'Primeiro cofrinho', descricao: 'Guardou dinheiro em uma meta pela primeira vez.', icone: '🐷' },
  PRIMEIRA_META: { titulo: 'Meta batida!', descricao: 'Concluiu a primeira meta de poupança.', icone: '🏆' },
  LEITOR: { titulo: 'Leitor curioso', descricao: 'Concluiu 3 conteúdos de educação financeira.', icone: '📚' },
  NIVEL_3: { titulo: 'Poupador experiente', descricao: 'Chegou ao nível 3.', icone: '⭐' },
};

const calcularNivel = (pontos) => Math.floor(pontos / PONTOS_POR_NIVEL) + 1;

async function obterRegistro(id_usuario, transaction) {
  const [g] = await Gamificacao.findOrCreate({
    where: { id_usuario },
    defaults: { id_usuario, nivel: 1, pontos: 0, conquistas: [] },
    transaction,
  });
  return g;
}

/** Concede uma conquista (idempotente). Retorna true se for nova. */
async function concederConquista(id_usuario, codigo, transaction) {
  const g = await obterRegistro(id_usuario, transaction);
  const lista = g.conquistas;
  if (lista.includes(codigo)) return false;
  g.conquistas = [...lista, codigo];
  await g.save({ transaction });
  return true;
}

/** Soma pontos e recalcula o nível (RN11: nível = ⌊pontos/100⌋ + 1). */
async function adicionarPontos(id_usuario, pontos, transaction) {
  const g = await obterRegistro(id_usuario, transaction);
  const nivelAnterior = g.nivel;
  g.pontos += pontos;
  g.nivel = calcularNivel(g.pontos);
  await g.save({ transaction });
  if (g.nivel >= 3) await concederConquista(id_usuario, 'NIVEL_3', transaction);
  return { pontos: g.pontos, nivel: g.nivel, subiuDeNivel: g.nivel > nivelAnterior };
}

function formatar(g) {
  const pontosNoNivel = g.pontos % PONTOS_POR_NIVEL;
  return {
    id_usuario: g.id_usuario,
    nivel: g.nivel,
    pontos: g.pontos,
    progresso_nivel: pontosNoNivel,
    pontos_para_proximo_nivel: PONTOS_POR_NIVEL - pontosNoNivel,
    conquistas: g.conquistas.map((c) => ({ codigo: c, ...(CONQUISTAS[c] || { titulo: c }) })),
    conquistas_disponiveis: Object.entries(CONQUISTAS).map(([codigo, c]) => ({ codigo, ...c, obtida: g.conquistas.includes(codigo) })),
  };
}

async function obter(auth, id_usuario) {
  const usuario = await acessoService.buscarUsuarioAutorizado(auth, id_usuario);
  return formatar(await obterRegistro(usuario.id_usuario));
}

module.exports = { CONQUISTAS, PONTOS_POR_NIVEL, calcularNivel, adicionarPontos, concederConquista, obter, formatar, obterRegistro };
