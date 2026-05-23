import { query } from "@/lib/db"
import { success, requireAuth, handleApiError } from "@/lib/api-helpers"

export async function GET() {
  try {
    await requireAuth()
    const today = new Date().toISOString().split("T")[0]
    const result = await query(
      `SELECT a.*, p.name as patient_name, u.name as dentist_name
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN users u ON u.id = a.dentist_id
       WHERE a.date = $1
       ORDER BY a.start_time ASC`,
      [today]
    )

    const mapped = result.rows.map((r: any) => ({
      id: r.id,
      patientName: r.patient_name,
      patientId: r.patient_id,
      dentistName: r.dentist_name,
      type: r.type,
      startTime: r.start_time?.slice(0, 5),
      endTime: r.end_time?.slice(0, 5),
      status: r.status,
      chair: r.chair,
      room: r.room,
    }))

    return success(mapped)
  } catch (err) {
    return handleApiError(err)
  }
}
