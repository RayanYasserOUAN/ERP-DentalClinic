import { NextRequest } from "next/server"
import { query } from "@/lib/db"
import { success, error, requireAuth, handleApiError } from "@/lib/api-helpers"

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/appointments/[id]/status">) {
  try {
    await requireAuth()
    const { id } = await ctx.params
    const { status } = await req.json()

    const validStatuses = ["booked", "confirmed", "waiting", "in_treatment", "completed", "cancelled", "no_show"]
    if (!validStatuses.includes(status)) {
      return error("INVALID_STATUS", `Status must be one of: ${validStatuses.join(", ")}`)
    }

    const result = await query(
      "UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [status, id]
    )
    if (result.rows.length === 0) {
      return error("NOT_FOUND", "Appointment not found", 404)
    }
    return success(result.rows[0])
  } catch (err) {
    return handleApiError(err)
  }
}
