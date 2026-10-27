import { Unidad } from './Unidad';

export interface UnidadRepository {
  save(unidad: Unidad): Promise<Unidad>;
  findAll(): Promise<Unidad[]>;
  findById(id: string): Promise<Unidad | null>;
}