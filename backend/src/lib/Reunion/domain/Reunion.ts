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

export type ReunionDetalle = Reunion & {
  registros: AsistenciaFila[];
};

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
