import { query } from "@/lib/db"
import { success, requireAuth, handleApiError } from "@/lib/api-helpers"

export async function GET() {
  try {
    await requireAuth()
    const result = await query(
      `SELECT i.*, s.name as supplier_name
       FROM inventory_items i
       LEFT JOIN suppliers s ON s.id = i.supplier_id
       WHERE i.quantity <= i.min_quantity
       ORDER BY (i.quantity::float / NULLIF(i.min_quantity, 0)) ASC`
    )
    return success(result.rows)
  } catch (err) {
    return handleApiError(err)
  }
}
