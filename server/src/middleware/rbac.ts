import type { Request, Response, NextFunction } from "express"
import { query } from "../db/pool"

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: { code: "AUTHENTICATION_REQUIRED", message: "Authentication required" } })
      return
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: { code: "FORBIDDEN", message: "Insufficient permissions" } })
      return
    }
    next()
  }
}

export async function requirePermission(permissionName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: { code: "AUTHENTICATION_REQUIRED", message: "Authentication required" } })
      return
    }

    try {
      const result = await query(
        `SELECT 1 FROM role_permissions rp
         JOIN permissions p ON p.id = rp.permission_id
         WHERE rp.role_id = $1 AND p.name = $2`,
        [req.user.roleId, permissionName]
      )

      if (result.rows.length === 0) {
        res.status(403).json({ error: { code: "FORBIDDEN", message: "Insufficient permissions" } })
        return
      }

      next()
    } catch (error) {
      console.error("Permission check failed:", error)
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Permission check failed" } })
    }
  }
}
