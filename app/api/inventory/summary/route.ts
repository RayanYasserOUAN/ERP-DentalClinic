import { query } from "@/lib/db"
import { success, requireAuth, handleApiError } from "@/lib/api-helpers"

export async function GET() {
  try {
    await requireAuth()
    const result = await query(
      `SELECT
        COUNT(*) as total_items,
        COUNT(*) FILTER (WHERE quantity <= min_quantity) as low_stock_count,
        COALESCE(SUM(quantity * unit_price), 0) as total_value,
        COUNT(*) FILTER (WHERE expiration_date IS NOT NULL AND expiration_date <= NOW() + INTERVAL '30 days') as expiring_soon
       FROM inventory_items`
    )
    return success(result.rows[0])
  } catch (err) {
    return handleApiError(err)
  }
}
