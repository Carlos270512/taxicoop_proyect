export type ReunionEstadoAsistencia = 'PRESENTE' | 'AUSENTE' | 'SIN_REGISTRAR';

export type Reunion = {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha: string;
  eleccionId: string | null;
  eleccionTitulo: string | null;
  eleccionEstado: string | null;
  totalSocios: number;
  presentes: number;
  createdAt: string;
};

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

export type ReunionDetalle = Reunion & { registros: AsistenciaFila[] };

export type MiReunion = {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha: string;
  asistencia: ReunionEstadoAsistencia;
  eleccionId: string | null;
  eleccionTitulo: string | null;
  eleccionEstado: string | null;
  yaVoto: boolean;
};

export function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatFechaLarga(fecha: string): string {
  const date = new Date(`${fecha}T12:00:00`);
  if (Number.isNaN(date.getTime())) return fecha;

  return date.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function porcentajeAsistencia(reunion: Pick<Reunion, 'presentes' | 'totalSocios'>): number {
  if (reunion.totalSocios === 0) return 0;
  return Math.round((reunion.presentes / reunion.totalSocios) * 100);
}
