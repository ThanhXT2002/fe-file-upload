import axiosClient from './axiosClient'
import type { RegisterPayload, RegisterResponseData, UserProfile } from '~/type/authType'
import type { AxiosResponse } from 'axios'

const register = (data: RegisterPayload): Promise<AxiosResponse<RegisterResponseData>> => {
  return axiosClient.post('/auth/register', data)
}

const getProfile = (): Promise<AxiosResponse<UserProfile>> => {
  return axiosClient.get('/auth/profile')
}

const updateProfile = (data: { name?: string }): Promise<AxiosResponse<UserProfile>> => {
  return axiosClient.put('/auth/profile', data)
}

export { register, getProfile, updateProfile }
