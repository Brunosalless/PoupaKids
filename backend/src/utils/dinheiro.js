// Operações monetárias em centavos (inteiros) para evitar erros de ponto flutuante.
const AppError = require('./AppError');

const VALOR_MAXIMO = 10000; // teto por operação (R$ 10.000,00) — ambiente educativo

const paraCentavos = (v) => Math.round(Number(v) * 100);
const deCentavos = (c) => Number((c / 100).toFixed(2));
const brl = (v) => `R$ ${Number(v).toFixed(2).replace('.', ',')}`;

/** Valida um valor monetário informado pelo cliente da API e devolve em centavos. */
function validarValor(valor, campo = 'valor') {
  const n = Number(valor);
  if (valor === undefined || valor === null || valor === '' || !Number.isFinite(n)) {
    throw new AppError(`O campo "${campo}" deve ser um número.`, 400, 'VALIDACAO');
  }
  if (n <= 0) throw new AppError(`O campo "${campo}" deve ser maior que zero.`, 422, 'VALOR_INVALIDO');
  if (Math.abs(n * 100 - Math.round(n * 100)) > 1e-6) {
    throw new AppError(`O campo "${campo}" aceita no máximo duas casas decimais.`, 422, 'VALOR_INVALIDO');
  }
  if (n > VALOR_MAXIMO) {
    throw new AppError(`O valor máximo por operação é ${brl(VALOR_MAXIMO)}.`, 422, 'VALOR_INVALIDO');
  }
  return paraCentavos(n);
}

module.exports = { paraCentavos, deCentavos, validarValor, brl, VALOR_MAXIMO };
