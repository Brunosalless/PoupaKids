'use strict';

const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

/**
 * Valida o cabeçalho Authorization: Bearer <token> e injeta req.user.
 */
function authMiddleware(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Token não fornecido'));
  }
  const token = header.slice('Bearer '.length).trim();
  try {
    const payload = verifyToken(token);
    req.user = payload;
    return next();
  } catch (err) {
    return next(ApiError.unauthorized('Token inválido ou expirado'));
  }
}

module.exports = authMiddleware;
