import axios from 'axios'
import type { AxiosResponse } from 'axios'
import type { LoginRequest, LoginResponse } from '../interface/auth'

export function loginApi(request: LoginRequest): Promise<LoginResponse> {
  console.log('发送的登录数据:', JSON.stringify(request))
  return axios.post<LoginResponse>('http://115.175.45.173:8080/api/auth/login', request)
    .then((res: AxiosResponse<LoginResponse>) => res.data)
} 