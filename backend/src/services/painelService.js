// Painel do responsável (RF15): visão consolidada da família.
const { Op } = require('sequelize');
const { Transacao, Conta, Usuario, Objetivo } = require('../models');
const { paraCentavos, deCentavos } = require('../utils/dinheiro');
const acessoService = require('./acessoService');
const usuarioService = require('./usuarioService');

async function resumoResponsavel(auth) {
  acessoService.exigirResponsavel(auth, 'ver o painel da família');
  const filhos = await usuarioService.listarUsuarios(auth);
  const idsContas = filhos.map((f) => f.conta.id_conta);

  const recentes = idsContas.length ? await Transacao.findAll({
    where: { id_conta: { [Op.in]: idsContas } },
    include: [
      { model: Conta, as: 'conta', include: [{ model: Usuario, as: 'usuario', attributes: ['nome'] }] },
      { model: Objetivo, as: 'objetivo', attributes: ['descricao'] },
    ],
    order: [['data_transacao', 'DESC'], ['id_transacao', 'DESC']],
    limit: 8,
  }) : [];

  return {
    totais: {
      criancas: filhos.length,
      saldo_total: deCentavos(filhos.reduce((s, f) => s + paraCentavos(f.conta.saldo), 0)),
      guardado_total: deCentavos(filhos.reduce((s, f) => s + paraCentavos(f.resumo.total_guardado), 0)),
      metas_concluidas: filhos.reduce((s, f) => s + f.resumo.metas_concluidas, 0),
      mesadas_pendentes: filhos.filter((f) => f.conta.limite_mesada > 0 && !f.resumo.mesada_paga_neste_mes).length,
    },
    filhos,
    atividades_recentes: recentes.map((t) => ({
      id_transacao: t.id_transacao,
      crianca: t.conta.usuario.nome,
      tipo_transacao: t.tipo_transacao,
      valor: t.valor,
      categoria: t.categoria,
      data_transacao: t.data_transacao,
    })),
  };
}

module.exports = { resumoResponsavel };
