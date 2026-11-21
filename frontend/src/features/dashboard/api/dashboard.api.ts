import { api } from '@shared/api';
import type { ApiResponse } from '@shared/api';
import type { DashboardSummary } from '../model/types';

export const dashboardApi = {
  summary: () =>
    api.get<ApiResponse<DashboardSummary>>('/dashboard/summary').then((response) => response.data.data),
};
