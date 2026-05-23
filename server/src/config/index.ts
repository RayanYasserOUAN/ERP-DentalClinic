import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(__dirname, "../../.env") })

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  database: {
    url: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/dentflow",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "dev-secret-change-me",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-me",
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  isDev: (process.env.NODE_ENV || "development") === "development",
}
