export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface RegisterResponse {
  message: string
}

export interface VerifyRequest {
  email: string
  code: string
}

export interface VerifyResponse {
  success: boolean
  message: string
}
