import { NuevaUbicacion, Ubicacion } from './Ubicacion';

export interface UbicacionRepository {
  save(data: NuevaUbicacion): Promise<Ubicacion>;
  findLatestBySocioId(socioId: string): Promise<Ubicacion | null>;
  findHistoryBySocioId(socioId: string, limit: number): Promise<Ubicacion[]>;
}
