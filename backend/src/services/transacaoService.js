// Movimentações financeiras (RF05, RF06). Regras RN03, RN04, RN08.
// Substitui as triggers atualiza_saldo e valida_saldo da Fase 0: o saldo é atualizado
// explicitamente aqui, dentro de uma transação de banco com bloqueio da(s) linha(s).
const { Op } = require('sequelize');
const AppError = require('../utils/AppError');
const { sequelize, Conta, Transacao, Usuario, Objetivo } = require('../models');
const { paraCentavos, deCentavos, validarValor, brl } = require('../utils/dinheiro');
const acessoService = require('./acessoService');

const TIPOS_VIA_API = ['Depósito', 'Saque', 'Transferência'];

async function registrarTransacao(auth, dados = {}) {
  const tipo = dados.tipo_transacao;
  if (!TIPOS_VIA_API.includes(tipo)) {
    throw new AppError(`tipo_transacao deve ser um de: ${TIPOS_VIA_API.join(', ')}.`, 400, 'VALIDACAO');
  }
  const valorCent = validarValor(dados.valor);
  const categoria = dados.categoria ? String(dados.categoria).trim().slice(0, 50) : null;

  // RN08 — depósitos (dinheiro novo entrando no sistema) só podem ser feitos pelo responsável
  if (tipo === 'Depósito') acessoService.exigirResponsavel(auth, 'fazer depósitos');

  return sequelize.transaction(async (t) => {
    const origem = await acessoService.buscarContaAutorizada(auth, dados.id_conta, { transaction: t, lock: t.LOCK.UPDATE });
    let destino = null;

    if (tipo === 'Transferência') {
      const idDestino = Number(dados.id_conta_destino);
      if (!Number.isInteger(idDestino) || idDestino <= 0) throw new AppError('Informe a conta de destino da transferência.', 400, 'VALIDACAO');
      if (idDestino === origem.id_conta) throw new AppError('A conta de destino deve ser diferente da conta de origem.', 422, 'TRANSFERENCIA_INVALIDA');
      destino = await Conta.findByPk(idDestino, { include: [{ model: Usuario, as: 'usuario' }], transaction: t, lock: t.LOCK.UPDATE });
      // RN08 — transferências apenas entre contas da mesma família
      if (!destino || destino.usuario.id_responsavel !== origem.usuario.id_responsavel) {
        throw new AppError('Conta de destino não encontrada na sua família.', 404, 'NAO_ENCONTRADO');
      }
    }

    const saldoOrigem = paraCentavos(origem.saldo);
    if (tipo === 'Depósito') {
      origem.saldo = deCentavos(saldoOrigem + valorCent);
    } else {
      // RN03 — o saldo nunca pode ficar negativo
      if (valorCent > saldoOrigem) {
        throw new AppError(`Saldo insuficiente. Saldo atual: ${brl(deCentavos(saldoOrigem))}.`, 422, 'SALDO_INSUFICIENTE');
      }
      origem.saldo = deCentavos(saldoOrigem - valorCent);
    }
    await origem.save({ transaction: t });

    if (destino) {
      destino.saldo = deCentavos(paraCentavos(destino.saldo) + valorCent);
      await destino.save({ transaction: t });
    }

    // RN04 — toda movimentação gera um registro em Transacoes, na mesma transação do saldo
    const transacao = await Transacao.create({
      id_conta: origem.id_conta,
      tipo_transacao: tipo,
      valor: deCentavos(valorCent),
      categoria: categoria || (destino ? `Para ${destino.usuario.nome}` : null),
      id_conta_destino: destino ? destino.id_conta : null,
    }, { transaction: t });

    return { transacao, saldo: origem.saldo, saldo_destino: destino ? destino.saldo : undefined };
  });
}

async function listarPorConta(auth, id_conta, { limite = 50 } = {}) {
  const conta = await acessoService.buscarContaAutorizada(auth, id_conta);
  const lista = await Transacao.findAll({
    where: { [Op.or]: [{ id_conta: conta.id_conta }, { id_conta_destino: conta.id_conta }] },
    include: [
      { model: Conta, as: 'conta', include: [{ model: Usuario, as: 'usuario', attributes: ['id_usuario', 'nome'] }] },
      { model: Conta, as: 'contaDestino', include: [{ model: Usuario, as: 'usuario', attributes: ['id_usuario', 'nome'] }] },
      { model: Objetivo, as: 'objetivo', attributes: ['id_objetivo', 'descricao'] },
    ],
    order: [['data_transacao', 'DESC'], ['id_transacao', 'DESC']],
    limit: Math.min(Number(limite) || 50, 200),
  });

  return {
    id_conta: conta.id_conta,
    saldo: conta.saldo,
    transacoes: lista.map((tr) => {
      const entrada = tr.tipo_transacao === 'Depósito' || tr.tipo_transacao === 'Mesada'
        || (tr.tipo_transacao === 'Transferência' && tr.id_conta_destino === conta.id_conta);
      return {
        id_transacao: tr.id_transacao,
        tipo_transacao: tr.tipo_transacao,
        valor: tr.valor,
        direcao: entrada ? 'entrada' : 'saida',
        categoria: tr.tipo_transacao === 'Transferência' && entrada
          ? `De ${tr.conta?.usuario?.nome || 'conta ' + tr.id_conta}`
          : tr.categoria,
        objetivo: tr.objetivo ? tr.objetivo.descricao : null,
        data_transacao: tr.data_transacao,
      };
    }),
  };
}

module.exports = { registrarTransacao, listarPorConta, TIPOS_VIA_API };
