import { NextRequest } from "next/server"
import { query } from "@/lib/db"
import { success, error, requireAuth, handleApiError } from "@/lib/api-helpers"
import logger from "@/lib/logger"
import { auditLog } from "@/lib/audit"

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/appointments/[id]/status">) {
  try {
    const session = await requireAuth()
    const { id } = await ctx.params
    const { status: newStatus } = await req.json()

    const validStatuses = ["booked", "confirmed", "waiting", "in_treatment", "completed", "cancelled", "no_show"]
    if (!validStatuses.includes(newStatus)) {
      return error("INVALID_STATUS", `Status must be one of: ${validStatuses.join(", ")}`)
    }

    const result = await query(
      "UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [newStatus, id]
    )
    if (result.rows.length === 0) {
      return error("NOT_FOUND", "Appointment not found", 404)
    }
    logger.info({ event: "APPOINTMENT_STATUS_CHANGED", userId: session.user.id, appointmentId: id, status: newStatus })
    auditLog({ userId: session.user.id, action: "update", entityType: "appointment", entityId: id, details: { status: newStatus } }).catch(() => {})
    return success(result.rows[0])
  } catch (err) {
    return handleApiError(err)
  }
}
