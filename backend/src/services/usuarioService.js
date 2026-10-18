// Cadastro e consulta de crianças (RF02–RF04), mesada (RF12–RF13). Regras RN01, RN02, RN07.
const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');
const { sequelize, Usuario, Conta, Gamificacao, Objetivo, Transacao } = require('../models');
const { paraCentavos, deCentavos, brl } = require('../utils/dinheiro');
const acessoService = require('./acessoService');
const { formatarCpf, BCRYPT_ROUNDS } = require('./authService');

const LIMITE_MESADA_MAXIMO = 1000;

function mesReferencia(data = new Date()) {
  // AAAA-MM no fuso de Brasília
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit' }).formatToParts(data);
  return `${p.find((x) => x.type === 'year').value}-${p.find((x) => x.type === 'month').value}`;
}

function validarLimiteMesada(v) {
  const n = Number(v ?? 0);
  if (!Number.isFinite(n) || n < 0 || n > LIMITE_MESADA_MAXIMO) {
    throw new AppError(`A mesada deve estar entre R$ 0,00 e ${brl(LIMITE_MESADA_MAXIMO)}.`, 422, 'VALIDACAO');
  }
  return deCentavos(paraCentavos(n));
}

async function criarUsuario(auth, dados = {}) {
  acessoService.exigirResponsavel(auth, 'cadastrar crianças');

  const nome = String(dados.nome || '').trim();
  const idade = Number(dados.idade);
  const apelido = String(dados.apelido || '').trim().toLowerCase();
  const pin = String(dados.pin || '');

  if (nome.length < 2) throw new AppError('Informe o nome da criança.', 422, 'VALIDACAO');
  // RN01 — idade obrigatória, inteira e menor que 18 anos (antiga trigger valida_idade)
  if (!Number.isInteger(idade) || idade < 1 || idade >= 18) {
    throw new AppError('A idade do usuário deve ser um número inteiro entre 1 e 17 anos.', 422, 'IDADE_INVALIDA');
  }
  if (!/^[a-z0-9_.]{3,30}$/.test(apelido)) {
    throw new AppError('O apelido deve ter de 3 a 30 caracteres (letras minúsculas, números, "." ou "_").', 422, 'VALIDACAO');
  }
  if (!/^\d{4}$/.test(pin)) throw new AppError('O PIN deve ter exatamente 4 dígitos.', 422, 'VALIDACAO');
  const cpf = dados.cpf ? formatarCpf(dados.cpf) : null;
  const limite_mesada = validarLimiteMesada(dados.limite_mesada);

  if (await Usuario.findOne({ where: { apelido } })) throw new AppError('Este apelido já está em uso.', 409, 'DUPLICADO');
  if (cpf && await Usuario.findOne({ where: { cpf } })) throw new AppError('Já existe uma criança com este CPF.', 409, 'DUPLICADO');

  const pin_hash = await bcrypt.hash(pin, BCRYPT_ROUNDS);

  // RN02 — usuário, conta (saldo 0) e gamificação (nível 1, 0 pontos) são criados de forma atômica
  const id = await sequelize.transaction(async (t) => {
    const u = await Usuario.create({ nome, idade, cpf, apelido, pin_hash, id_responsavel: auth.id }, { transaction: t });
    await Conta.create({ id_usuario: u.id_usuario, saldo: 0, limite_mesada }, { transaction: t });
    await Gamificacao.create({ id_usuario: u.id_usuario, nivel: 1, pontos: 0, conquistas: [] }, { transaction: t });
    return u.id_usuario;
  });
  return buscarUsuario(auth, id);
}

async function listarUsuarios(auth) {
  acessoService.exigirResponsavel(auth, 'listar as crianças da família');
  const filhos = await Usuario.findAll({
    where: { id_responsavel: auth.id },
    include: [
      { model: Conta, as: 'conta' },
      { model: Gamificacao, as: 'gamificacao' },
      { model: Objetivo, as: 'objetivos' },
    ],
    order: [['nome', 'ASC']],
  });
  return filhos.map(formatarUsuario);
}

async function buscarUsuario(auth, id_usuario) {
  const u = await acessoService.buscarUsuarioAutorizado(auth, id_usuario);
  const completo = await Usuario.findByPk(u.id_usuario, {
    include: [
      { model: Conta, as: 'conta' },
      { model: Gamificacao, as: 'gamificacao' },
      { model: Objetivo, as: 'objetivos' },
    ],
  });
  return formatarUsuario(completo);
}

function formatarUsuario(u) {
  const json = u.toJSON();
  const objetivos = u.objetivos || [];
  json.resumo = {
    metas_em_andamento: objetivos.filter((o) => o.status === 'Em andamento').length,
    metas_concluidas: objetivos.filter((o) => o.status === 'Concluído').length,
    total_guardado: deCentavos(objetivos.reduce((s, o) => s + paraCentavos(o.valor_atual), 0)),
    mesada_paga_neste_mes: u.conta ? u.conta.mesada_referencia === mesReferencia() : false,
  };
  delete json.objetivos;
  return json;
}

async function definirMesada(auth, id_usuario, limite) {
  acessoService.exigirResponsavel(auth, 'definir a mesada');
  const u = await acessoService.buscarUsuarioAutorizado(auth, id_usuario);
  u.conta.limite_mesada = validarLimiteMesada(limite);
  await u.conta.save();
  return buscarUsuario(auth, id_usuario);
}

// RN07 — a mesada é paga pelo responsável, no valor de limite_mesada, no máximo uma vez por mês
async function pagarMesada(auth, id_usuario) {
  acessoService.exigirResponsavel(auth, 'pagar a mesada');
  const u = await acessoService.buscarUsuarioAutorizado(auth, id_usuario);
  const referencia = mesReferencia();

  return sequelize.transaction(async (t) => {
    const conta = await Conta.findByPk(u.conta.id_conta, { transaction: t, lock: t.LOCK.UPDATE });
    const valorCent = paraCentavos(conta.limite_mesada);
    if (valorCent <= 0) throw new AppError('Defina o valor da mesada antes de pagá-la.', 422, 'MESADA_NAO_DEFINIDA');
    if (conta.mesada_referencia === referencia) {
      throw new AppError(`A mesada de ${referencia} já foi paga para ${u.nome}.`, 409, 'MESADA_JA_PAGA');
    }
    conta.saldo = deCentavos(paraCentavos(conta.saldo) + valorCent);
    conta.mesada_referencia = referencia;
    await conta.save({ transaction: t });
    const transacao = await Transacao.create({
      id_conta: conta.id_conta, tipo_transacao: 'Mesada', valor: deCentavos(valorCent), categoria: `Mesada ${referencia}`,
    }, { transaction: t });
    return { transacao, saldo: conta.saldo, referencia };
  });
}

module.exports = { criarUsuario, listarUsuarios, buscarUsuario, definirMesada, pagarMesada, mesReferencia, LIMITE_MESADA_MAXIMO };
