import { api } from '@shared/api';
import type { ApiResponse } from '@shared/api';
import type { SaveUbicacionInput, SocioUbicacion, Ubicacion } from '../model/types';

export const ubicacionApi = {
  me: () => api.get<ApiResponse<Ubicacion | null>>('/ubicaciones/me').then((response) => response.data.data),

  save: (input: SaveUbicacionInput) =>
    api.post<ApiResponse<Ubicacion>>('/ubicaciones/me', input).then((response) => response.data.data),

  bySocio: (socioId: string) =>
    api.get<ApiResponse<SocioUbicacion>>(`/ubicaciones/${socioId}`).then((response) => response.data.data),
};
