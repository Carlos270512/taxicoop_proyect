export function formatDate(value?: string): string {
  if (!value) return '—';

  return new Date(value).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function initialsOf(nombres: string, apellidos: string): string {
  return `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
}
