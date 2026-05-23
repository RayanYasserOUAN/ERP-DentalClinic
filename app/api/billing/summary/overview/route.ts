import { query } from "@/lib/db"
import { success, requireAuth, handleApiError } from "@/lib/api-helpers"

export async function GET() {
  try {
    await requireAuth()
    const result = await query(
      `SELECT
        COUNT(*) as total_invoices,
        COALESCE(SUM(total), 0) as total_revenue,
        COALESCE(SUM(paid), 0) as total_collected,
        COALESCE(SUM(CASE WHEN status IN ('pending', 'overdue') THEN total - paid ELSE 0 END), 0) as total_pending
       FROM invoices`
    )
    return success(result.rows[0])
  } catch (err) {
    return handleApiError(err)
  }
}
