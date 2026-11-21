import { api } from '@shared/api';
import type { ApiResponse, Paginated } from '@shared/api';
import type { CreateSocioInput, Socio, SocioEstado, SocioFilters, UpdateSocioInput } from '../model/types';

function toParams(filters: SocioFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: filters.page,
    limit: filters.limit,
  };

  const q = filters.q.trim();
  if (q) params.q = q;
  if (filters.estado) params.estado = filters.estado;

  return params;
}

export const sociosApi = {
  list: (filters: SocioFilters) =>
    api.get<Paginated<Socio>>('/socios', { params: toParams(filters) }).then((response) => response.data),

  get: (id: string) =>
    api.get<ApiResponse<Socio>>(`/socios/${id}`).then((response) => response.data.data),

  create: (input: CreateSocioInput) =>
    api.post<ApiResponse<Socio>>('/socios', input).then((response) => response.data.data),

  update: (id: string, input: UpdateSocioInput) =>
    api.put<ApiResponse<Socio>>(`/socios/${id}`, input).then((response) => response.data.data),

  changeEstado: (id: string, estado: SocioEstado) =>
    api.patch<ApiResponse<Socio>>(`/socios/${id}/estado`, { estado }).then((response) => response.data.data),

  retire: (id: string) =>
    api.delete<ApiResponse<Socio>>(`/socios/${id}`).then((response) => response.data.data),
};
