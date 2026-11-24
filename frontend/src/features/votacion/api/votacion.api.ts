import { api } from '@shared/api';
import type { ApiResponse, Paginated } from '@shared/api';
import type { CreateElectionInput, Election, ElectionFilters, ElectionResults, ElectionStatus } from '../model/types';

function toParams(filters: ElectionFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: filters.page,
    limit: filters.limit,
  };

  if (filters.status) params.status = filters.status;

  return params;
}

export const votacionApi = {
  list: (filters: ElectionFilters) =>
    api.get<Paginated<Election>>('/votacion/elections', { params: toParams(filters) }).then((response) => response.data),

  active: () =>
    api.get<ApiResponse<Election[]>>('/votacion/elections/active').then((response) => response.data.data),

  get: (id: string) =>
    api.get<ApiResponse<Election>>(`/votacion/elections/${id}`).then((response) => response.data.data),

  results: (id: string) =>
    api.get<ApiResponse<ElectionResults>>(`/votacion/elections/${id}/results`).then((response) => response.data.data),

  create: (input: CreateElectionInput) =>
    api.post<ApiResponse<Election>>('/votacion/elections', input).then((response) => response.data.data),

  changeStatus: (id: string, status: ElectionStatus) =>
    api.patch<ApiResponse<Election>>(`/votacion/elections/${id}/status`, { status }).then((response) => response.data.data),

  vote: (electionId: string, optionId: string) =>
    api.post<ApiResponse<unknown>>('/votacion/vote', { electionId, optionId }).then((response) => response.data),
};
