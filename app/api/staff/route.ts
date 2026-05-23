import { NextRequest } from "next/server"
import { query } from "@/lib/db"
import { success, requireAuth, handleApiError } from "@/lib/api-helpers"

export async function GET(req: NextRequest) {
  try {
    await requireAuth()
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const result = await query(
      `SELECT u.*, r.name as role, b.name as branch_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN branches b ON b.id = u.branch_id
       ORDER BY u.name ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    )

    return success(result.rows)
  } catch (err) {
    return handleApiError(err)
  }
}
