import { query } from "@/lib/db"
import { success, requireAuth, handleApiError } from "@/lib/api-helpers"
import logger from "@/lib/logger"

export async function GET() {
  try {
    const session = await requireAuth()
    const result = await query(
      `SELECT i.*, s.name as supplier_name
       FROM inventory_items i
       LEFT JOIN suppliers s ON s.id = i.supplier_id
       WHERE i.quantity <= i.min_quantity
       ORDER BY (i.quantity::float / NULLIF(i.min_quantity, 0)) ASC`
    )
    logger.info({ event: "LOW_STOCK_CHECKED", userId: session.user.id, lowStockCount: result.rows.length })
    return success(result.rows)
  } catch (err) {
    return handleApiError(err)
  }
}
