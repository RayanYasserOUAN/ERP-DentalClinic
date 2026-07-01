import { query } from "@/lib/db"
import { success, requireAuth, handleApiError } from "@/lib/api-helpers"
import logger from "@/lib/logger"

export async function GET() {
  try {
    const session = await requireAuth()
    const result = await query(
      `SELECT
        COUNT(*) as total_staff,
        COUNT(*) FILTER (WHERE status = 'active') as active_staff,
        COUNT(*) FILTER (WHERE status = 'on_leave') as on_leave
       FROM users WHERE role_id != (SELECT id FROM roles WHERE name = 'patient')`
    )
    logger.info({ event: "STAFF_SUMMARY_VIEWED", userId: session.user.id })
    return success(result.rows[0])
  } catch (err) {
    return handleApiError(err)
  }
}
