// Tratamento centralizado de erros: AppError → status/mensagem de negócio;
// erros do Sequelize → 422/409; demais → 500 sem vazar detalhes internos.
const AppError = require('../utils/AppError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ erro: err.message, codigo: err.codigo });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.', codigo: 'VALIDACAO' });
  }
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ erro: 'Registro duplicado.', codigo: 'DUPLICADO' });
  }
  if (err.name === 'SequelizeValidationError') {
    return res.status(422).json({ erro: err.errors.map((e) => e.message).join('; '), codigo: 'VALIDACAO' });
  }
  if (process.env.NODE_ENV !== 'test') console.error('[erro interno]', err);
  return res.status(500).json({ erro: 'Erro interno do servidor.', codigo: 'ERRO_INTERNO' });
}

function naoEncontrado(req, res) {
  res.status(404).json({ erro: `Rota não encontrada: ${req.method} ${req.originalUrl}`, codigo: 'ROTA_INEXISTENTE' });
}

module.exports = { errorHandler, naoEncontrado };
