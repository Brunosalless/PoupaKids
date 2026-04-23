'use strict';

const ApiError = require('../utils/ApiError');

function responsavelOnly(req, _res, next) {
  if (!req.user || req.user.tipo !== 'responsavel') {
    return next(ApiError.forbidden('Rota restrita ao perfil Responsável'));
  }
  return next();
}

module.exports = responsavelOnly;
