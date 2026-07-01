import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { query } from "@/lib/db"
import crypto from "crypto"
import { success, error } from "@/lib/api-helpers"
import logger from "@/lib/logger"
import { auditLog } from "@/lib/audit"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return error("INVALID_INPUT", "Email and password are required")
    }

    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      logger.warn("Login failed", { event: "AUTH_LOGIN_FAILURE", email })
      return error("INVALID_CREDENTIALS", authError.message, 401)
    }

    const userResult = await query(
      `SELECT u.id, u.name, u.email, u.branch_id,
              r.id as role_id, r.name as role_name
       FROM users u JOIN roles r ON r.id = u.role_id
       WHERE u.email = $1`,
      [email]
    )

    if (userResult.rows.length === 0) {
      const authUser = authData.user
      await query(
        `INSERT INTO users (id, name, email, password_hash, role_id)
         VALUES ($1, $2, $3, $4, (SELECT id FROM roles WHERE name = 'patient'))`,
        [authUser.id, authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User", authUser.email!, ""]
      )

      const newUser = await query(
        `SELECT u.id, u.name, u.email, u.branch_id,
                r.id as role_id, r.name as role_name
         FROM users u JOIN roles r ON r.id = u.role_id
         WHERE u.id = $1`,
        [authUser.id]
      )
      const user = newUser.rows[0]

      await query("UPDATE users SET last_login = NOW() WHERE id = $1", [user.id])

      logger.info("New user auto-created and logged in", { event: "AUTH_LOGIN_SUCCESS", userId: user.id, email, role: user.role_name })
      auditLog({ userId: user.id, action: "login", entityType: "user", entityId: user.id }).catch(() => {})

      return success({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role_name,
          roleId: user.role_id,
          branchId: user.branch_id,
        },
        accessToken: authData.session?.access_token,
        refreshToken: authData.session?.refresh_token,
      })
    }

    const user = userResult.rows[0]
    await query("UPDATE users SET last_login = NOW() WHERE id = $1", [user.id])

    logger.info("User logged in", { event: "AUTH_LOGIN_SUCCESS", userId: user.id, email, role: user.role_name })
    auditLog({ userId: user.id, action: "login", entityType: "user", entityId: user.id }).catch(() => {})

    return success({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role_name,
        roleId: user.role_id,
        branchId: user.branch_id,
      },
      accessToken: authData.session?.access_token,
      refreshToken: authData.session?.refresh_token,
    })
  } catch (err) {
    logger.error({ event: "AUTH_LOGIN_ERROR", error: err instanceof Error ? err.message : String(err) })
    return error("INTERNAL_ERROR", "An unexpected error occurred", 500)
  }
}
