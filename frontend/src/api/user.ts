import axios from 'axios'
import type { AxiosResponse } from 'axios'

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

export function loginApi(email: string, password: string): Promise<LoginResponse> {
  return axios.post<LoginResponse>('http://115.175.45.173:8080/api/auth/login', { email, password })
    .then((res: AxiosResponse<LoginResponse>) => res.data)
} 