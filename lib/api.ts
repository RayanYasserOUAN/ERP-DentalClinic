const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"

let accessToken: string | null = null
let refreshTokenFn: (() => Promise<string | null>) | null = null

export function setTokens(access: string, refresh: string) {
  accessToken = access
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", access)
    localStorage.setItem("refreshToken", refresh)
  }
}

export function clearTokens() {
  accessToken = null
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken
  if (typeof window !== "undefined") {
    accessToken = localStorage.getItem("accessToken")
  }
  return accessToken
}

export function setRefreshHandler(fn: () => Promise<string | null>) {
  refreshTokenFn = fn
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshTokenFn) return refreshTokenFn()
  return null
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Array<{ field: string; message: string }>
  ) {
    super(message)
    this.name = "ApiError"
  }
}

interface RequestConfig {
  method?: string
  body?: unknown
  params?: Record<string, string | number | boolean | undefined>
  headers?: Record<string, string>
}

export async function apiRequest<T = unknown>(path: string, config: RequestConfig = {}): Promise<T> {
  const { method = "GET", body, params, headers = {} } = config

  let url = `${API_BASE}${path}`

  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        searchParams.set(key, String(value))
      }
    })
    const qs = searchParams.toString()
    if (qs) url += `?${qs}`
  }

  const token = getAccessToken()
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  }

  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      requestHeaders["Authorization"] = `Bearer ${newToken}`
      const retryResponse = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
      })
      if (retryResponse.ok) {
        return retryResponse.json()
      }
    }
    clearTokens()
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
    throw new ApiError(401, "UNAUTHORIZED", "Session expired")
  }

  const json = await response.json()

  if (!response.ok) {
    const err = json.error || { code: "UNKNOWN", message: "Unknown error" }
    throw new ApiError(response.status, err.code, err.message, err.details)
  }

  return json
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ data: { user: any; accessToken: string; refreshToken: string } }>("/auth/login", {
      method: "POST",
      body: { email, password },
    }),
  register: (data: { name: string; email: string; password: string }) =>
    apiRequest("/auth/register", { method: "POST", body: data }),
  refresh: (refreshToken: string) =>
    apiRequest<{ data: { accessToken: string; refreshToken: string } }>("/auth/refresh", {
      method: "POST",
      body: { refreshToken },
    }),
  logout: (refreshToken?: string) =>
    apiRequest("/auth/logout", { method: "POST", body: { refreshToken } }),
  me: () => apiRequest<{ data: any }>("/auth/me"),
}

// Dashboard API
export const dashboardApi = {
  stats: () => apiRequest<{ data: any }>("/dashboard/stats"),
  revenue: () => apiRequest<{ data: any[] }>("/dashboard/revenue"),
  todayAppointments: () => apiRequest<{ data: any[] }>("/dashboard/today-appointments"),
}

// Patients API
export const patientsApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    apiRequest<{ data: any[]; pagination?: any }>("/patients", { params }),
  get: (id: string) => apiRequest<{ data: any }>(`/patients/${id}`),
  create: (data: any) => apiRequest<{ data: any }>("/patients", { method: "POST", body: data }),
  update: (id: string, data: any) => apiRequest<{ data: any }>(`/patients/${id}`, { method: "PUT", body: data }),
  delete: (id: string) => apiRequest(`/patients/${id}`, { method: "DELETE" }),
}

// Appointments API
export const appointmentsApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    apiRequest<{ data: any[]; pagination?: any }>("/appointments", { params }),
  get: (id: string) => apiRequest<{ data: any }>(`/appointments/${id}`),
  create: (data: any) => apiRequest<{ data: any }>("/appointments", { method: "POST", body: data }),
  updateStatus: (id: string, status: string) =>
    apiRequest<{ data: any }>(`/appointments/${id}/status`, { method: "PATCH", body: { status } }),
  update: (id: string, data: any) => apiRequest<{ data: any }>(`/appointments/${id}`, { method: "PUT", body: data }),
  delete: (id: string) => apiRequest(`/appointments/${id}`, { method: "DELETE" }),
}

// Billing API
export const billingApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    apiRequest<{ data: any[]; pagination?: any }>("/billing", { params }),
  get: (id: string) => apiRequest<{ data: any }>(`/billing/${id}`),
  create: (data: any) => apiRequest<{ data: any }>("/billing", { method: "POST", body: data }),
  addPayment: (id: string, data: any) =>
    apiRequest<{ data: any }>(`/billing/${id}/payments`, { method: "POST", body: data }),
  summary: () => apiRequest<{ data: any }>("/billing/summary/overview"),
}

// Inventory API
export const inventoryApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    apiRequest<{ data: any[]; pagination?: any }>("/inventory", { params }),
  lowStock: () => apiRequest<{ data: any[] }>("/inventory/low-stock"),
  summary: () => apiRequest<{ data: any }>("/inventory/summary"),
}

// Staff API
export const staffApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    apiRequest<{ data: any[] }>("/staff", { params }),
  dentists: () => apiRequest<{ data: any[] }>("/staff/dentists"),
  summary: () => apiRequest<{ data: any }>("/staff/summary"),
}

// Treatments API
export const treatmentsApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    apiRequest<{ data: any[]; pagination?: any }>("/treatments", { params }),
}

// Branches API
export const branchesApi = {
  list: () => apiRequest<{ data: any[] }>("/branches"),
}

// Notifications API
export const notificationsApi = {
  list: () => apiRequest<{ data: any[] }>("/notifications"),
  markRead: (id: string) => apiRequest(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () => apiRequest("/notifications/mark-all-read", { method: "POST" }),
}
