import axiosClient from './axiosClient';
import type { RegisterPayload, RegisterResponseData } from '~/type/authType';
import type { AxiosResponse } from 'axios';

const register = (data: RegisterPayload): Promise<AxiosResponse<RegisterResponseData>> => {
  return axiosClient.post('/auth/register', data);
};

export { register };