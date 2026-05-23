import { Router } from "express"
import { z } from "zod"
import { query } from "../db/pool"
import { authenticate } from "../middleware/auth"
import { validate } from "../middleware/validate"

const router = Router()

const CreateInvoiceSchema = z.object({
  patientId: z.string().uuid(),
  items: z.array(z.object({
    description: z.string().min(1).max(500),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
  })).min(1),
  discount: z.number().min(0).optional().default(0),
  tax: z.number().min(0).optional().default(0),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().optional().nullable(),
})

router.get("/", authenticate, async (req, res, next) => {
  try {
    const { status, patientId, page = "1", limit = "20" } = req.query as Record<string, string>
    const offset = (parseInt(page) - 1) * parseInt(limit)
    const conditions: string[] = []
    const params: unknown[] = []
    let idx = 1

    if (status) { conditions.push(`i.status = $${idx}`); params.push(status); idx++ }
    if (patientId) { conditions.push(`i.patient_id = $${idx}`); params.push(patientId); idx++ }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    const countResult = await query(`SELECT COUNT(*) FROM invoices i ${whereClause}`, params)
    const total = parseInt(countResult.rows[0].count)

    const result = await query(
      `SELECT i.*, p.name as patient_name
       FROM invoices i JOIN patients p ON p.id = i.patient_id
       ${whereClause}
       ORDER BY i.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, parseInt(limit), offset]
    )

    const rows = await Promise.all(result.rows.map(async (row: any) => {
      const itemsResult = await query(
        "SELECT id, description, quantity, unit_price, total FROM invoice_items WHERE invoice_id = $1",
        [row.id]
      )
      return {
        id: row.id,
        patientId: row.patient_id,
        patientName: row.patient_name,
        invoiceNumber: row.invoice_number,
        items: itemsResult.rows.map((item: any) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unit_price),
          total: parseFloat(item.total),
        })),
        subtotal: parseFloat(row.subtotal),
        discount: parseFloat(row.discount),
        tax: parseFloat(row.tax),
        total: parseFloat(row.total),
        paid: parseFloat(row.paid),
        status: row.status,
        dueDate: row.due_date,
        notes: row.notes,
        createdAt: row.created_at,
      }
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
      `SELECT i.*, p.name as patient_name, p.phone as patient_phone
       FROM invoices i JOIN patients p ON p.id = i.patient_id WHERE i.id = $1`,
      [req.params.id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "Invoice not found" } })
      return
    }

    const row = result.rows[0]
    const itemsResult = await query(
      "SELECT id, description, quantity, unit_price, total FROM invoice_items WHERE invoice_id = $1",
      [row.id]
    )
    const paymentsResult = await query(
      "SELECT id, amount, method, reference, notes, received_at FROM payments WHERE invoice_id = $1 ORDER BY received_at DESC",
      [row.id]
    )

    res.json({
      data: {
        id: row.id,
        patientId: row.patient_id,
        patientName: row.patient_name,
        patientPhone: row.patient_phone,
        invoiceNumber: row.invoice_number,
        items: itemsResult.rows.map((i: any) => ({ id: i.id, description: i.description, quantity: i.quantity, unitPrice: parseFloat(i.unit_price), total: parseFloat(i.total) })),
        subtotal: parseFloat(row.subtotal),
        discount: parseFloat(row.discount),
        tax: parseFloat(row.tax),
        total: parseFloat(row.total),
        paid: parseFloat(row.paid),
        status: row.status,
        dueDate: row.due_date,
        notes: row.notes,
        payments: paymentsResult.rows.map((p: any) => ({ id: p.id, amount: parseFloat(p.amount), method: p.method, reference: p.reference, notes: p.notes, receivedAt: p.received_at })),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
      meta: { requestId: req.id },
    })
  } catch (error) {
    next(error)
  }
})

router.post("/", authenticate, validate(CreateInvoiceSchema), async (req, res, next) => {
  try {
    const { patientId, items, discount, tax, dueDate, notes } = req.body

    const subtotal = items.reduce((sum: number, item: any) => sum + item.quantity * item.unitPrice, 0)
    const total = subtotal - discount + tax

    const invNumber = await query("SELECT COALESCE(MAX(CAST(SPLIT_PART(invoice_number, '-', 3) AS INTEGER)), 0) + 1 as next FROM invoices")
    const nextNum = invNumber.rows[0].next
    const invoiceNumber = `INV-2026-${String(nextNum).padStart(3, "0")}`

    const result = await query(
      `INSERT INTO invoices (patient_id, invoice_number, subtotal, discount, tax, total, paid, status, due_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, 0, 'pending', $7, $8) RETURNING id`,
      [patientId, invoiceNumber, subtotal, discount, tax, total, dueDate, notes || null]
    )

    const invoiceId = result.rows[0].id

    for (const item of items) {
      const itemTotal = item.quantity * item.unitPrice
      await query(
        "INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total) VALUES ($1, $2, $3, $4, $5)",
        [invoiceId, item.description, item.quantity, item.unitPrice, itemTotal]
      )
    }

    res.status(201).json({ data: { id: invoiceId, invoiceNumber }, meta: { requestId: req.id } })
  } catch (error) {
    next(error)
  }
})

router.post("/:id/payments", authenticate, validate(z.object({
  amount: z.number().positive(),
  method: z.enum(["cash", "card", "bank_transfer", "insurance", "mobile_payment"]),
  reference: z.string().max(255).optional().nullable(),
  notes: z.string().optional().nullable(),
})), async (req, res, next) => {
  try {
    const { amount, method, reference, notes } = req.body

    const invoice = await query("SELECT * FROM invoices WHERE id = $1", [req.params.id])
    if (invoice.rows.length === 0) {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "Invoice not found" } })
      return
    }

    const inv = invoice.rows[0]
    const newPaid = parseFloat(inv.paid) + amount

    let newStatus = inv.status
    if (newPaid >= parseFloat(inv.total)) newStatus = "paid"
    else if (newPaid > 0) newStatus = "partial"
    else newStatus = "pending"

    await query(
      "INSERT INTO payments (invoice_id, amount, method, reference, notes) VALUES ($1, $2, $3, $4, $5)",
      [req.params.id, amount, method, reference || null, notes || null]
    )

    await query(
      "UPDATE invoices SET paid = $1, status = $2, updated_at = NOW() WHERE id = $3",
      [newPaid, newStatus, req.params.id]
    )

    res.status(201).json({ data: { message: "Payment recorded" }, meta: { requestId: req.id } })
  } catch (error) {
    next(error)
  }
})

router.get("/summary/overview", authenticate, async (req, res, next) => {
  try {
    const result = await query(`
      SELECT
        COUNT(*) as total_invoices,
        COALESCE(SUM(total), 0) as total_revenue,
        COALESCE(SUM(paid), 0) as total_collected,
        COALESCE(SUM(CASE WHEN status IN ('pending', 'overdue') THEN total - paid ELSE 0 END), 0) as total_pending
      FROM invoices
    `)

    const row = result.rows[0]
    res.json({
      data: {
        totalInvoices: parseInt(row.total_invoices),
        totalRevenue: parseFloat(row.total_revenue),
        totalCollected: parseFloat(row.total_collected),
        totalPending: parseFloat(row.total_pending),
      },
      meta: { requestId: req.id },
    })
  } catch (error) {
    next(error)
  }
})

export default router
