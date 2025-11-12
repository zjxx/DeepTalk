export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  token: string;
  username: string;
  email: string;
  expiration: string;
  userId: string;
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
  username: string;
  password: string;
  email: string;
  verificationCode: string;
}

export interface VerifyResponse {
  message: string;
}

export interface ForgotPasswordSendCodeRequest {
  email: string;
}

export interface ForgotPasswordSendCodeResponse {
  message: string;
}

export interface ResetPasswordRequest {
  email: string;
  verificationCode: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface LogoutResponse {
  message: string;
}

export interface UpdateAvatarRequest {
  userId: string;
  avatar: string;
}

export interface UpdateAvatarResponse {
  success: boolean;
  message: string;
  avatar?: string;
  avatarUrl?: string;  // 七牛云上传返回的 URL
}