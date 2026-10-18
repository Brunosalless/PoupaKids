// Metas de poupança / cofrinhos (RF07, RF08). Regras RN05, RN06, RN09, RN13.
const AppError = require('../utils/AppError');
const { sequelize, Objetivo, Conta, Transacao } = require('../models');
const { paraCentavos, deCentavos, validarValor, brl } = require('../utils/dinheiro');
const acessoService = require('./acessoService');
const gamificacaoService = require('./gamificacaoService');

const MAX_METAS_ATIVAS = 5;
const PONTOS_POR_GUARDA = 5;
const PONTOS_META_CONCLUIDA = 100;

function formatar(o) {
  const json = o.toJSON();
  json.percentual = o.valor_meta > 0 ? Math.min(100, Math.round((o.valor_atual / o.valor_meta) * 100)) : 0;
  json.falta = deCentavos(Math.max(0, paraCentavos(o.valor_meta) - paraCentavos(o.valor_atual)));
  return json;
}

async function criarObjetivo(auth, dados = {}) {
  const idUsuario = auth.perfil === 'CRIANCA' ? auth.id : dados.id_usuario;
  if (!idUsuario) throw new AppError('Informe a criança dona da meta (id_usuario).', 400, 'VALIDACAO');
  const usuario = await acessoService.buscarUsuarioAutorizado(auth, idUsuario);

  const descricao = String(dados.descricao || '').trim();
  if (descricao.length < 2 || descricao.length > 150) throw new AppError('A descrição da meta deve ter entre 2 e 150 caracteres.', 422, 'VALIDACAO');
  const metaCent = validarValor(dados.valor_meta, 'valor_meta');

  // RN13 — no máximo 5 metas em andamento por criança (foco no planejamento)
  const ativas = await Objetivo.count({ where: { id_usuario: usuario.id_usuario, status: 'Em andamento' } });
  if (ativas >= MAX_METAS_ATIVAS) {
    throw new AppError(`Limite de ${MAX_METAS_ATIVAS} metas em andamento atingido. Conclua uma antes de criar outra.`, 422, 'LIMITE_METAS');
  }

  const o = await Objetivo.create({ id_usuario: usuario.id_usuario, descricao, valor_meta: deCentavos(metaCent), valor_atual: 0 });
  return formatar(o);
}

async function listarObjetivos(auth, id_usuario) {
  const usuario = await acessoService.buscarUsuarioAutorizado(auth, id_usuario);
  const lista = await Objetivo.findAll({
    where: { id_usuario: usuario.id_usuario },
    order: [['status', 'DESC'], ['id_objetivo', 'ASC']],
  });
  return lista.map(formatar);
}

async function adicionarValorObjetivo(auth, id_objetivo, valor) {
  const valorCent = validarValor(valor);

  return sequelize.transaction(async (t) => {
    const objetivo = await Objetivo.findByPk(Number(id_objetivo), { transaction: t, lock: t.LOCK.UPDATE });
    if (!objetivo) throw new AppError('Meta não encontrada.', 404, 'NAO_ENCONTRADO');
    const usuario = await acessoService.buscarUsuarioAutorizado(auth, objetivo.id_usuario, { transaction: t });

    if (objetivo.status === 'Concluído') throw new AppError('Esta meta já foi concluída.', 422, 'META_CONCLUIDA');

    // RN05 — o valor atual nunca pode ultrapassar o valor da meta
    const atualCent = paraCentavos(objetivo.valor_atual);
    const metaCent = paraCentavos(objetivo.valor_meta);
    if (atualCent + valorCent > metaCent) {
      throw new AppError(`Esse valor ultrapassa a meta. Faltam apenas ${brl(deCentavos(metaCent - atualCent))}.`, 422, 'META_EXCEDIDA');
    }

    // RN09 — guardar no cofrinho debita o saldo da conta da criança (RN03: sem saldo negativo)
    const conta = await Conta.findByPk(usuario.conta.id_conta, { transaction: t, lock: t.LOCK.UPDATE });
    const saldoCent = paraCentavos(conta.saldo);
    if (valorCent > saldoCent) {
      throw new AppError(`Saldo insuficiente para guardar. Saldo atual: ${brl(deCentavos(saldoCent))}.`, 422, 'SALDO_INSUFICIENTE');
    }
    conta.saldo = deCentavos(saldoCent - valorCent);
    await conta.save({ transaction: t });

    objetivo.valor_atual = deCentavos(atualCent + valorCent);
    const concluiu = atualCent + valorCent === metaCent;
    if (concluiu) {
      objetivo.status = 'Concluído';
      objetivo.concluido_em = new Date();
    }
    await objetivo.save({ transaction: t });

    await Transacao.create({
      id_conta: conta.id_conta, tipo_transacao: 'Poupança', valor: deCentavos(valorCent),
      categoria: `Cofrinho: ${objetivo.descricao}`.slice(0, 50), id_objetivo: objetivo.id_objetivo,
    }, { transaction: t });

    // Gamificação: +5 por guarda; RN06: +100 e conquista ao concluir a meta
    const novasConquistas = [];
    if (await gamificacaoService.concederConquista(usuario.id_usuario, 'PRIMEIRA_POUPANCA', t)) novasConquistas.push('PRIMEIRA_POUPANCA');
    let pontosGanhos = PONTOS_POR_GUARDA;
    if (concluiu) {
      pontosGanhos += PONTOS_META_CONCLUIDA;
      if (await gamificacaoService.concederConquista(usuario.id_usuario, 'PRIMEIRA_META', t)) novasConquistas.push('PRIMEIRA_META');
    }
    const g = await gamificacaoService.adicionarPontos(usuario.id_usuario, pontosGanhos, t);

    return { objetivo: formatar(objetivo), saldo: conta.saldo, meta_concluida: concluiu, pontos_ganhos: pontosGanhos, gamificacao: g, novas_conquistas: novasConquistas };
  });
}

module.exports = { criarObjetivo, listarObjetivos, adicionarValorObjetivo, MAX_METAS_ATIVAS, PONTOS_POR_GUARDA, PONTOS_META_CONCLUIDA };
