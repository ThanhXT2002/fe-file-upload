export type ApiResponseOk<T = unknown> = {
  status: true;
  code: number;
  data: T;
  message: string;
  timestamp: string;
};

export type ApiResponseError = {
  status: false;
  code: number;
  errors: string | Record<string, unknown>;
  message: string;
  timestamp: string;
};

export type ApiResponse<T = unknown> = ApiResponseOk<T> | ApiResponseError;