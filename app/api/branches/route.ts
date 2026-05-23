import { query } from "@/lib/db"
import { success, requireAuth, handleApiError } from "@/lib/api-helpers"

export async function GET() {
  try {
    await requireAuth()
    const result = await query("SELECT * FROM branches WHERE status = 'active' ORDER BY name ASC")
    return success(result.rows)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(req: Request) {
  try {
    await requireAuth()
    const body = await req.json()
    const result = await query(
      `INSERT INTO branches (name, address, phone, email, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [body.name, body.address, body.phone, body.email, body.status || "active"]
    )
    return success(result.rows[0], 201)
  } catch (err) {
    return handleApiError(err)
  }
}
