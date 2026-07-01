import { NextRequest, NextResponse } from "next/server"
import logger from "@/lib/logger"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    logger.warn(
      `Client error: ${body.message}`,
      {
        event: "CLIENT_ERROR",
        message: body.message,
        url: body.url,
        userId: body.userId,
        userAgent: body.userAgent,
        timestamp: body.timestamp,
      }
    )
  } catch {
    // silently fail
  }
  return NextResponse.json({ status: "ok" })
}
