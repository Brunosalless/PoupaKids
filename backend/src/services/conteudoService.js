// Conteúdos de educação financeira (RF09, RF14). Regra RN10.
const AppError = require('../utils/AppError');
const { sequelize, ConteudoEducativo, ProgressoConteudo } = require('../models');
const gamificacaoService = require('./gamificacaoService');
const acessoService = require('./acessoService');

async function listar(auth, { nivel, id_usuario } = {}) {
  if (nivel && !ConteudoEducativo.NIVEIS.includes(nivel)) {
    throw new AppError(`nivel deve ser um de: ${ConteudoEducativo.NIVEIS.join(', ')}.`, 400, 'VALIDACAO');
  }
  const conteudos = await ConteudoEducativo.findAll({ where: nivel ? { nivel } : {}, order: [['id_conteudo', 'ASC']] });

  // Progresso: da própria criança, ou de um filho quando o responsável informa id_usuario
  let alvo = null;
  if (auth.perfil === 'CRIANCA') alvo = auth.id;
  else if (id_usuario) alvo = (await acessoService.buscarUsuarioAutorizado(auth, id_usuario)).id_usuario;

  const concluidos = alvo ? new Set((await ProgressoConteudo.findAll({ where: { id_usuario: alvo } })).map((p) => p.id_conteudo)) : new Set();
  return conteudos.map((c) => ({ ...c.toJSON(), concluido: concluidos.has(c.id_conteudo) }));
}

async function concluir(auth, id_conteudo) {
  if (auth.perfil !== 'CRIANCA') throw new AppError('Somente a criança pode concluir conteúdos.', 403, 'PERMISSAO');
  const conteudo = await ConteudoEducativo.findByPk(Number(id_conteudo));
  if (!conteudo) throw new AppError('Conteúdo não encontrado.', 404, 'NAO_ENCONTRADO');

  return sequelize.transaction(async (t) => {
    // RN10 — pontos do conteúdo concedidos uma única vez por criança
    const [, criado] = await ProgressoConteudo.findOrCreate({
      where: { id_usuario: auth.id, id_conteudo: conteudo.id_conteudo },
      defaults: { id_usuario: auth.id, id_conteudo: conteudo.id_conteudo },
      transaction: t,
    });
    if (!criado) {
      const g = await gamificacaoService.obterRegistro(auth.id, t);
      return { ja_concluido: true, pontos_ganhos: 0, gamificacao: { pontos: g.pontos, nivel: g.nivel }, novas_conquistas: [] };
    }
    const g = await gamificacaoService.adicionarPontos(auth.id, conteudo.pontos, t);
    const novas = [];
    const total = await ProgressoConteudo.count({ where: { id_usuario: auth.id }, transaction: t });
    if (total >= 3 && await gamificacaoService.concederConquista(auth.id, 'LEITOR', t)) novas.push('LEITOR');
    return { ja_concluido: false, pontos_ganhos: conteudo.pontos, gamificacao: g, novas_conquistas: novas };
  });
}

module.exports = { listar, concluir };
