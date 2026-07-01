import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { success, error } from "@/lib/api-helpers"
import logger from "@/lib/logger"

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json()

    if (!refreshToken) {
      return error("REFRESH_TOKEN_REQUIRED", "Refresh token required", 400)
    }

    const supabase = await createClient()
    const { data, error: refreshError } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    })

    if (refreshError) {
      logger.warn("Token refresh failed", { event: "AUTH_REFRESH_FAILURE", error: refreshError.message })
      return error("INVALID_REFRESH_TOKEN", refreshError.message, 401)
    }

    logger.info("Token refreshed successfully", { event: "AUTH_REFRESH_SUCCESS" })

    return success({
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
    })
  } catch (err) {
    logger.error({ event: "AUTH_REFRESH_ERROR", error: err instanceof Error ? err.message : String(err) })
    return error("INTERNAL_ERROR", "An unexpected error occurred", 500)
  }
}
