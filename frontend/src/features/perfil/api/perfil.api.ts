import { api } from '@shared/api';
import type { ApiResponse } from '@shared/api';
import type { MiPerfil } from '../model/types';

export const perfilApi = {
  me: () => api.get<ApiResponse<MiPerfil>>('/socios/me').then((response) => response.data.data),
};
