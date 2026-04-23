/**
 * Formata um valor numérico em Real (BRL).
 * Aceita string ou number e é tolerante a inputs inválidos.
 */
export function formatCurrency(value: number | string | null | undefined): string {
  const n = typeof value === 'string' ? parseFloat(value) : value ?? 0;
  if (Number.isNaN(n) || n === null || n === undefined) return 'R$ 0,00';
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}
