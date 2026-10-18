// Encaminha erros de funções async para o errorHandler (Express 4).
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
