import { Router } from "express"
import { query } from "../db/pool"
import { authenticate } from "../middleware/auth"

const router = Router()

router.get("/", authenticate, async (req, res, next) => {
  try {
    const { patientId, dentistId, status, page = "1", limit = "50" } = req.query as Record<string, string>
    const offset = (parseInt(page) - 1) * parseInt(limit)
    const conditions: string[] = []
    const params: unknown[] = []
    let idx = 1

    if (patientId) { conditions.push(`t.patient_id = $${idx}`); params.push(patientId); idx++ }
    if (dentistId) { conditions.push(`t.dentist_id = $${idx}`); params.push(dentistId); idx++ }
    if (status) { conditions.push(`t.status = $${idx}`); params.push(status); idx++ }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    const countResult = await query(`SELECT COUNT(*) FROM treatments t ${whereClause}`, params)
    const total = parseInt(countResult.rows[0].count)

    const result = await query(
      `SELECT t.*, p.name as patient_name, u.name as dentist_name
       FROM treatments t
       JOIN patients p ON p.id = t.patient_id
       JOIN users u ON u.id = t.dentist_id
       ${whereClause}
       ORDER BY t.date DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, parseInt(limit), offset]
    )

    const rows = result.rows.map((row: any) => ({
      id: row.id,
      patientId: row.patient_id,
      patientName: row.patient_name,
      dentistId: row.dentist_id,
      dentistName: row.dentist_name,
      procedureName: row.procedure_name,
      toothNumber: row.tooth_number,
      description: row.description,
      status: row.status,
      cost: parseFloat(row.cost),
      notes: row.notes,
      date: row.date,
    }))

    res.json({
      data: rows,
      pagination: { total, limit: parseInt(limit), offset, has_more: offset + parseInt(limit) < total },
      meta: { requestId: req.id },
    })
  } catch (error) {
    next(error)
  }
})

export default router
