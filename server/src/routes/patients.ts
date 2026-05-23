import { Router } from "express"
import { z } from "zod"
import { query } from "../db/pool"
import { authenticate } from "../middleware/auth"
import { validate } from "../middleware/validate"

const router = Router()

const CreatePatientSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  gender: z.enum(["male", "female"]),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  phone: z.string().min(1).max(50),
  email: z.string().email().max(255).optional().nullable(),
  address: z.string().optional().nullable(),
  bloodGroup: z.string().max(5).optional().nullable(),
  allergies: z.array(z.string()).optional().default([]),
  insuranceProvider: z.string().max(255).optional().nullable(),
  insuranceNumber: z.string().max(100).optional().nullable(),
  vip: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([]),
  notes: z.string().optional().nullable(),
  emergencyContactName: z.string().max(255).optional().nullable(),
  emergencyContactPhone: z.string().max(50).optional().nullable(),
  nationalId: z.string().max(100).optional().nullable(),
  passportNumber: z.string().max(100).optional().nullable(),
})

router.get("/", authenticate, async (req, res, next) => {
  try {
    const { search, vip, tag, branchId, page = "1", limit = "20" } = req.query as Record<string, string>
    const offset = (parseInt(page) - 1) * parseInt(limit)
    const conditions: string[] = []
    const params: unknown[] = []
    let paramIdx = 1

    if (search) {
      conditions.push(`(p.name ILIKE $${paramIdx} OR p.email ILIKE $${paramIdx} OR p.phone ILIKE $${paramIdx})`)
      params.push(`%${search}%`)
      paramIdx++
    }
    if (vip === "true") {
      conditions.push(`p.vip = TRUE`)
    }
    if (tag) {
      conditions.push(`$${paramIdx} = ANY(p.tags)`)
      params.push(tag)
      paramIdx++
    }
    if (branchId) {
      conditions.push(`p.branch_id = $${paramIdx}`)
      params.push(branchId)
      paramIdx++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    const countResult = await query(`SELECT COUNT(*) FROM patients p ${whereClause}`, params)
    const total = parseInt(countResult.rows[0].count)

    const result = await query(
      `SELECT p.id, p.name, p.gender, p.date_of_birth, p.phone, p.email, p.address,
              p.blood_group, p.allergies, p.insurance_provider, p.insurance_number,
              p.vip, p.blacklisted, p.tags, p.avatar, p.notes,
              p.emergency_contact_name, p.emergency_contact_phone,
              p.national_id, p.passport_number, p.branch_id,
              p.last_visit_at, p.total_visits, p.total_spent,
              p.created_at, p.updated_at
       FROM patients p ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, parseInt(limit), offset]
    )

    // Compute derived fields
    const rows = await Promise.all(result.rows.map(async (row: any) => {
      const visitData = await query(
        `SELECT COUNT(*) as visits, COALESCE(SUM(i.total), 0) as spent,
                MAX(a.date) as last_visit
         FROM appointments a
         LEFT JOIN invoices i ON i.patient_id = a.patient_id
         WHERE a.patient_id = $1 AND a.status = 'completed'`,
        [row.id]
      )
      return {
        id: row.id,
        name: row.name,
        gender: row.gender,
        dateOfBirth: row.date_of_birth,
        phone: row.phone,
        email: row.email,
        address: row.address,
        bloodGroup: row.blood_group,
        allergies: row.allergies || [],
        insuranceProvider: row.insurance_provider,
        insuranceNumber: row.insurance_number,
        vip: row.vip,
        blacklisted: row.blacklisted,
        tags: row.tags || [],
        avatar: row.avatar,
        notes: row.notes,
        emergencyContact: row.emergency_contact_name ? { name: row.emergency_contact_name, phone: row.emergency_contact_phone } : null,
        nationalId: row.national_id,
        passportNumber: row.passport_number,
        branchId: row.branch_id,
        lastVisit: visitData.rows[0]?.last_visit,
        totalVisits: parseInt(visitData.rows[0]?.visits || "0"),
        totalSpent: parseFloat(visitData.rows[0]?.spent || "0"),
        createdAt: row.created_at,
      }
    }))

    res.json({
      data: rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset,
        has_more: offset + parseInt(limit) < total,
      },
      meta: { requestId: req.id },
    })
  } catch (error) {
    next(error)
  }
})

router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT p.*, b.name as branch_name
       FROM patients p LEFT JOIN branches b ON b.id = p.branch_id
       WHERE p.id = $1`,
      [req.params.id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "Patient not found" } })
      return
    }

    const row = result.rows[0]

    const visitData = await query(
      `SELECT COUNT(*) as visits, COALESCE(SUM(i.total), 0) as spent,
              MAX(a.date) as last_visit
       FROM appointments a
       LEFT JOIN invoices i ON i.patient_id = a.patient_id
       WHERE a.patient_id = $1 AND a.status = 'completed'`,
      [row.id]
    )

    res.json({
      data: {
        id: row.id,
        name: row.name,
        gender: row.gender,
        dateOfBirth: row.date_of_birth,
        phone: row.phone,
        email: row.email,
        address: row.address,
        bloodGroup: row.blood_group,
        allergies: row.allergies || [],
        insuranceProvider: row.insurance_provider,
        insuranceNumber: row.insurance_number,
        medicalHistory: row.medical_history,
        dentalHistory: row.dental_history,
        medications: row.medications,
        vip: row.vip,
        blacklisted: row.blacklisted,
        tags: row.tags || [],
        avatar: row.avatar,
        notes: row.notes,
        emergencyContact: row.emergency_contact_name ? { name: row.emergency_contact_name, phone: row.emergency_contact_phone } : null,
        nationalId: row.national_id,
        passportNumber: row.passport_number,
        branchId: row.branch_id,
        branchName: row.branch_name,
        lastVisit: visitData.rows[0]?.last_visit,
        totalVisits: parseInt(visitData.rows[0]?.visits || "0"),
        totalSpent: parseFloat(visitData.rows[0]?.spent || "0"),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
      meta: { requestId: req.id },
    })
  } catch (error) {
    next(error)
  }
})

router.post("/", authenticate, validate(CreatePatientSchema), async (req, res, next) => {
  try {
    const { name, gender, dateOfBirth, phone, email, address, bloodGroup, allergies, insuranceProvider, insuranceNumber, vip, tags, notes, emergencyContactName, emergencyContactPhone, nationalId, passportNumber } = req.body

    const result = await query(
      `INSERT INTO patients (name, gender, date_of_birth, phone, email, address, blood_group, allergies, insurance_provider, insurance_number, vip, tags, notes, emergency_contact_name, emergency_contact_phone, national_id, passport_number, branch_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING id`,
      [name, gender, dateOfBirth, phone, email || null, address || null, bloodGroup || null, allergies || [], insuranceProvider || null, insuranceNumber || null, vip || false, tags || [], notes || null, emergencyContactName || null, emergencyContactPhone || null, nationalId || null, passportNumber || null, req.user!.branchId]
    )

    res.status(201).json({ data: { id: result.rows[0].id }, meta: { requestId: req.id } })
  } catch (error) {
    next(error)
  }
})

router.put("/:id", authenticate, validate(CreatePatientSchema.partial()), async (req, res, next) => {
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
    await query(
      `UPDATE patients SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${idx}`,
      params
    )

    res.json({ data: { message: "Patient updated" }, meta: { requestId: req.id } })
  } catch (error) {
    next(error)
  }
})

router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    await query("DELETE FROM patients WHERE id = $1", [req.params.id])
    res.json({ data: { message: "Patient deleted" }, meta: { requestId: req.id } })
  } catch (error) {
    next(error)
  }
})

export default router
