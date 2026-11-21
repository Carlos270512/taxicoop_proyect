import { api } from '@shared/api';
import type { ApiResponse, Paginated } from '@shared/api';
import type { CreateUnidadInput, Unidad, UnidadEstado, UnidadFilters, UpdateUnidadInput } from '../model/types';

function toParams(filters: UnidadFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: filters.page,
    limit: filters.limit,
  };

  const q = filters.q.trim();
  if (q) params.q = q;
  if (filters.estado) params.estado = filters.estado;
  if (filters.socioId) params.socioId = filters.socioId;

  return params;
}

export const unidadesApi = {
  list: (filters: UnidadFilters) =>
    api.get<Paginated<Unidad>>('/unidades', { params: toParams(filters) }).then((response) => response.data),

  get: (id: string) =>
    api.get<ApiResponse<Unidad>>(`/unidades/${id}`).then((response) => response.data.data),

  create: (input: CreateUnidadInput) =>
    api.post<ApiResponse<Unidad>>('/unidades', input).then((response) => response.data.data),

  update: (id: string, input: UpdateUnidadInput) =>
    api.put<ApiResponse<Unidad>>(`/unidades/${id}`, input).then((response) => response.data.data),

  changeEstado: (id: string, estado: UnidadEstado) =>
    api.patch<ApiResponse<Unidad>>(`/unidades/${id}/estado`, { estado }).then((response) => response.data.data),

  retire: (id: string) =>
    api.delete<ApiResponse<Unidad>>(`/unidades/${id}`).then((response) => response.data.data),
};
