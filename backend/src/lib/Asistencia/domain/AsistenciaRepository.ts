import { AsistenciaRegistro, AsistenciaResumen } from './Asistencia';

export interface AsistenciaRepository {
  findByFecha(fecha: string): Promise<AsistenciaResumen>;
  saveMany(fecha: string, registros: AsistenciaRegistro[], registradoPor: string | null): Promise<AsistenciaResumen>;
  findUltimaFecha(): Promise<string | null>;
  findUltimaBySocioId(socioId: string): Promise<{ fecha: string; presente: boolean } | null>;
  countPresentesByFecha(fecha: string): Promise<number>;
}
