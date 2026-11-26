export type AsistenciaRegistro = {
  socioId: string;
  presente: boolean;
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

export type AsistenciaResumen = {
  fecha: string;
  total: number;
  presentes: number;
  ausentes: number;
  sinRegistrar: number;
  registros: AsistenciaFila[];
};
