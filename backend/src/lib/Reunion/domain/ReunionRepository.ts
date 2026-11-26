import { AsistenciaFila, MiReunion, Reunion, ReunionDetalle } from './Reunion';

export type NuevaReunion = {
  titulo: string;
  descripcion?: string | null;
  fecha: string;
  eleccionId?: string | null;
  creadaPor?: string | null;
};

export type ReunionListResult = {
  items: Reunion[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export interface ReunionRepository {
  findAll(filters: { page: number; limit: number }): Promise<ReunionListResult>;
  findById(id: string): Promise<ReunionDetalle | null>;
  create(data: NuevaReunion): Promise<Reunion>;
  remove(id: string): Promise<boolean>;
  saveAsistencia(reunionId: string, fecha: string, registros: Array<{ socioId: string; presente: boolean }>, userId: string | null): Promise<ReunionDetalle>;
  findMiasBySocioId(socioId: string, userId: string): Promise<MiReunion[]>;
  findUltima(): Promise<{ reunion: Reunion; presentes: number } | null>;
  findUltimaBySocioId(socioId: string): Promise<{ fecha: string; titulo: string; presente: boolean } | null>;
}

export type { AsistenciaFila };
