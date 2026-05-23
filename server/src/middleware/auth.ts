import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { config } from "../config"

export interface JwtPayload {
  sub: string
  email: string
  role: string
  roleId: string
  branchId: string | null
  iat: number
  exp: number
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
      id?: string
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: { code: "AUTHENTICATION_REQUIRED", message: "Authentication required" } })
    return
  }

  try {
    const token = authHeader.slice(7)
    const payload = jwt.verify(token, config.jwt.secret, {
      algorithms: ["HS256"],
    }) as JwtPayload
    req.user = payload
    next()
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: { code: "TOKEN_EXPIRED", message: "Token has expired" } })
      return
    }
    res.status(401).json({ error: { code: "INVALID_TOKEN", message: "Invalid token" } })
  }
}
