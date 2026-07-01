import { createClient } from "@/lib/supabase/server"
import { query } from "@/lib/db"
import { success, error } from "@/lib/api-helpers"
import logger from "@/lib/logger"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !authUser) {
      logger.warn("Failed to get current user", { event: "AUTH_ME_FAILURE" })
      return error("AUTHENTICATION_REQUIRED", "Authentication required", 401)
    }

    const result = await query(
      `SELECT u.id, u.name, u.email, u.phone, u.avatar, u.branch_id, u.department, u.status,
              u.last_login, r.name as role, b.name as branch_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN branches b ON b.id = u.branch_id
       WHERE u.id = $1`,
      [authUser.id]
    )

    if (result.rows.length === 0) {
      logger.warn("Authenticated user has no profile", { event: "AUTH_ME_NO_PROFILE", userId: authUser.id })
      return success({
        id: authUser.id,
        name: authUser.user_metadata?.name || authUser.email?.split("@")[0],
        email: authUser.email,
        role: "patient",
        roleId: null,
        branchId: null,
      })
    }

    return success(result.rows[0])
  } catch (err) {
    logger.error({ event: "AUTH_ME_ERROR", error: err instanceof Error ? err.message : String(err) })
    return error("INTERNAL_ERROR", "An unexpected error occurred", 500)
  }
}
