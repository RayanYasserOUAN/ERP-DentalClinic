import fs from "fs"
import path from "path"
import { pool } from "./pool"

async function migrate() {
  const client = await pool.connect()
  try {
    const sqlPath = path.resolve(__dirname, "../../migrations/001_initial_schema.sql")
    const sql = fs.readFileSync(sqlPath, "utf-8")

    console.log("Running migration: 001_initial_schema.sql")
    await client.query(sql)
    console.log("Migration completed successfully.")
  } catch (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
