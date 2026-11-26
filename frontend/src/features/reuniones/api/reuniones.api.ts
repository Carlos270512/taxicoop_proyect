import { api } from '@shared/api';
import type { ApiResponse, Paginated } from '@shared/api';
import type { MiReunion, Reunion, ReunionDetalle } from '../model/types';

export const reunionesApi = {
  list: (page: number, limit: number) =>
    api.get<Paginated<Reunion>>('/reuniones', { params: { page, limit } }).then((response) => response.data),

  detalle: (id: string) => api.get<ApiResponse<ReunionDetalle>>(`/reuniones/${id}`).then((response) => response.data.data),

  crear: (input: { titulo: string; descripcion: string; fecha: string; eleccionId?: string | null }) =>
    api.post<ApiResponse<Reunion>>('/reuniones', input).then((response) => response.data.data),

  guardarAsistencia: (id: string, registros: Array<{ socioId: string; presente: boolean }>) =>
    api
      .put<ApiResponse<ReunionDetalle>>(`/reuniones/${id}/asistencia`, { registros })
      .then((response) => response.data.data),

  eliminar: (id: string) => api.delete<ApiResponse<null>>(`/reuniones/${id}`).then((response) => response.data),

  mias: () => api.get<ApiResponse<MiReunion[]>>('/reuniones/mias').then((response) => response.data.data),
};
