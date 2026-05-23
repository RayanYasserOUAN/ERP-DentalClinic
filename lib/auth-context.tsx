"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { authApi, setTokens, clearTokens, getAccessToken, setRefreshHandler } from "./api"

interface User {
  id: string
  name: string
  email: string
  role: string
  roleId: string
  branchId: string | null
  branchName?: string
  avatar?: string
  phone?: string
  department?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshHandler = useCallback(async () => {
    const storedRefresh = localStorage.getItem("refreshToken")
    if (!storedRefresh) return null

    try {
      const result = await authApi.refresh(storedRefresh)
      setTokens(result.data.accessToken, result.data.refreshToken)
      return result.data.accessToken
    } catch {
      clearTokens()
      setUser(null)
      return null
    }
  }, [])

  useEffect(() => {
    setRefreshHandler(refreshHandler)
  }, [refreshHandler])

  useEffect(() => {
    async function loadUser() {
      const token = getAccessToken()
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const result = await authApi.me()
        setUser(result.data)
      } catch {
        const newToken = await refreshHandler()
        if (newToken) {
          try {
            const result = await authApi.me()
            setUser(result.data)
          } catch {
            clearTokens()
          }
        } else {
          clearTokens()
        }
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [refreshHandler])

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login(email, password)
    setTokens(result.data.accessToken, result.data.refreshToken)
    setUser(result.data.user)
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken")
    try {
      await authApi.logout(refreshToken || undefined)
    } catch {
      // ignore
    }
    clearTokens()
    setUser(null)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    await authApi.register({ name, email, password })
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
