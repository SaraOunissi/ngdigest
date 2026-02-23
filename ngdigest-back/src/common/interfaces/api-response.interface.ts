export interface ApiResponse<T> {
  data: T;
  meta?: ApiMeta;
}

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ApiErrorResponse {
  error: {
    message: string;
    code: string;
    statusCode: number;
  };
}
