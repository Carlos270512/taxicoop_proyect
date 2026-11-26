import { Unidad, UnidadEstado } from './Unidad';

export type UnidadFilters = {
  q?: string;
  estado?: UnidadEstado;
  socioId?: string;
  page: number;
  limit: number;
};

export type UnidadListResult = {
  items: Unidad[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type UpdateUnidadData = {
  numeroUnidad?: string;
  placa?: string;
  anioVehiculo?: number;
  socioId?: string;
};

export interface UnidadRepository {
  save(unidad: Unidad, extras?: { fechaExpiracion?: Date | null; matriculaArchivoId?: string | null }): Promise<Unidad>;
  findAll(filters: UnidadFilters): Promise<UnidadListResult>;
  findById(id: string): Promise<Unidad | null>;
  findByPlaca(placa: string): Promise<Unidad | null>;
  findByNumero(numeroUnidad: string): Promise<Unidad | null>;
  update(id: string, data: UpdateUnidadData): Promise<Unidad | null>;
  updateEstado(id: string, estado: UnidadEstado): Promise<Unidad | null>;
  suspendBySocioId(socioId: string): Promise<number>;
}