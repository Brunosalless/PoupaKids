import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDate(value: string | Date, pattern = "dd/MM/yyyy"): string {
  const d = typeof value === 'string' ? parseISO(value) : value;
  if (!isValid(d)) return '';
  return format(d, pattern, { locale: ptBR });
}

export function formatDateTime(value: string | Date): string {
  return formatDate(value, "dd/MM/yyyy 'às' HH:mm");
}
