import { NextRequest } from "next/server"
import { query } from "@/lib/db"
import { success, requireAuth, handleApiError } from "@/lib/api-helpers"
import logger from "@/lib/logger"
import { auditLog } from "@/lib/audit"

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const result = await query(
      `SELECT i.*, s.name as supplier_name
       FROM inventory_items i
       LEFT JOIN suppliers s ON s.id = i.supplier_id
       ORDER BY i.name ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    )

    const mapped = result.rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      sku: r.sku,
      quantity: r.quantity,
      minQuantity: r.min_quantity,
      unit: r.unit,
      unitPrice: r.unit_price,
      supplier: r.supplier_name,
      supplierId: r.supplier_id,
      expirationDate: r.expiration_date,
      batchNumber: r.batch_number,
      location: r.location,
      branchId: r.branch_id,
    }))

    logger.info({ event: "INVENTORY_LISTED", userId: session.user.id, count: mapped.length })
    return success(mapped)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await req.json()
    const result = await query(
      `INSERT INTO inventory_items (name, category, sku, quantity, min_quantity, unit, unit_price, supplier_id, supplier_name, expiration_date, batch_number, location, branch_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [body.name, body.category, body.sku, body.quantity || 0, body.minQuantity || 10, body.unit, body.unitPrice || 0, body.supplierId || null, body.supplierName || null, body.expirationDate || null, body.batchNumber || null, body.location || null, body.branchId || null]
    )
    logger.info({ event: "INVENTORY_CREATED", userId: session.user.id, itemId: result.rows[0].id, itemName: body.name, quantity: body.quantity })
    auditLog({ userId: session.user.id, action: "create", entityType: "inventory_item", entityId: result.rows[0].id, details: { name: body.name, quantity: body.quantity } }).catch(() => {})
    return success(result.rows[0], 201)
  } catch (err) {
    return handleApiError(err)
  }
}
