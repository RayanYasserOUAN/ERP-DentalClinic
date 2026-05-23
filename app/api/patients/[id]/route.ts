import { NextRequest } from "next/server"
import { query } from "@/lib/db"
import { success, error, requireAuth, handleApiError } from "@/lib/api-helpers"

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/patients/[id]">) {
  try {
    await requireAuth()
    const { id } = await ctx.params
    const result = await query(
      `SELECT p.*,
              (SELECT COUNT(*) FROM appointments WHERE patient_id = p.id) as total_visits,
              (SELECT COALESCE(SUM(total), 0) FROM invoices WHERE patient_id = p.id) as total_spent,
              (SELECT MAX(date) FROM appointments WHERE patient_id = p.id) as last_visit
       FROM patients p WHERE p.id = $1`,
      [id]
    )
    if (result.rows.length === 0) {
      return error("NOT_FOUND", "Patient not found", 404)
    }
    return success(result.rows[0])
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PUT(req: NextRequest, ctx: RouteContext<"/api/patients/[id]">) {
  try {
    await requireAuth()
    const { id } = await ctx.params
    const body = await req.json()
    const result = await query(
      `UPDATE patients SET name = $1, gender = $2, date_of_birth = $3, phone = $4, email = $5,
       address = $6, blood_group = $7, allergies = $8, notes = $9, vip = $10, updated_at = NOW()
       WHERE id = $11 RETURNING *`,
      [body.name, body.gender, body.dateOfBirth, body.phone, body.email, body.address, body.bloodGroup, body.allergies || [], body.notes || "", body.vip || false, id]
    )
    if (result.rows.length === 0) {
      return error("NOT_FOUND", "Patient not found", 404)
    }
    return success(result.rows[0])
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/patients/[id]">) {
  try {
    await requireAuth()
    const { id } = await ctx.params
    const result = await query("DELETE FROM patients WHERE id = $1 RETURNING id", [id])
    if (result.rows.length === 0) {
      return error("NOT_FOUND", "Patient not found", 404)
    }
    return success({ id })
  } catch (err) {
    return handleApiError(err)
  }
}
