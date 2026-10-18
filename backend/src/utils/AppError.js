// Erro de negócio padronizado. Todo service lança AppError quando uma regra é violada;
// o middleware errorHandler converte em resposta HTTP { erro, codigo }.
class AppError extends Error {
  constructor(mensagem, status = 422, codigo = 'REGRA_NEGOCIO') {
    super(mensagem);
    this.name = 'AppError';
    this.status = status;
    this.codigo = codigo;
  }
}

module.exports = AppError;
