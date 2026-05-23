import { NextRequest } from "next/server"
import { query } from "@/lib/db"
import { success, handleApiError } from "@/lib/api-helpers"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(_req: NextRequest, ctx: RouteContext<"/api/notifications/[id]/read">) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return handleApiError(new Error("UNAUTHORIZED"))
    }

    const { id } = await ctx.params
    await query("UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2", [id, user.id])
    return success({ id })
  } catch (err) {
    return handleApiError(err)
  }
}
