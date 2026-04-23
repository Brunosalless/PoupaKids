/**
 * Retorna true quando a data de nascimento indica idade < 18.
 */
export function validateAge(dataNascimento: string | Date): boolean {
  const nasc = typeof dataNascimento === 'string' ? new Date(dataNascimento) : dataNascimento;
  if (Number.isNaN(nasc.getTime())) return false;

  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const mes = hoje.getMonth() - nasc.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) {
    idade -= 1;
  }
  return idade >= 0 && idade < 18;
}

export function calcularIdade(dataNascimento: string | Date): number {
  const nasc = typeof dataNascimento === 'string' ? new Date(dataNascimento) : dataNascimento;
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const mes = hoje.getMonth() - nasc.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) idade -= 1;
  return idade;
}
