export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type Paginated<T> = ApiResponse<T[]> & {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type ApiError = {
  success: false;
  error: string;
};
