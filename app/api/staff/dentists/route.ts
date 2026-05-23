import { query } from "@/lib/db"
import { success, requireAuth, handleApiError } from "@/lib/api-helpers"

export async function GET() {
  try {
    await requireAuth()
    const result = await query(
      `SELECT u.id, u.name, u.phone, u.avatar, u.email
       FROM users u JOIN roles r ON r.id = u.role_id
       WHERE r.name = 'dentist' AND u.active = TRUE
       ORDER BY u.name ASC`
    )
    return success(result.rows)
  } catch (err) {
    return handleApiError(err)
  }
}
