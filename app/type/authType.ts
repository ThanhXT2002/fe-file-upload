// Types for auth-related payloads and responses
export type RegisterPayload = {
  email: string
  password: string
  passwordConfirm?: string
}

// Minimal shape for register response data. Adjust when backend shape is known.
export type RegisterResponseData = {
  message?: string
  user?: {
    id?: string
    email?: string
    [k: string]: unknown
  }
  [k: string]: unknown
}

export type UserProfile = {
  id: string
  email: string
  name?: string
  key: string
  role: 'ADMIN' | 'USER' | 'EDITOR'
  avatarUrl?: string
  createdAt: string
}

export default {} as const
