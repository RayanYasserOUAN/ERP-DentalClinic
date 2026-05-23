import express from "express"
import cors from "cors"
import helmet from "helmet"
import crypto from "crypto"
import { config } from "./config"
import { errorHandler } from "./middleware/errorHandler"
import { apiLimiter } from "./middleware/rateLimiter"

import authRoutes from "./routes/auth"
import patientRoutes from "./routes/patients"
import appointmentRoutes from "./routes/appointments"
import billingRoutes from "./routes/billing"
import inventoryRoutes from "./routes/inventory"
import staffRoutes from "./routes/staff"
import treatmentRoutes from "./routes/treatments"
import dashboardRoutes from "./routes/dashboard"
import branchRoutes from "./routes/branches"
import notificationRoutes from "./routes/notifications"

const app = express()

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }))
app.use(cors({ origin: config.frontendUrl, credentials: true }))
app.use(express.json({ limit: "10mb" }))

app.use((req, _res, next) => {
  req.id = req.headers["x-request-id"] as string || crypto.randomUUID()
  next()
})

app.use("/api", apiLimiter)

app.use("/api/auth", authRoutes)
app.use("/api/patients", patientRoutes)
app.use("/api/appointments", appointmentRoutes)
app.use("/api/billing", billingRoutes)
app.use("/api/inventory", inventoryRoutes)
app.use("/api/staff", staffRoutes)
app.use("/api/treatments", treatmentRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/branches", branchRoutes)
app.use("/api/notifications", notificationRoutes)

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

app.use(errorHandler)

app.listen(config.port, () => {
  console.log(`\n  🦷 DentFlow API Server`)
  console.log(`  ──────────────────────`)
  console.log(`  Mode:    ${config.nodeEnv}`)
  console.log(`  Port:    ${config.port}`)
  console.log(`  Frontend: ${config.frontendUrl}`)
  console.log(`  API:     http://localhost:${config.port}/api\n`)
})
