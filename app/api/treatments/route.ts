import { NextRequest } from "next/server"
import { query } from "@/lib/db"
import { success, requireAuth, handleApiError } from "@/lib/api-helpers"
import logger from "@/lib/logger"

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const result = await query(
      `SELECT t.*, p.name as patient_name, u.name as dentist_name, pr.name as procedure_name
       FROM treatments t
       JOIN patients p ON p.id = t.patient_id
       JOIN users u ON u.id = t.dentist_id
       LEFT JOIN procedures pr ON pr.id = t.procedure_id
       ORDER BY t.date DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    )

    logger.info({ event: "TREATMENTS_LISTED", userId: session.user.id, count: result.rows.length })
    return success(result.rows)
  } catch (err) {
    return handleApiError(err)
  }
}
