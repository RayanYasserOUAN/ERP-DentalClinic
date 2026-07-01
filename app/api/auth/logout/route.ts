import { createClient } from "@/lib/supabase/server"
import { success, error } from "@/lib/api-helpers"
import logger from "@/lib/logger"
import { auditLog } from "@/lib/audit"

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.auth.signOut()

    if (user) {
      logger.info("User logged out", { event: "AUTH_LOGOUT", userId: user.id, email: user.email })
      auditLog({ userId: user.id, action: "logout", entityType: "user", entityId: user.id }).catch(() => {})
    }

    return success({ message: "Logged out successfully" })
  } catch (err) {
    logger.error({ event: "AUTH_LOGOUT_ERROR", error: err instanceof Error ? err.message : String(err) })
    return error("INTERNAL_ERROR", "An unexpected error occurred", 500)
  }
}
