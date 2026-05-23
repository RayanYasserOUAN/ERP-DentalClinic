import { NextRequest } from "next/server"
import { query } from "@/lib/db"
import { success, error, requireAuth, handleApiError } from "@/lib/api-helpers"

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/billing/[id]">) {
  try {
    await requireAuth()
    const { id } = await ctx.params
    const result = await query(
      `SELECT i.*, p.name as patient_name,
              (SELECT json_agg(json_build_object('id', ii.id, 'description', ii.description, 'quantity', ii.quantity, 'unit_price', ii.unit_price, 'total', ii.total)) FROM invoice_items ii WHERE ii.invoice_id = i.id) as items
       FROM invoices i JOIN patients p ON p.id = i.patient_id WHERE i.id = $1`,
      [id]
    )
    if (result.rows.length === 0) {
      return error("NOT_FOUND", "Invoice not found", 404)
    }
    return success(result.rows[0])
  } catch (err) {
    return handleApiError(err)
  }
}
