import type { Request, Response, NextFunction } from "express"
import { ZodSchema, ZodError } from "zod"

export function validate(schema: ZodSchema, source: "body" | "query" | "params" = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req[source])
      req[source] = data
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((e) => ({
          field: e.path.join("."),
          code: e.code,
          message: e.message,
        }))
        res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Request validation failed",
            details,
          },
        })
        return
      }
      next(error)
    }
  }
}
