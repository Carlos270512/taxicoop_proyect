import { Socio, SocioEstado } from './Socio';

export type SocioFilters = {
  q?: string;
  estado?: SocioEstado;
  page: number;
  limit: number;
};

export type SocioListResult = {
  items: Socio[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type UpdateSocioData = {
  cedulaRuc?: string;
  nombres?: string;
  apellidos?: string;
  telefono?: string;
};

export interface SocioRepository {
  createWithUser(socio: Socio, email: string, passwordHash: string, roles: string[]): Promise<Socio>;
  findAll(filters: SocioFilters): Promise<SocioListResult>;
  findById(id: string): Promise<Socio | null>;
  findByUserId(userId: string): Promise<Socio | null>;
  findByCedula(cedulaRuc: string): Promise<Socio | null>;
  update(id: string, data: UpdateSocioData): Promise<Socio | null>;
  updateEstado(id: string, estado: SocioEstado): Promise<Socio | null>;
  existsEmail(email: string): Promise<boolean>;
}