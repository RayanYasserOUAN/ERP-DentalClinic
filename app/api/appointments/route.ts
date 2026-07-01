import { NextRequest } from "next/server"
import { query } from "@/lib/db"
import { success, error, requireAuth, handleApiError } from "@/lib/api-helpers"
import logger from "@/lib/logger"
import { auditLog } from "@/lib/audit"

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const result = await query(
      `SELECT a.*, p.name as patient_name, u.name as dentist_name
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN users u ON u.id = a.dentist_id
       ORDER BY a.date DESC, a.start_time ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    )

    const mapped = result.rows.map((r: any) => ({
      id: r.id,
      patientName: r.patient_name,
      patientId: r.patient_id,
      dentistName: r.dentist_name,
      dentistId: r.dentist_id,
      type: r.type,
      date: r.date.toISOString().split("T")[0],
      startTime: r.start_time?.slice(0, 5),
      endTime: r.end_time?.slice(0, 5),
      status: r.status,
      branchId: r.branch_id,
      chair: r.chair,
      room: r.room,
      notes: r.notes,
    }))

    logger.info({ event: "APPOINTMENTS_LISTED", userId: session.user.id, count: mapped.length })
    return success(mapped)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await req.json()
    const result = await query(
      `INSERT INTO appointments (patient_id, dentist_id, branch_id, date, start_time, end_time, type, status, notes, chair, room)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [body.patientId, body.dentistId, body.branchId, body.date, body.startTime, body.endTime, body.type, body.status || "booked", body.notes || null, body.chair || null, body.room || null]
    )
    logger.info({ event: "APPOINTMENT_CREATED", userId: session.user.id, appointmentId: result.rows[0].id, patientId: body.patientId })
    auditLog({ userId: session.user.id, action: "create", entityType: "appointment", entityId: result.rows[0].id }).catch(() => {})
    return success(result.rows[0], 201)
  } catch (err) {
    return handleApiError(err)
  }
}
