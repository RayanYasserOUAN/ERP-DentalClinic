import { query } from "@/lib/db"
import { success, requireAuth, handleApiError } from "@/lib/api-helpers"
import logger from "@/lib/logger"
import { auditLog } from "@/lib/audit"

export async function GET() {
  try {
    const session = await requireAuth()
    const result = await query("SELECT * FROM branches WHERE status = 'active' ORDER BY name ASC")
    logger.info({ event: "BRANCHES_LISTED", userId: session.user.id, count: result.rows.length })
    return success(result.rows)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAuth()
    const body = await req.json()
    const result = await query(
      `INSERT INTO branches (name, address, phone, email, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [body.name, body.address, body.phone, body.email, body.status || "active"]
    )
    logger.info({ event: "BRANCH_CREATED", userId: session.user.id, branchId: result.rows[0].id, branchName: body.name })
    auditLog({ userId: session.user.id, action: "create", entityType: "branch", entityId: result.rows[0].id, details: { name: body.name } }).catch(() => {})
    return success(result.rows[0], 201)
  } catch (err) {
    return handleApiError(err)
  }
}
