import { AsistenciaRegistro, AsistenciaResumen } from './Asistencia';

export interface AsistenciaRepository {
  findByFecha(fecha: string): Promise<AsistenciaResumen>;
  saveMany(fecha: string, registros: AsistenciaRegistro[], registradoPor: string | null): Promise<AsistenciaResumen>;
}
