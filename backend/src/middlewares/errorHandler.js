'use strict';

const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  if (err && err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: { code: 'CONFLICT', message: 'Registro duplicado', details: err.errors?.map((e) => e.message) },
    });
  }

  if (err && err.name === 'SequelizeDatabaseError') {
    const msg = err.parent?.sqlMessage || err.message;
    if (msg && msg.toLowerCase().includes('idade')) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Idade do usuário deve ser menor que 18' },
      });
    }
    if (msg && msg.toLowerCase().includes('saldo')) {
      return res.status(422).json({
        error: { code: 'INSUFFICIENT_BALANCE', message: 'Saldo não pode ficar negativo' },
      });
    }
  }

  // eslint-disable-next-line no-console
  console.error('[error]', err);
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' },
  });
}

module.exports = errorHandler;
