import { Pool } from "pg"
import logger from "./logger"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

pool.on("error", (err) => {
  logger.error(err.message, { event: "DB_POOL_ERROR" })
})

export async function query(text: string, params?: unknown[]) {
  const start = Date.now()
  try {
    const result = await pool.query(text, params)
    const duration = Date.now() - start
    logger.info("DB query", {
      event: "DB_QUERY",
      duration,
      rows: result.rowCount ?? 0,
      query: text.substring(0, 200),
    })
    return result
  } catch (err) {
    const duration = Date.now() - start
    const error = err instanceof Error ? err : new Error(String(err))
    logger.error(
      error.message,
      {
        event: "DB_QUERY_ERROR",
        duration,
        query: text.substring(0, 200),
        error: error.message,
      }
    )
    throw err
  }
}
