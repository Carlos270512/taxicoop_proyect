import { api } from '@shared/api';
import type { ApiResponse } from '@shared/api';
import type { AsistenciaResumen } from '../model/types';

export const asistenciaApi = {
  get: (fecha: string) =>
    api.get<ApiResponse<AsistenciaResumen>>('/asistencias', { params: { fecha } }).then((response) => response.data.data),

  save: (fecha: string, registros: Array<{ socioId: string; presente: boolean }>) =>
    api
      .put<ApiResponse<AsistenciaResumen>>('/asistencias', { fecha, registros })
      .then((response) => response.data.data),
};
