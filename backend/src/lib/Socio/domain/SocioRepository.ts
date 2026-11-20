import { Socio } from './Socio';

export interface SocioRepository {
  save(socio: Socio): Promise<Socio>;
  findAll(): Promise<Socio[]>;
  findById(id: string): Promise<Socio | null>;
}