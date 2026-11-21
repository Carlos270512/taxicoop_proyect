export type SocioEstado = 'ACTIVO' | 'SUSPENDIDO' | 'RETIRADO';

export const SOCIO_ESTADOS: SocioEstado[] = ['ACTIVO', 'SUSPENDIDO', 'RETIRADO'];

export type Socio = {
  id: string;
  userId: string;
  cedulaRuc: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  estado: SocioEstado;
  email?: string;
  unidadesCount?: number;
  createdAt?: string;
};

export type SocioFilters = {
  q: string;
  estado: SocioEstado | '';
  page: number;
  limit: number;
};

export type CreateSocioInput = {
  cedulaRuc: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string;
  password: string;
  estado?: SocioEstado;
};

export type UpdateSocioInput = {
  cedulaRuc?: string;
  nombres?: string;
  apellidos?: string;
  telefono?: string;
};

export const EMPTY_SOCIO_FILTERS: SocioFilters = {
  q: '',
  estado: '',
  page: 1,
  limit: 10,
};

export type SocioFormValues = {
  cedulaRuc: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string;
  password: string;
};

export const EMPTY_SOCIO_FORM: SocioFormValues = {
  cedulaRuc: '',
  nombres: '',
  apellidos: '',
  telefono: '',
  email: '',
  password: '',
};
