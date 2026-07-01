import { query } from "@/lib/db"
import { success, requireAuth, handleApiError } from "@/lib/api-helpers"
import logger from "@/lib/logger"

export async function GET() {
  try {
    const session = await requireAuth()
    const result = await query(
      `SELECT u.id, u.name, u.phone, u.avatar, u.email
       FROM users u JOIN roles r ON r.id = u.role_id
       WHERE r.name = 'dentist' AND u.active = TRUE
       ORDER BY u.name ASC`
    )
    logger.info({ event: "DENTISTS_LISTED", userId: session.user.id, count: result.rows.length })
    return success(result.rows)
  } catch (err) {
    return handleApiError(err)
  }
}
