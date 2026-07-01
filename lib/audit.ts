import { query } from "./db"

interface AuditEntry {
  userId: string
  action: string
  entityType: string
  entityId?: string
  details?: Record<string, unknown>
  ip?: string
  userAgent?: string
}

export async function auditLog(entry: AuditEntry) {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)`,
      [
        entry.userId,
        entry.action,
        entry.entityType,
        entry.entityId || null,
        entry.details ? JSON.stringify(entry.details) : null,
        entry.ip || null,
        entry.userAgent || null,
      ]
    )
  } catch {
    // audit failures should never crash the app
  }
}
