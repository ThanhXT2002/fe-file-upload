import axios, { AxiosError, type AxiosResponse } from "axios";
import type { ApiResponse, ApiResponseOk, ApiResponseError } from "~/type/apiTypes";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// response interceptor: nếu BE trả {status: true,...} trả về data, nếu error -> ném ApiError
axiosClient.interceptors.response.use(
  (res: AxiosResponse) => {
    const payload = res.data as ApiResponse;
    if (payload && (payload as ApiResponseOk).status === true) {
      // unwrap BE data into res.data but keep AxiosResponse shape
      res.data = (payload as ApiResponseOk<unknown>).data;
      return res;
    }
    // trường hợp BE trả lỗi cấu trúc ApiResponseError
    const apiErr = payload as ApiResponseError;
    const err = new Error(apiErr?.message ?? "API error") as AxiosError & { api?: ApiResponseError };
    err.api = apiErr;
    return Promise.reject(err);
  },
  (error: AxiosError) => {
    // nếu lỗi network hoặc response không theo ApiResponse
    // đảm bảo luôn reject là AxiosError (có thể kèm error.response.data)
    return Promise.reject(error);
  }
);

export default axiosClient;