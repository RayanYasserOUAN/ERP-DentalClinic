import { createClient } from "@/lib/supabase/server"
import { success, error } from "@/lib/api-helpers"

export async function POST() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return success({ message: "Logged out successfully" })
  } catch (err) {
    console.error("Logout error:", err)
    return error("INTERNAL_ERROR", "An unexpected error occurred", 500)
  }
}
