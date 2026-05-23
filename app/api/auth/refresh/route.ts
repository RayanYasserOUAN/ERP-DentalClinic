import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { success, error } from "@/lib/api-helpers"

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
      return error("INVALID_REFRESH_TOKEN", refreshError.message, 401)
    }

    return success({
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
    })
  } catch (err) {
    console.error("Refresh error:", err)
    return error("INTERNAL_ERROR", "An unexpected error occurred", 500)
  }
}
