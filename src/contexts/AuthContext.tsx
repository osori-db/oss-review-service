'use client'

import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react'

interface AuthContextValue {
  readonly token: string | null
  readonly setToken: (token: string) => void
  readonly clearToken: () => void
  readonly isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'oss-review-auth-token'

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      setTokenState(stored)
    }
    setInitialized(true)
  }, [])

  const setToken = useCallback((newToken: string) => {
    const trimmed = newToken.trim()
    if (!trimmed) return
    sessionStorage.setItem(STORAGE_KEY, trimmed)
    setTokenState(trimmed)
  }, [])

  const clearToken = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    setTokenState(null)
  }, [])

  if (!initialized) {
    return null
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        clearToken,
        isAuthenticated: token !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
