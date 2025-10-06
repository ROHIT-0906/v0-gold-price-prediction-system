import { Router } from "express"
import { authRequired } from "../middleware/auth.js"
import {
  createGoldPrice,
  getAllGoldPrices,
  updateGoldPrice,
  deleteGoldPrice,
  predictGoldPrice,
  getRealtimeGoldPrice,
} from "../controllers/goldPriceController.js"

const router = Router()

// Protect all routes
router.use(authRequired)

router.get("/", getAllGoldPrices)
router.post("/", createGoldPrice)
router.put("/:id", updateGoldPrice)
router.delete("/:id", deleteGoldPrice)
// Add prediction route (protected)
router.get("/predict", predictGoldPrice)
// Add realtime route
router.get("/realtime", getRealtimeGoldPrice)

export default router
