export type Reglamento = {
  id: string;
  titulo: string;
  descripcion: string | null;
  nombreOriginal: string;
  mimeType: string;
  tamano: number;
  createdAt: string;
};

export const MAX_REGLAMENTO_BYTES = 10 * 1024 * 1024;

export function formatTamano(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function formatFecha(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' });
}
