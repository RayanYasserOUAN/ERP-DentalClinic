import { query } from "@/lib/db"
import { success, requireAuth, handleApiError } from "@/lib/api-helpers"
import logger from "@/lib/logger"

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export async function GET() {
  try {
    const session = await requireAuth()
    const result = await query(
      `SELECT
        EXTRACT(MONTH FROM created_at)::int as month_num,
        EXTRACT(YEAR FROM created_at)::int as year_num,
        COALESCE(SUM(total), 0) as revenue,
        COALESCE(SUM(total * 0.35), 0) as expenses
       FROM invoices
       WHERE created_at >= NOW() - INTERVAL '6 months'
       GROUP BY year_num, month_num
       ORDER BY year_num ASC, month_num ASC`
    )

    const currentMonth = new Date().getMonth()
    const dataMap = new Map<number, { month: string; revenue: number; expenses: number }>()

    for (const row of result.rows) {
      dataMap.set(row.month_num, {
        month: months[row.month_num - 1],
        revenue: parseFloat(row.revenue),
        expenses: parseFloat(row.expenses),
      })
    }

    const data = Array.from({ length: 6 }, (_, i) => {
      const monthIndex = ((currentMonth - 5 + i) % 12 + 12) % 12
      return dataMap.get(monthIndex + 1) || {
        month: months[monthIndex],
        revenue: 0,
        expenses: 0,
      }
    })

    logger.info({ event: "DASHBOARD_REVENUE_VIEWED", userId: session.user.id })
    return success(data)
  } catch (err) {
    return handleApiError(err)
  }
}
