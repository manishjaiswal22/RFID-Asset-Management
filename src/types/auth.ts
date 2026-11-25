export interface AuthUser {
  userId: number
  userName: string
  email: string
  contactNumber: string
  userType: string
  stockroomId: number | null
  stockroomName: string | null
  allowedSections?: string[]
}

export interface LoginRequest {
  userName: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message: string
  token?: string
  expiresAt?: string
  refreshToken?: string
  refreshTokenExpiresAt?: string
  user?: AuthUser
}
