import { NextResponse } from "next/server"
import crypto from "crypto"
import { getSession } from "./supabase/server"

export function success(data: unknown, status = 200) {
  return NextResponse.json(
    { data, meta: { requestId: crypto.randomUUID() } },
    { status }
  )
}

export function error(code: string, message: string, status = 400, details?: Array<{ field: string; message: string }>) {
  return NextResponse.json(
    { error: { code, message, ...(details ? { details } : {}) } },
    { status }
  )
}

export async function requireAuth() {
  const session = await getSession()
  if (!session?.user) {
    throw new Error("UNAUTHORIZED")
  }
  return session
}

export function handleApiError(err: unknown) {
  console.error("API Error:", err)
  if (err instanceof Error && err.message === "UNAUTHORIZED") {
    return error("AUTHENTICATION_REQUIRED", "Authentication required", 401)
  }
  return error("INTERNAL_ERROR", "An unexpected error occurred", 500)
}
