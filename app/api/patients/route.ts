import { NextRequest } from "next/server"
import { query } from "@/lib/db"
import { success, error, requireAuth, handleApiError } from "@/lib/api-helpers"
import logger from "@/lib/logger"
import { auditLog } from "@/lib/audit"

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")
    const vip = searchParams.get("vip")

    let sql = `SELECT p.*,
                (SELECT COUNT(*) FROM appointments WHERE patient_id = p.id) as total_visits,
                (SELECT COALESCE(SUM(total), 0) FROM invoices WHERE patient_id = p.id) as total_spent,
                (SELECT MAX(date) FROM appointments WHERE patient_id = p.id) as last_visit
               FROM patients p WHERE 1=1`
    const params: unknown[] = []
    let paramIndex = 1

    if (search) {
      sql += ` AND (p.name ILIKE $${paramIndex} OR p.phone ILIKE $${paramIndex} OR p.email ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    if (vip === "true") {
      sql += ` AND p.vip = TRUE`
    }

    sql += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const result = await query(sql, params)
    logger.info({ event: "PATIENTS_LISTED", userId: session.user.id, count: result.rows.length, search: search || undefined })
    return success(result.rows)
  } catch (err) {
    return handleApiError(err, req)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await req.json()
    const result = await query(
      `INSERT INTO patients (name, gender, date_of_birth, phone, email, address, blood_group, allergies, notes, vip)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [body.name, body.gender, body.dateOfBirth, body.phone, body.email, body.address, body.bloodGroup, body.allergies || [], body.notes || "", body.vip || false]
    )
    logger.info({ event: "PATIENT_CREATED", userId: session.user.id, patientId: result.rows[0].id, patientName: body.name })
    auditLog({ userId: session.user.id, action: "create", entityType: "patient", entityId: result.rows[0].id, details: { name: body.name } }).catch(() => {})
    return success(result.rows[0], 201)
  } catch (err) {
    return handleApiError(err, req)
  }
}
