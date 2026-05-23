import { query } from "@/lib/db"
import { success, requireAuth, handleApiError } from "@/lib/api-helpers"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return handleApiError(new Error("UNAUTHORIZED"))
    }

    const result = await query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [user.id]
    )
    return success(result.rows)
  } catch (err) {
    return handleApiError(err)
  }
}
