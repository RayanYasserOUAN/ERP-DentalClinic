import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { getSession } from "./supabase/server"
import logger from "./logger"

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
    logger.warn("Authentication required but no session found", { event: "AUTH_FAILURE" })
    throw new Error("UNAUTHORIZED")
  }
  return session
}

export function handleApiError(err: unknown, req?: NextRequest) {
  const url = req?.url ? new URL(req.url).pathname : "unknown"

  if (err instanceof Error && err.message === "UNAUTHORIZED") {
    logger.warn("API unauthorized", { event: "API_ERROR", errorCode: "UNAUTHORIZED", route: url })
    return error("AUTHENTICATION_REQUIRED", "Authentication required", 401)
  }

  const message = err instanceof Error ? err.message : "An unexpected error occurred"
  logger.error(
    message,
    {
      event: "API_ERROR",
      errorCode: "INTERNAL_ERROR",
      route: url,
      error: message,
      stack: err instanceof Error ? err.stack : undefined,
    }
  )

  return error("INTERNAL_ERROR", "An unexpected error occurred", 500)
}
