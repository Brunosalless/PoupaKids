/**
 * Máscaras pt-BR e helpers de validação.
 * Todas trabalham sobre strings de dígitos, truncando no tamanho máximo.
 */

export function onlyDigits(v: string): string {
  return (v || '').replace(/\D/g, '');
}

/** 000.000.000-00 */
export function maskCPF(v: string): string {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/** (00) 00000-0000 (celular) ou (00) 0000-0000 (fixo) */
export function maskPhone(v: string): string {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** DD/MM/AAAA */
export function maskDate(v: string): string {
  const d = onlyDigits(v).slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

/** Converte DD/MM/AAAA para AAAA-MM-DD (ISO). Retorna string vazia se inválido. */
export function brDateToISO(v: string): string {
  const d = onlyDigits(v);
  if (d.length !== 8) return '';
  const dia = d.slice(0, 2);
  const mes = d.slice(2, 4);
  const ano = d.slice(4);
  const date = new Date(`${ano}-${mes}-${dia}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  if (date.getDate() !== Number(dia)) return '';
  return `${ano}-${mes}-${dia}`;
}

/** Validação oficial do CPF (algoritmo dos dígitos verificadores). */
export function isValidCPF(cpf: string): boolean {
  const d = onlyDigits(cpf);
  if (d.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(d)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i += 1) sum += Number(d[i]) * (10 - i);
  let r = (sum * 10) % 11;
  if (r >= 10) r = 0;
  if (r !== Number(d[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i += 1) sum += Number(d[i]) * (11 - i);
  r = (sum * 10) % 11;
  if (r >= 10) r = 0;
  return r === Number(d[10]);
}

/** Telefone BR: aceita fixo (10 dígitos) ou celular (11). */
export function isValidPhone(v: string): boolean {
  const d = onlyDigits(v);
  return d.length === 10 || d.length === 11;
}

/** Data válida no formato DD/MM/AAAA e plausível (ano entre 1900 e hoje). */
export function isValidBRDate(v: string): boolean {
  const iso = brDateToISO(v);
  if (!iso) return false;
  const date = new Date(`${iso}T00:00:00`);
  const minYear = 1900;
  const hoje = new Date();
  return date.getFullYear() >= minYear && date <= hoje;
}
