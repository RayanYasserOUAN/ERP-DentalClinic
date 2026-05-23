import { Router } from "express"
import { z } from "zod"
import { query } from "../db/pool"
import { authenticate } from "../middleware/auth"
import { validate } from "../middleware/validate"

const router = Router()

router.get("/", authenticate, async (req, res, next) => {
  try {
    const { category, search, lowStock, branchId, page = "1", limit = "50" } = req.query as Record<string, string>
    const offset = (parseInt(page) - 1) * parseInt(limit)
    const conditions: string[] = []
    const params: unknown[] = []
    let idx = 1

    if (search) { conditions.push(`i.name ILIKE $${idx}`); params.push(`%${search}%`); idx++ }
    if (category) { conditions.push(`i.category = $${idx}`); params.push(category); idx++ }
    if (lowStock === "true") { conditions.push(`i.quantity <= i.min_quantity`) }
    if (branchId) { conditions.push(`i.branch_id = $${idx}`); params.push(branchId); idx++ }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    const countResult = await query(`SELECT COUNT(*) FROM inventory_items i ${whereClause}`, params)
    const total = parseInt(countResult.rows[0].count)

    const result = await query(
      `SELECT i.* FROM inventory_items i ${whereClause}
       ORDER BY i.name ASC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, parseInt(limit), offset]
    )

    const rows = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      sku: row.sku,
      quantity: row.quantity,
      minQuantity: row.min_quantity,
      unit: row.unit,
      unitPrice: parseFloat(row.unit_price),
      supplier: row.supplier_name,
      expirationDate: row.expiration_date,
      batchNumber: row.batch_number,
      location: row.location,
      image: row.image,
      branchId: row.branch_id,
      createdAt: row.created_at,
    }))

    res.json({
      data: rows,
      pagination: { total, limit: parseInt(limit), offset, has_more: offset + parseInt(limit) < total },
      meta: { requestId: req.id },
    })
  } catch (error) {
    next(error)
  }
})

router.get("/low-stock", authenticate, async (req, res, next) => {
  try {
    const result = await query(
      "SELECT * FROM inventory_items WHERE quantity <= min_quantity ORDER BY (quantity::float / NULLIF(min_quantity, 0)) ASC"
    )

    res.json({
      data: result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        sku: row.sku,
        quantity: row.quantity,
        minQuantity: row.min_quantity,
        unit: row.unit,
        supplier: row.supplier_name,
      })),
      meta: { requestId: req.id },
    })
  } catch (error) {
    next(error)
  }
})

router.get("/summary", authenticate, async (req, res, next) => {
  try {
    const totalResult = await query("SELECT COUNT(*) as total FROM inventory_items")
    const lowResult = await query("SELECT COUNT(*) as total FROM inventory_items WHERE quantity <= min_quantity")
    const valueResult = await query("SELECT COALESCE(SUM(quantity * unit_price), 0) as value FROM inventory_items")

    res.json({
      data: {
        totalItems: parseInt(totalResult.rows[0].total),
        lowStockItems: parseInt(lowResult.rows[0].total),
        totalValue: parseFloat(valueResult.rows[0].value),
      },
      meta: { requestId: req.id },
    })
  } catch (error) {
    next(error)
  }
})

export default router
