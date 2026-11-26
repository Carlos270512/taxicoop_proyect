import { NuevoReglamento, Reglamento } from './Reglamento';

export interface ReglamentoRepository {
  findAll(): Promise<Reglamento[]>;
  findById(id: string): Promise<Reglamento | null>;
  getRuta(id: string): Promise<{ reglamento: Reglamento; ruta: string } | null>;
  save(data: NuevoReglamento): Promise<Reglamento>;
  remove(id: string): Promise<boolean>;
}
