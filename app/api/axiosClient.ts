import axios, { AxiosError, type AxiosResponse } from "axios";
import type { ApiResponse, ApiResponseOk, ApiResponseError } from "~/type/apiTypes";
import { supabase, setupSupabaseAuth } from './supabaseClient'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// integrate supabase auth with axios defaults
setupSupabaseAuth(axiosClient)

// request interceptor: ensure Authorization header uses latest access token
axiosClient.interceptors.request.use(async (cfg) => {
  try {
    const { data } = await supabase.auth.getSession()
    const session = (data as any)?.session
    if (session?.access_token) {
      cfg.headers = cfg.headers || {}
      cfg.headers['Authorization'] = `Bearer ${session.access_token}`
    }
  } catch {
    // ignore
  }
  return cfg
})

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
  async (error: AxiosError) => {
    // nếu nhận 401 từ BE, cố gắng refresh token thông qua Supabase và replay request
    const status = error.response?.status
    if (status === 401) {
      try {
        // Supabase JS handles session refresh via auth.refreshSession when using a refresh token;
        // here we attempt to get current session and, if expired, use the stored refresh token.
        const { data } = await supabase.auth.getSession()
        const session = (data as any)?.session
        const refresh_token = session?.refresh_token
        if (refresh_token) {
          const refreshed = await supabase.auth.refreshSession({ refresh_token })
          const newSession = (refreshed as any)?.data?.session
          if (newSession?.access_token) {
            // update axios default header
            axios.defaults.headers.common['Authorization'] = `Bearer ${newSession.access_token}`
            if (error.config) {
              error.config.headers = error.config.headers || {}
              error.config.headers['Authorization'] = `Bearer ${newSession.access_token}`
              return axios.request(error.config)
            }
          }
        }
      } catch {
        // refresh failed -> fallthrough to reject original error
      }
    }
    // nếu lỗi network hoặc response không theo ApiResponse
    return Promise.reject(error);
  }
);

export default axiosClient;