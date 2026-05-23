import { NextRequest } from "next/server"
import { query } from "@/lib/db"
import { success, requireAuth, handleApiError } from "@/lib/api-helpers"

export async function GET(req: NextRequest) {
  try {
    await requireAuth()
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

    return success(mapped)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth()
    const body = await req.json()
    const result = await query(
      `INSERT INTO inventory_items (name, category, sku, quantity, min_quantity, unit, unit_price, supplier_id, supplier_name, expiration_date, batch_number, location, branch_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [body.name, body.category, body.sku, body.quantity || 0, body.minQuantity || 10, body.unit, body.unitPrice || 0, body.supplierId || null, body.supplierName || null, body.expirationDate || null, body.batchNumber || null, body.location || null, body.branchId || null]
    )
    return success(result.rows[0], 201)
  } catch (err) {
    return handleApiError(err)
  }
}
