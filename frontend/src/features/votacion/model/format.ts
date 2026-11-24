export function formatPeriod(startDate: string, endDate: string): string {
  const format = (value: string) =>
    new Date(value).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });

  return `${format(startDate)} — ${format(endDate)}`;
}
