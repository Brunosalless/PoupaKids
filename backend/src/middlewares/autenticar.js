// Valida o token JWT enviado no cabeçalho Authorization: Bearer <token>
// e disponibiliza req.auth = { perfil, id, nome } para controllers e services.
const AppError = require('../utils/AppError');
const { verificarToken } = require('../services/authService');

function autenticar(req, _res, next) {
  const header = req.headers.authorization || '';
  const [tipo, token] = header.split(' ');
  if (tipo !== 'Bearer' || !token) return next(new AppError('Autenticação necessária.', 401, 'SESSAO'));
  try {
    req.auth = verificarToken(token);
    return next();
  } catch {
    return next(new AppError('Sessão expirada ou inválida. Faça login novamente.', 401, 'SESSAO'));
  }
}

const exigirPerfil = (...perfis) => (req, _res, next) => (
  perfis.includes(req.auth?.perfil)
    ? next()
    : next(new AppError('Você não tem permissão para esta ação.', 403, 'PERMISSAO'))
);

module.exports = { autenticar, exigirPerfil };
