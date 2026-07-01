import { NextRequest } from "next/server"
import { query } from "@/lib/db"
import { success, requireAuth, handleApiError } from "@/lib/api-helpers"
import logger from "@/lib/logger"
import { auditLog } from "@/lib/audit"

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const result = await query(
      `SELECT i.*, p.name as patient_name,
              (SELECT json_agg(json_build_object('id', ii.id, 'description', ii.description, 'quantity', ii.quantity, 'unit_price', ii.unit_price, 'total', ii.total)) FROM invoice_items ii WHERE ii.invoice_id = i.id) as items
       FROM invoices i
       JOIN patients p ON p.id = i.patient_id
       ORDER BY i.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    )

    const mapped = result.rows.map((r: any) => ({
      id: r.id,
      invoiceNumber: r.invoice_number,
      patientName: r.patient_name,
      patientId: r.patient_id,
      subtotal: r.subtotal,
      discount: r.discount,
      tax: r.tax,
      total: r.total,
      paid: r.paid,
      status: r.status,
      dueDate: r.due_date,
      items: r.items || [],
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }))

    logger.info({ event: "INVOICES_LISTED", userId: session.user.id, count: mapped.length })
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
      `INSERT INTO invoices (patient_id, invoice_number, subtotal, discount, tax, total, paid, status, due_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [body.patientId, body.invoiceNumber || `INV-${Date.now()}`, body.subtotal || 0, body.discount || 0, body.tax || 0, body.total || 0, body.paid || 0, body.status || "pending", body.dueDate, body.notes || null]
    )
    logger.info({ event: "INVOICE_CREATED", userId: session.user.id, invoiceId: result.rows[0].id, total: body.total })
    auditLog({ userId: session.user.id, action: "create", entityType: "invoice", entityId: result.rows[0].id, details: { total: body.total, status: body.status } }).catch(() => {})
    return success(result.rows[0], 201)
  } catch (err) {
    return handleApiError(err)
  }
}
