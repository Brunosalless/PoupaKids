'use strict';

const ApiError = require('../utils/ApiError');

function notFound(_req, _res, next) {
  next(ApiError.notFound('Rota não encontrada'));
}

module.exports = notFound;
