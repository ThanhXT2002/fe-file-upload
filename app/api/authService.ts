import axiosClient from './axiosClient'
import type { RegisterPayload, RegisterResponseData, UserProfile } from '~/type/authType'
import type { AxiosResponse } from 'axios'
import axios from 'axios'

// Create a separate axios instance for auth endpoints that don't need x-api-key
const authAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// Add authorization header for auth endpoints
authAxios.interceptors.request.use(async (cfg) => {
  try {
    // Import supabase here to avoid circular dependency
    const { supabase } = await import('./supabaseClient')
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

// Add response interceptor for consistent API response handling
authAxios.interceptors.response.use(
  (res: AxiosResponse) => {
    const payload = res.data
    if (payload && payload.status === true) {
      res.data = payload.data
      return res
    }
    const apiErr = payload
    const err = new Error(apiErr?.message ?? 'API error')
    return Promise.reject(err)
  },
  (error) => Promise.reject(error)
)

const register = (data: RegisterPayload): Promise<AxiosResponse<RegisterResponseData>> => {
  return authAxios.post('/auth/register', data)
}

// getProfile doesn't need x-api-key but returns the key
const getProfile = (): Promise<AxiosResponse<UserProfile>> => {
  return authAxios.get('/auth/profile')
}

// updateProfile might need x-api-key, use main axiosClient
const updateProfile = (data: { name?: string }): Promise<AxiosResponse<UserProfile>> => {
  return axiosClient.put('/auth/profile', data)
}

export { register, getProfile, updateProfile }
