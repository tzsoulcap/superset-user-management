export interface UserRegistration {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  registration_date: string
}

export interface LoginCredentials {
  username: string
  password: string
  provider?: string
  refresh?: boolean
}

export interface AuthState {
  token: string | null
  csrfToken: string | null
}
