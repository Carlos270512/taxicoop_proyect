export type AsistenciaFila = {
  socioId: string;
  cedulaRuc: string;
  nombre: string;
  telefono: string;
  estado: 'ACTIVO' | 'SUSPENDIDO' | 'RETIRADO';
  unidades: number;
  presente: boolean;
  marcada: boolean;
};

export type AsistenciaResumen = {
  fecha: string;
  total: number;
  presentes: number;
  ausentes: number;
  sinRegistrar: number;
  registros: AsistenciaFila[];
};

export function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatFechaLarga(fecha: string): string {
  const date = new Date(`${fecha}T12:00:00`);
  return date.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
