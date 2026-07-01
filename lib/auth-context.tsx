"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { authApi, setTokens, clearTokens, getAccessToken, setRefreshHandler } from "./api"

interface AppUser {
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
  user: AppUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function mapUser(authUser: User, appData?: any): AppUser {
  return {
    id: authUser.id,
    name: appData?.name || authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User",
    email: authUser.email || "",
    role: appData?.role || "patient",
    roleId: appData?.role_id || "",
    branchId: appData?.branch_id || null,
    branchName: appData?.branch_name,
    avatar: appData?.avatar || authUser.user_metadata?.avatar_url,
    phone: appData?.phone,
    department: appData?.department,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshHandler = useCallback(async () => {
    const storedRefresh = localStorage.getItem("refreshToken")
    if (!storedRefresh) return null

    try {
      const result = await authApi.refresh(storedRefresh)
      setTokens(result.data.accessToken, result.data.refreshToken)
      return result.data.accessToken
    } catch {
      console.warn("[Auth] Token refresh failed")
      clearTokens()
      setUser(null)
      return null
    }
  }, [])

  useEffect(() => {
    setRefreshHandler(refreshHandler)
  }, [refreshHandler])

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        setTokens(session.access_token, session.refresh_token)
        fetchUserData(session.user.id).then((appData) => {
          setUser(mapUser(session.user, appData))
          console.info("[Auth] Session restored")
          setLoading(false)
        }).catch(() => {
          setUser(mapUser(session.user))
          console.warn("[Auth] Session restored without app profile")
          setLoading(false)
        })
      } else {
        const token = getAccessToken()
        if (!token) {
          setLoading(false)
          return
        }
        loadUserFromApi()
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token) {
        setTokens(session.access_token, session.refresh_token)
        fetchUserData(session.user.id).then((appData) => {
          setUser(mapUser(session.user, appData))
        }).catch(() => {
          setUser(mapUser(session.user))
        })
      } else if (event === "SIGNED_OUT") {
        clearTokens()
        setUser(null)
        console.info("[Auth] User signed out")
      }
    })

    return () => subscription.unsubscribe()
  }, [refreshHandler])

  async function fetchUserData(userId: string) {
    const res = await fetch(`/api/auth/me`)
    if (res.ok) {
      const json = await res.json()
      return json.data
    }
    return null
  }

  async function loadUserFromApi() {
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

  const login = useCallback(async (email: string, password: string) => {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) throw error

    if (data.session) {
      setTokens(data.session.access_token, data.session.refresh_token)
    }

    const meResult = await authApi.me()
    setUser(meResult.data)
    console.info("[Auth] Login successful", { email, role: meResult.data?.role })
  }, [])

  const logout = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    clearTokens()
    setUser(null)
    console.info("[Auth] Logout successful")
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) throw error

    await authApi.register({ name, email, password })
    console.info("[Auth] Registration successful", { email })
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
