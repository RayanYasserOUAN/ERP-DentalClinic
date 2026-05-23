import { Router } from "express"
import { query } from "../db/pool"
import { authenticate } from "../middleware/auth"

const router = Router()

router.get("/", authenticate, async (req, res, next) => {
  try {
    const result = await query(
      "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20",
      [req.user!.sub]
    )

    res.json({
      data: result.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        message: row.message,
        type: row.type,
        read: row.read,
        createdAt: row.created_at,
      })),
      meta: { requestId: req.id },
    })
  } catch (error) {
    next(error)
  }
})

router.patch("/:id/read", authenticate, async (req, res, next) => {
  try {
    await query(
      "UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user!.sub]
    )
    res.json({ data: { message: "Notification marked as read" }, meta: { requestId: req.id } })
  } catch (error) {
    next(error)
  }
})

router.post("/mark-all-read", authenticate, async (req, res, next) => {
  try {
    await query(
      "UPDATE notifications SET read = TRUE WHERE user_id = $1",
      [req.user!.sub]
    )
    res.json({ data: { message: "All notifications marked as read" }, meta: { requestId: req.id } })
  } catch (error) {
    next(error)
  }
})

export default router
