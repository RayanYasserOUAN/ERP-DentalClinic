import { Router } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import { z } from "zod"
import { query } from "../db/pool"
import { config } from "../config"
import { validate } from "../middleware/validate"
import { authenticate } from "../middleware/auth"
import { authLimiter } from "../middleware/rateLimiter"

const router = Router()

const LoginSchema = z.object({
  email: z.string().email().max(255).toLowerCase(),
  password: z.string().min(1).max(100),
})

const RegisterSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  email: z.string().email().max(255).toLowerCase(),
  password: z.string().min(8).max(72),
  roleId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
})

function generateTokens(user: { id: string; email: string; role: string; roleId: string; branchId: string | null }) {
  const accessToken = jwt.sign(
    { sub: user.id, email: user.email, role: user.role, roleId: user.roleId, branchId: user.branchId },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn as any, algorithm: "HS256" }
  )

  const refreshFamily = crypto.randomUUID()
  const refreshToken = jwt.sign(
    { sub: user.id, family: refreshFamily },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn as any, algorithm: "HS256" }
  )

  return { accessToken, refreshToken, refreshFamily }
}

router.post("/login", authLimiter, validate(LoginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body

    const result = await query(
      `SELECT u.id, u.name, u.email, u.password_hash, u.branch_id, u.active,
              r.id as role_id, r.name as role_name
       FROM users u JOIN roles r ON r.id = u.role_id
       WHERE u.email = $1`,
      [email]
    )

    if (result.rows.length === 0) {
      res.status(401).json({ error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } })
      return
    }

    const user = result.rows[0]

    if (!user.active) {
      res.status(403).json({ error: { code: "ACCOUNT_DISABLED", message: "Account is disabled" } })
      return
    }

    const validPassword = await bcrypt.compare(password, user.password_hash)
    if (!validPassword) {
      res.status(401).json({ error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } })
      return
    }

    const tokens = generateTokens({
      id: user.id,
      email: user.email,
      role: user.role_name,
      roleId: user.role_id,
      branchId: user.branch_id,
    })

    const tokenHash = crypto.createHash("sha256").update(tokens.refreshToken).digest("hex")
    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, family, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '7 days')`,
      [user.id, tokenHash, tokens.refreshFamily]
    )

    await query("UPDATE users SET last_login = NOW() WHERE id = $1", [user.id])

    res.json({
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role_name,
          roleId: user.role_id,
          branchId: user.branch_id,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      meta: { requestId: req.id },
    })
  } catch (error) {
    next(error)
  }
})

router.post("/register", validate(RegisterSchema), async (req, res, next) => {
  try {
    const { name, email, password, roleId, branchId } = req.body

    const existing = await query("SELECT id FROM users WHERE email = $1", [email])
    if (existing.rows.length > 0) {
      res.status(409).json({ error: { code: "EMAIL_EXISTS", message: "Email already registered" } })
      return
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const patientRole = await query("SELECT id FROM roles WHERE name = 'patient'")

    const result = await query(
      `INSERT INTO users (name, email, password_hash, role_id, branch_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email`,
      [name, email, passwordHash, roleId || patientRole.rows[0].id, branchId || null]
    )

    const user = result.rows[0]

    const roleResult = await query("SELECT name FROM roles WHERE id = $1", [roleId || patientRole.rows[0].id])
    const roleName = roleResult.rows[0]?.name || "patient"

    res.status(201).json({
      data: { id: user.id, name: user.name, email: user.email, role: roleName },
      meta: { requestId: req.id },
    })
  } catch (error) {
    next(error)
  }
})

router.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) {
      res.status(400).json({ error: { code: "REFRESH_TOKEN_REQUIRED", message: "Refresh token required" } })
      return
    }

    let payload: { sub: string; family: string }
    try {
      payload = jwt.verify(refreshToken, config.jwt.refreshSecret, { algorithms: ["HS256"] }) as any
    } catch {
      res.status(401).json({ error: { code: "INVALID_REFRESH_TOKEN", message: "Invalid refresh token" } })
      return
    }

    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")
    const stored = await query(
      "SELECT * FROM refresh_tokens WHERE token_hash = $1 AND is_revoked = FALSE AND expires_at > NOW()",
      [tokenHash]
    )

    if (stored.rows.length === 0) {
      await query("UPDATE refresh_tokens SET is_revoked = TRUE WHERE family = $1", [payload.family])
      res.status(401).json({ error: { code: "INVALID_REFRESH_TOKEN", message: "Refresh token has been revoked" } })
      return
    }

    await query("UPDATE refresh_tokens SET is_revoked = TRUE WHERE id = $1", [stored.rows[0].id])

    const userResult = await query(
      `SELECT u.id, u.email, u.branch_id, r.id as role_id, r.name as role_name
       FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = $1`,
      [payload.sub]
    )

    if (userResult.rows.length === 0) {
      res.status(401).json({ error: { code: "USER_NOT_FOUND", message: "User not found" } })
      return
    }

    const user = userResult.rows[0]
    const tokens = generateTokens({
      id: user.id,
      email: user.email,
      role: user.role_name,
      roleId: user.role_id,
      branchId: user.branch_id,
    })

    const newTokenHash = crypto.createHash("sha256").update(tokens.refreshToken).digest("hex")
    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, family, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '7 days')`,
      [user.id, newTokenHash, tokens.refreshFamily]
    )

    res.json({
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      meta: { requestId: req.id },
    })
  } catch (error) {
    next(error)
  }
})

router.post("/logout", authenticate, async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    if (refreshToken) {
      const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")
      await query("UPDATE refresh_tokens SET is_revoked = TRUE WHERE token_hash = $1", [tokenHash])
    }

    res.json({ data: { message: "Logged out successfully" }, meta: { requestId: req.id } })
  } catch (error) {
    next(error)
  }
})

router.get("/me", authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT u.id, u.name, u.email, u.phone, u.avatar, u.branch_id, u.department, u.status,
              u.last_login, r.name as role, b.name as branch_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN branches b ON b.id = u.branch_id
       WHERE u.id = $1`,
      [req.user!.sub]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: { code: "USER_NOT_FOUND", message: "User not found" } })
      return
    }

    res.json({ data: result.rows[0], meta: { requestId: req.id } })
  } catch (error) {
    next(error)
  }
})

export default router
