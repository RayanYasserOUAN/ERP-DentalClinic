import { NextRequest } from "next/server"
import { query } from "@/lib/db"
import { success, error, requireAuth, handleApiError } from "@/lib/api-helpers"
import logger from "@/lib/logger"
import { auditLog } from "@/lib/audit"

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/appointments/[id]">) {
  try {
    await requireAuth()
    const { id } = await ctx.params
    const result = await query(
      `SELECT a.*, p.name as patient_name, u.name as dentist_name
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN users u ON u.id = a.dentist_id
       WHERE a.id = $1`,
      [id]
    )
    if (result.rows.length === 0) {
      return error("NOT_FOUND", "Appointment not found", 404)
    }
    return success(result.rows[0])
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PUT(req: NextRequest, ctx: RouteContext<"/api/appointments/[id]">) {
  try {
    const session = await requireAuth()
    const { id } = await ctx.params
    const body = await req.json()
    const result = await query(
      `UPDATE appointments SET patient_id = $1, dentist_id = $2, branch_id = $3, date = $4,
       start_time = $5, end_time = $6, type = $7, status = $8, notes = $9, chair = $10, room = $11,
       updated_at = NOW() WHERE id = $12 RETURNING *`,
      [body.patientId, body.dentistId, body.branchId, body.date, body.startTime, body.endTime, body.type, body.status, body.notes, body.chair, body.room, id]
    )
    if (result.rows.length === 0) {
      return error("NOT_FOUND", "Appointment not found", 404)
    }
    logger.info({ event: "APPOINTMENT_UPDATED", userId: session.user.id, appointmentId: id, status: body.status })
    return success(result.rows[0])
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/appointments/[id]">) {
  try {
    const session = await requireAuth()
    const { id } = await ctx.params
    const result = await query("DELETE FROM appointments WHERE id = $1 RETURNING id", [id])
    if (result.rows.length === 0) {
      return error("NOT_FOUND", "Appointment not found", 404)
    }
    logger.info({ event: "APPOINTMENT_DELETED", userId: session.user.id, appointmentId: id })
    auditLog({ userId: session.user.id, action: "delete", entityType: "appointment", entityId: id }).catch(() => {})
    return success({ id })
  } catch (err) {
    return handleApiError(err)
  }
}
