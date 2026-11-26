import { api } from '@shared/api';
import type { ApiResponse } from '@shared/api';

export type TaxiEnMapa = {
  socioId: string;
  socioNombre: string;
  socioEstado: string;
  numeroUnidad: string | null;
  placa: string | null;
  unidadEstado: string | null;
  latitud: number;
  longitud: number;
  precisionMetros: number | null;
  capturedAt: string;
};

export const mapaApi = {
  taxis: () => api.get<ApiResponse<TaxiEnMapa[]>>('/ubicaciones/mapa/taxis').then((response) => response.data.data),
};
