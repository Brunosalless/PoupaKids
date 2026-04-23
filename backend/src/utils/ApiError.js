'use strict';

class ApiError extends Error {
  constructor(statusCode, code, message, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static badRequest(message, details) {
    return new ApiError(400, 'VALIDATION_ERROR', message, details);
  }

  static unauthorized(message = 'Token inválido ou expirado') {
    return new ApiError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = 'Acesso não autorizado') {
    return new ApiError(403, 'FORBIDDEN', message);
  }

  static notFound(message = 'Recurso não encontrado') {
    return new ApiError(404, 'NOT_FOUND', message);
  }

  static conflict(message) {
    return new ApiError(409, 'CONFLICT', message);
  }

  static insufficientBalance(message = 'Saldo insuficiente para esta operação') {
    return new ApiError(422, 'INSUFFICIENT_BALANCE', message);
  }
}

module.exports = ApiError;
