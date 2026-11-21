import { api } from '@shared/api';
import type { ApiResponse } from '@shared/api';
import type { SessionUser } from '../model/types';

export type LoginResponse = {
  token: string;
  user: SessionUser;
};

export const authApi = {
  login: (email: string, password: string) =>
    api
      .post<ApiResponse<LoginResponse>>('/auth/login', { email, password })
      .then((response) => response.data.data),
};
