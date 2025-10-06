import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import morgan from "morgan"
import connectDB from "./config/db.js"
import authRoutes from "./routes/authRoutes.js"
import goldPriceRoutes from "./routes/goldPriceRoutes.js"

dotenv.config()

const app = express()

// Middleware
app.use(express.json())
app.use(morgan("dev"))

// CORS - allow Vite dev server by default
const allowedOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173"
app.use(
  cors({
    origin: allowedOrigin,
    credentials: false,
  }),
)

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" })
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/gold-prices", goldPriceRoutes)

// Start server after DB connect
const PORT = process.env.PORT || 9090

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[backend] Server running on port ${PORT}`)
      console.log(`[backend] Allowed origin: ${allowedOrigin}`)
    })
  })
  .catch((err) => {
    console.error("[backend] Failed to connect DB:", err)
    process.exit(1)
  })
