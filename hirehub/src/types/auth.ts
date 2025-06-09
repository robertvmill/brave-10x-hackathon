export type UserType = 'candidate' | 'recruiter'

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
  userType: UserType
  company?: string // Required for recruiters
  title?: string // Job title/position
  phoneNumber?: string
  agreeToTerms: boolean
}

export interface AuthUser {
  id: string
  email: string
  fullName: string
  userType: UserType
  company?: string
  title?: string
  phoneNumber?: string
  createdAt: string
  emailVerified: boolean
} 