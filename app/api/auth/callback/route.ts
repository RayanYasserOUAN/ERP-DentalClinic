import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import logger from "@/lib/logger"

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      logger.info("OAuth callback succeeded", { event: "AUTH_CALLBACK_SUCCESS" })
      return NextResponse.redirect(`${origin}${next}`)
    }
    logger.warn("OAuth callback failed", { event: "AUTH_CALLBACK_FAILURE", error: error.message })
  }

  return NextResponse.redirect(`${origin}/login?error=auth_error`)
}
