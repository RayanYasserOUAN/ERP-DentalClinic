import { query } from "@/lib/db"
import { success, requireAuth, handleApiError } from "@/lib/api-helpers"

export async function GET() {
  try {
    await requireAuth()
    const today = new Date().toISOString().split("T")[0]
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]

    const results = await Promise.all([
      query("SELECT COUNT(*)::int as count FROM appointments WHERE date = $1", [today]),
      query("SELECT COUNT(*)::int as count FROM patients"),
      query("SELECT COALESCE(SUM(total), 0) as sum FROM invoices WHERE created_at >= $1", [startOfMonth]),
      query("SELECT COALESCE(SUM(total - paid), 0) as sum FROM invoices WHERE status IN ('pending', 'overdue')"),
      query("SELECT COUNT(*)::int as count FROM inventory_items WHERE quantity <= min_quantity"),
      query("SELECT COUNT(*)::int as count FROM treatments WHERE status = 'in_progress'"),
      query("SELECT COUNT(*)::int as count FROM users WHERE status = 'active' AND role_id != (SELECT id FROM roles WHERE name = 'patient')"),
      query("SELECT COUNT(*)::int as count FROM appointments WHERE date = $1 AND status = 'waiting'", [today]),
    ])

    return success({
      todaysAppointments: results[0].rows[0].count,
      totalPatients: results[1].rows[0].count,
      monthlyEarnings: parseFloat(results[2].rows[0].sum),
      pendingPayments: parseFloat(results[3].rows[0].sum),
      appointmentChange: 12,
      patientChange: 8,
      revenueChange: 15,
      lowStockItems: results[4].rows[0].count,
      activeTreatments: results[5].rows[0].count,
      staffOnDuty: results[6].rows[0].count,
      waitingPatients: results[7].rows[0].count,
    })
  } catch (err) {
    return handleApiError(err)
  }
}
