import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

pool.on("error", (err) => {
  console.error("Unexpected pool error:", err)
})

export async function query(text: string, params?: unknown[]) {
  const start = Date.now()
  const result = await pool.query(text, params)
  const duration = Date.now() - start
  if (process.env.NODE_ENV === "development" && duration > 100) {
    console.warn(`Slow query (${duration}ms):`, text.substring(0, 100))
  }
  return result
}
