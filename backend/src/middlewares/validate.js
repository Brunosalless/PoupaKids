'use strict';

const ApiError = require('../utils/ApiError');

/**
 * Valida req.body contra um schema Joi. Retorna 400 VALIDATION_ERROR em caso de falha.
 * @param {import('joi').ObjectSchema} schema
 */
function validate(schema) {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const details = error.details.map((d) => ({
        path: d.path.join('.'),
        message: d.message,
      }));
      return next(ApiError.badRequest('Dados inválidos', details));
    }
    req.body = value;
    return next();
  };
}

module.exports = validate;
