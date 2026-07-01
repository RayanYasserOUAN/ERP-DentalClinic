import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { query } from "@/lib/db"
import { success, error } from "@/lib/api-helpers"
import logger from "@/lib/logger"
import { auditLog } from "@/lib/audit"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return error("INVALID_INPUT", "Name, email, and password are required")
    }

    if (password.length < 8) {
      return error("VALIDATION_ERROR", "Password must be at least 8 characters")
    }

    const existing = await query("SELECT id FROM users WHERE email = $1", [email])
    if (existing.rows.length > 0) {
      return error("EMAIL_EXISTS", "Email already registered", 409)
    }

    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })

    if (authError) {
      logger.warn("Registration failed", { event: "AUTH_REGISTER_FAILURE", email, error: authError.message })
      return error("REGISTRATION_FAILED", authError.message, 400)
    }

    const userId = authData.user!.id

    const patientRole = await query("SELECT id FROM roles WHERE name = 'patient'")

    await query(
      `INSERT INTO users (id, name, email, password_hash, role_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, name, email, "", patientRole.rows[0].id]
    )

    logger.info("User registered", { event: "AUTH_REGISTER_SUCCESS", userId, email, role: "patient" })
    auditLog({ userId, action: "create", entityType: "user", entityId: userId, details: { email, role: "patient" } }).catch(() => {})

    return success({
      id: userId,
      name,
      email,
      role: "patient",
    }, 201)
  } catch (err) {
    logger.error({ event: "AUTH_REGISTER_ERROR", error: err instanceof Error ? err.message : String(err) })
    return error("INTERNAL_ERROR", "An unexpected error occurred", 500)
  }
}
