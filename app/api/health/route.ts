import { NextResponse } from "next/server"
import logger from "@/lib/logger"

export async function GET() {
  logger.info("Health check requested", { event: "HEALTH_CHECK" })
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  })
}
