import { query } from "@/lib/db"
import { success, requireAuth, handleApiError } from "@/lib/api-helpers"

export async function GET() {
  try {
    await requireAuth()
    const result = await query(
      `SELECT
        COUNT(*) as total_staff,
        COUNT(*) FILTER (WHERE status = 'active') as active_staff,
        COUNT(*) FILTER (WHERE status = 'on_leave') as on_leave
       FROM users WHERE role_id != (SELECT id FROM roles WHERE name = 'patient')`
    )
    return success(result.rows[0])
  } catch (err) {
    return handleApiError(err)
  }
}
