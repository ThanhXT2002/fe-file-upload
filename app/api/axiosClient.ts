import axios, { AxiosError, type AxiosResponse } from 'axios'
import type { ApiResponse, ApiResponseOk, ApiResponseError } from '~/type/apiTypes'
import { supabase, setupSupabaseAuth } from './supabaseClient'

// Store API key globally
let globalApiKey: string | null = null

// Function to set API key
export const setApiKey = (apiKey: string) => {
  globalApiKey = apiKey
  // Also set it on axios default headers
  axiosClient.defaults.headers.common['x-api-key'] = apiKey
}

// Function to get current API key
export const getApiKey = () => globalApiKey

// Function to clear API key
export const clearApiKey = () => {
  globalApiKey = null
  delete axiosClient.defaults.headers.common['x-api-key']
}

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// integrate supabase auth with axios defaults
setupSupabaseAuth(axiosClient)

// request interceptor: ensure Authorization header uses latest access token and x-api-key
axiosClient.interceptors.request.use(async (cfg) => {
  try {
    // Prefer the cached Authorization header populated by setupSupabaseAuth/onAuthStateChange.
    // Calling supabase.auth.getSession() on every request can sometimes block or race with
    // the SDK's visibility/auto-refresh logic after tab switches. Use the cached header first
    // and only fall back to getSession() if it's missing.
    cfg.headers = cfg.headers || {}
    const cachedAuth = axiosClient.defaults.headers.common['Authorization'] || axios.defaults.headers.common['Authorization']
    if (cachedAuth) {
      cfg.headers['Authorization'] = cachedAuth
    } else {
      // Fallback: try to read current session (best effort)
      try {
        const { data } = await supabase.auth.getSession()
        const session = (data as any)?.session
        if (session?.access_token) {
          cfg.headers['Authorization'] = `Bearer ${session.access_token}`
        }
      } catch {
        // ignore fallback failure
      }
    }

    // Add x-api-key header if available
    if (globalApiKey) {
      cfg.headers = cfg.headers || {}
      cfg.headers['x-api-key'] = globalApiKey
    }
  } catch {
    // ignore
  }
  return cfg
})

// response interceptor: nếu BE trả {status: true,...} trả về data, nếu error -> ném ApiError
axiosClient.interceptors.response.use(
  (res: AxiosResponse) => {
    const payload = res.data as ApiResponse
    if (payload && (payload as ApiResponseOk).status === true) {
      // unwrap BE data into res.data but keep AxiosResponse shape
      res.data = (payload as ApiResponseOk<unknown>).data
      return res
    }
    // trường hợp BE trả lỗi cấu trúc ApiResponseError
    const apiErr = payload as ApiResponseError
    const err = new Error(apiErr?.message ?? 'API error') as AxiosError & { api?: ApiResponseError }
    err.api = apiErr
    return Promise.reject(err)
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
    return Promise.reject(error)
  }
)

export default axiosClient
