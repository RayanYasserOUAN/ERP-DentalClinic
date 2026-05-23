import { Router } from "express"
import { query } from "../db/pool"
import { authenticate } from "../middleware/auth"

const router = Router()

router.get("/", authenticate, async (req, res, next) => {
  try {
    const result = await query("SELECT * FROM branches ORDER BY name ASC")

    res.json({
      data: result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        address: row.address,
        phone: row.phone,
        email: row.email,
        status: row.status,
        createdAt: row.created_at,
      })),
      meta: { requestId: req.id },
    })
  } catch (error) {
    next(error)
  }
})

export default router
