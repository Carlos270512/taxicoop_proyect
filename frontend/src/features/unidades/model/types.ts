export type UnidadEstado = 'OPERATIVA' | 'EN_TRAMITE' | 'SUSPENDIDA';

export const UNIDAD_ESTADOS: UnidadEstado[] = ['OPERATIVA', 'EN_TRAMITE', 'SUSPENDIDA'];

export type Unidad = {
  id: string;
  numeroUnidad: string;
  placa: string;
  anioVehiculo: number;
  socioId: string;
  estado: UnidadEstado;
  socioNombre?: string;
  socioEstado?: string;
  createdAt?: string;
};

export type UnidadFilters = {
  q: string;
  estado: UnidadEstado | '';
  socioId: string;
  page: number;
  limit: number;
};

export type CreateUnidadInput = {
  numeroUnidad: string;
  placa: string;
  anioVehiculo: number;
  socioId: string;
  estado?: UnidadEstado;
};

export type UpdateUnidadInput = {
  numeroUnidad?: string;
  placa?: string;
  anioVehiculo?: number;
  socioId?: string;
};

export const EMPTY_UNIDAD_FILTERS: UnidadFilters = {
  q: '',
  estado: '',
  socioId: '',
  page: 1,
  limit: 10,
};

export type UnidadFormValues = {
  numeroUnidad: string;
  placa: string;
  anioVehiculo: string;
  socioId: string;
};

export const EMPTY_UNIDAD_FORM: UnidadFormValues = {
  numeroUnidad: '',
  placa: '',
  anioVehiculo: String(new Date().getFullYear()),
  socioId: '',
};
