import { query } from "@/lib/db"
import { success, handleApiError } from "@/lib/api-helpers"
import { createClient } from "@/lib/supabase/server"
import logger from "@/lib/logger"

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return handleApiError(new Error("UNAUTHORIZED"))
    }

    await query("UPDATE notifications SET read = TRUE WHERE user_id = $1 AND read = FALSE", [user.id])
    logger.info({ event: "NOTIFICATIONS_MARK_ALL_READ", userId: user.id })
    return success({ message: "All notifications marked as read" })
  } catch (err) {
    return handleApiError(err)
  }
}
