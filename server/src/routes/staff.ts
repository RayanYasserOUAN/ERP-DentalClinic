import { Router } from "express"
import { z } from "zod"
import { query } from "../db/pool"
import { authenticate } from "../middleware/auth"
import { validate } from "../middleware/validate"

const router = Router()

router.get("/", authenticate, async (req, res, next) => {
  try {
    const { role, status, branchId, department } = req.query as Record<string, string>
    const conditions: string[] = []
    const params: unknown[] = []
    let idx = 1

    if (role) { conditions.push(`r.name = $${idx}`); params.push(role); idx++ }
    if (status) { conditions.push(`u.status = $${idx}`); params.push(status); idx++ }
    if (branchId) { conditions.push(`u.branch_id = $${idx}`); params.push(branchId); idx++ }
    if (department) { conditions.push(`u.department = $${idx}`); params.push(department); idx++ }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    const result = await query(
      `SELECT u.id, u.name, u.email, u.phone, u.avatar, u.department, u.salary, u.shift,
              u.join_date, u.status, u.branch_id, r.name as role, b.name as branch_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN branches b ON b.id = u.branch_id
       ${whereClause}
       ORDER BY u.name ASC`,
      params
    )

    const rows = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      avatar: row.avatar,
      role: row.role,
      department: row.department,
      salary: parseFloat(row.salary || "0"),
      shift: row.shift,
      joinDate: row.join_date,
      status: row.status,
      branchId: row.branch_id,
      branchName: row.branch_name,
    }))

    res.json({ data: rows, meta: { requestId: req.id } })
  } catch (error) {
    next(error)
  }
})

router.get("/dentists", authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT u.id, u.name, u.email, u.phone, u.avatar, u.department, u.salary, u.shift,
              u.status, u.branch_id
       FROM users u JOIN roles r ON r.id = u.role_id
       WHERE r.name = 'dentist'
       ORDER BY u.name ASC`
    )

    res.json({
      data: result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        avatar: row.avatar,
        department: row.department,
        salary: parseFloat(row.salary || "0"),
        shift: row.shift,
        status: row.status,
        branchId: row.branch_id,
      })),
      meta: { requestId: req.id },
    })
  } catch (error) {
    next(error)
  }
})

router.get("/summary", authenticate, async (req, res, next) => {
  try {
    const result = await query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'on_leave' THEN 1 END) as on_leave,
        COALESCE(SUM(CASE WHEN status = 'active' THEN salary ELSE 0 END), 0) as total_salary
      FROM users WHERE role_id != (SELECT id FROM roles WHERE name = 'patient')
    `)

    const row = result.rows[0]
    res.json({
      data: {
        total: parseInt(row.total),
        active: parseInt(row.active),
        onLeave: parseInt(row.on_leave),
        totalSalary: parseFloat(row.total_salary),
      },
      meta: { requestId: req.id },
    })
  } catch (error) {
    next(error)
  }
})

export default router
