import { Router } from "express"
import { z } from "zod"
import { query } from "../db/pool"
import { authenticate } from "../middleware/auth"
import { validate } from "../middleware/validate"

const router = Router()

const CreateAppointmentSchema = z.object({
  patientId: z.string().uuid(),
  dentistId: z.string().uuid(),
  branchId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  type: z.string().min(1).max(100),
  notes: z.string().optional().nullable(),
  chair: z.string().max(50).optional().nullable(),
  room: z.string().max(50).optional().nullable(),
})

router.get("/", authenticate, async (req, res, next) => {
  try {
    const { date, status, dentistId, patientId, branchId, startDate, endDate, page = "1", limit = "50" } = req.query as Record<string, string>
    const offset = (parseInt(page) - 1) * parseInt(limit)
    const conditions: string[] = []
    const params: unknown[] = []
    let idx = 1

    if (date) { conditions.push(`a.date = $${idx}`); params.push(date); idx++ }
    if (status) { conditions.push(`a.status = $${idx}`); params.push(status); idx++ }
    if (dentistId) { conditions.push(`a.dentist_id = $${idx}`); params.push(dentistId); idx++ }
    if (patientId) { conditions.push(`a.patient_id = $${idx}`); params.push(patientId); idx++ }
    if (branchId) { conditions.push(`a.branch_id = $${idx}`); params.push(branchId); idx++ }
    if (startDate) { conditions.push(`a.date >= $${idx}`); params.push(startDate); idx++ }
    if (endDate) { conditions.push(`a.date <= $${idx}`); params.push(endDate); idx++ }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    const countResult = await query(`SELECT COUNT(*) FROM appointments a ${whereClause}`, params)
    const total = parseInt(countResult.rows[0].count)

    const result = await query(
      `SELECT a.*, p.name as patient_name, p.avatar as patient_avatar,
              u.name as dentist_name
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN users u ON u.id = a.dentist_id
       ${whereClause}
       ORDER BY a.date DESC, a.start_time ASC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, parseInt(limit), offset]
    )

    const rows = result.rows.map((row: any) => ({
      id: row.id,
      patientId: row.patient_id,
      patientName: row.patient_name,
      patientAvatar: row.patient_avatar,
      dentistId: row.dentist_id,
      dentistName: row.dentist_name,
      branchId: row.branch_id,
      date: row.date,
      startTime: row.start_time,
      endTime: row.end_time,
      type: row.type,
      status: row.status,
      notes: row.notes,
      chair: row.chair,
      room: row.room,
      createdAt: row.created_at,
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

router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT a.*, p.name as patient_name, p.avatar as patient_avatar, p.phone as patient_phone,
              u.name as dentist_name, u.email as dentist_email
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN users u ON u.id = a.dentist_id
       WHERE a.id = $1`,
      [req.params.id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "Appointment not found" } })
      return
    }

    const row = result.rows[0]
    res.json({
      data: {
        id: row.id,
        patientId: row.patient_id,
        patientName: row.patient_name,
        patientAvatar: row.patient_avatar,
        patientPhone: row.patient_phone,
        dentistId: row.dentist_id,
        dentistName: row.dentist_name,
        dentistEmail: row.dentist_email,
        branchId: row.branch_id,
        date: row.date,
        startTime: row.start_time,
        endTime: row.end_time,
        type: row.type,
        status: row.status,
        notes: row.notes,
        chair: row.chair,
        room: row.room,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
      meta: { requestId: req.id },
    })
  } catch (error) {
    next(error)
  }
})

router.post("/", authenticate, validate(CreateAppointmentSchema), async (req, res, next) => {
  try {
    const { patientId, dentistId, branchId, date, startTime, endTime, type, notes, chair, room } = req.body

    const result = await query(
      `INSERT INTO appointments (patient_id, dentist_id, branch_id, date, start_time, end_time, type, notes, chair, room)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [patientId, dentistId, branchId, date, startTime, endTime, type, notes || null, chair || null, room || null]
    )

    res.status(201).json({ data: { id: result.rows[0].id }, meta: { requestId: req.id } })
  } catch (error) {
    next(error)
  }
})

router.patch("/:id/status", authenticate, validate(z.object({ status: z.enum(["booked", "confirmed", "waiting", "in_treatment", "completed", "cancelled", "no_show"]) })), async (req, res, next) => {
  try {
    await query("UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2", [req.body.status, req.params.id])
    res.json({ data: { message: "Status updated" }, meta: { requestId: req.id } })
  } catch (error) {
    next(error)
  }
})

router.put("/:id", authenticate, validate(CreateAppointmentSchema.partial()), async (req, res, next) => {
  try {
    const fields: string[] = []
    const params: unknown[] = []
    let idx = 1

    for (const [key, value] of Object.entries(req.body)) {
      const dbKey = key.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`)
      fields.push(`${dbKey} = $${idx}`)
      params.push(value)
      idx++
    }

    if (fields.length === 0) {
      res.status(400).json({ error: { code: "NO_FIELDS", message: "No fields to update" } })
      return
    }

    params.push(req.params.id)
    await query(`UPDATE appointments SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${idx}`, params)
    res.json({ data: { message: "Appointment updated" }, meta: { requestId: req.id } })
  } catch (error) {
    next(error)
  }
})

router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    await query("DELETE FROM appointments WHERE id = $1", [req.params.id])
    res.json({ data: { message: "Appointment deleted" }, meta: { requestId: req.id } })
  } catch (error) {
    next(error)
  }
})

export default router
