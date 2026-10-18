// Regras de autorização (RN12): o responsável só acessa os próprios filhos;
// a criança só acessa os próprios dados.
const AppError = require('../utils/AppError');
const { Usuario, Conta } = require('../models');

async function buscarUsuarioAutorizado(auth, id_usuario, opts = {}) {
  const id = Number(id_usuario);
  if (!Number.isInteger(id) || id <= 0) throw new AppError('Identificador de usuário inválido.', 400, 'VALIDACAO');

  const usuario = await Usuario.findByPk(id, {
    include: [{ model: Conta, as: 'conta' }],
    transaction: opts.transaction,
  });
  if (!usuario) throw new AppError('Usuário não encontrado.', 404, 'NAO_ENCONTRADO');

  const permitido = auth.perfil === 'RESPONSAVEL'
    ? usuario.id_responsavel === auth.id
    : usuario.id_usuario === auth.id;
  // 404 (e não 403) para não revelar a existência de dados de outras famílias.
  if (!permitido) throw new AppError('Usuário não encontrado.', 404, 'NAO_ENCONTRADO');
  return usuario;
}

async function buscarContaAutorizada(auth, id_conta, opts = {}) {
  const id = Number(id_conta);
  if (!Number.isInteger(id) || id <= 0) throw new AppError('Identificador de conta inválido.', 400, 'VALIDACAO');

  const conta = await Conta.findByPk(id, {
    include: [{ model: Usuario, as: 'usuario' }],
    transaction: opts.transaction,
    lock: opts.lock,
  });
  if (!conta) throw new AppError('Conta não encontrada.', 404, 'NAO_ENCONTRADO');

  const permitido = auth.perfil === 'RESPONSAVEL'
    ? conta.usuario.id_responsavel === auth.id
    : conta.id_usuario === auth.id;
  if (!permitido) throw new AppError('Conta não encontrada.', 404, 'NAO_ENCONTRADO');
  return conta;
}

function exigirResponsavel(auth, acao) {
  if (auth.perfil !== 'RESPONSAVEL') {
    throw new AppError(`Somente o responsável pode ${acao}.`, 403, 'PERMISSAO');
  }
}

module.exports = { buscarUsuarioAutorizado, buscarContaAutorizada, exigirResponsavel };
