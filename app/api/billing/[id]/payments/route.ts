import { NextRequest } from "next/server"
import { query } from "@/lib/db"
import { success, error, requireAuth, handleApiError } from "@/lib/api-helpers"
import logger from "@/lib/logger"
import { auditLog } from "@/lib/audit"

export async function POST(req: NextRequest, ctx: RouteContext<"/api/billing/[id]/payments">) {
  try {
    const session = await requireAuth()
    const { id } = await ctx.params
    const body = await req.json()

    const invoice = await query("SELECT * FROM invoices WHERE id = $1", [id])
    if (invoice.rows.length === 0) {
      return error("NOT_FOUND", "Invoice not found", 404)
    }

    const result = await query(
      `INSERT INTO payments (invoice_id, amount, method, reference, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, body.amount, body.method, body.reference || null, body.notes || null]
    )

    const newPaid = parseFloat(invoice.rows[0].paid) + parseFloat(body.amount)
    const total = parseFloat(invoice.rows[0].total)
    const newStatus = newPaid >= total ? "paid" : newPaid > 0 ? "partial" : invoice.rows[0].status

    await query(
      "UPDATE invoices SET paid = $1, status = $2, updated_at = NOW() WHERE id = $3",
      [newPaid, newStatus, id]
    )

    logger.info({ event: "PAYMENT_RECEIVED", userId: session.user.id, invoiceId: id, amount: body.amount, method: body.method, newStatus })
    auditLog({ userId: session.user.id, action: "payment", entityType: "invoice", entityId: id, details: { amount: body.amount, method: body.method, newStatus } }).catch(() => {})

    return success(result.rows[0], 201)
  } catch (err) {
    return handleApiError(err)
  }
}
