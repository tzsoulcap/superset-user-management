'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactNode,
} from 'react'
import { loginToSuperset, fetchCsrfToken } from '@/lib/auth'
import { DEFAULT_SERVER } from '@/lib/servers'

interface AuthContextValue {
  token: string | null
  csrfToken: string | null
  supersetUrl: string
  isAuthenticated: boolean
  login: (username: string, password: string, supersetUrl: string) => Promise<void>
  logout: () => void
  refreshCsrf: () => Promise<string>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const [supersetUrl, setSupersetUrl] = useState<string>(DEFAULT_SERVER.url)

  const login = useCallback(async (username: string, password: string, url: string) => {
    const jwt = await loginToSuperset(username, password, url)
    const csrf = await fetchCsrfToken(jwt, url)
    setToken(jwt)
    setCsrfToken(csrf)
    setSupersetUrl(url)
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setCsrfToken(null)
    setSupersetUrl(DEFAULT_SERVER.url)
  }, [])

  const refreshCsrf = useCallback(async (): Promise<string> => {
    if (!token) throw new Error('Not authenticated')
    const csrf = await fetchCsrfToken(token, supersetUrl)
    setCsrfToken(csrf)
    return csrf
  }, [token, supersetUrl])

  return (
    <AuthContext.Provider
      value={{
        token,
        csrfToken,
        supersetUrl,
        isAuthenticated: !!token,
        login,
        logout,
        refreshCsrf,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
