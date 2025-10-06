import GoldPrice from "../models/GoldPrice.js"
import fetch from "node-fetch"
import { AbortController } from "abort-controller"

const DEFAULT_REALTIME_URL = process.env.REALTIME_GOLD_URL || "https://data-asg.goldprice.org/dbXRates/USD"

async function fetchRealtimePrice() {
  // Attempt to fetch realtime gold price from a public source. Server-side to avoid CORS issues.
  // Tries multiple shapes defensively to parse a price.
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 7000)
  try {
    const res = await fetch(DEFAULT_REALTIME_URL, {
      signal: controller.signal,
      headers: {
        accept: "application/json,text/plain,*/*",
        "user-agent": "v0-gold-price-prediction",
      },
    })
    if (!res.ok) throw new Error(`bad status ${res.status}`)
    const json = await res.json()

    // Heuristics to extract price
    let price = null
    const source = DEFAULT_REALTIME_URL

    // goldprice.org format: { items: [{ xauPrice, ... }], ts: ... }
    if (!price && json?.items?.[0]?.xauPrice != null) {
      price = Number(json.items[0].xauPrice)
    }

    // metals.live or other formats (array of objects)
    if (!price && Array.isArray(json) && json.length > 0) {
      const first = json[0]
      if (typeof first === "number") {
        price = Number(first)
      } else if (first?.price != null) {
        price = Number(first.price)
      }
    }

    // direct shape { price: ... }
    if (!price && json?.price != null) {
      price = Number(json.price)
    }

    // potential nested rates
    if (!price && json?.rates?.XAU != null) {
      price = Number(json.rates.XAU)
    }

    if (!price || Number.isNaN(price)) {
      throw new Error("Unable to parse realtime price from source")
    }

    return {
      price,
      source,
      fetchedAt: new Date().toISOString(),
    }
  } finally {
    clearTimeout(timeout)
  }
}

export const createGoldPrice = async (req, res) => {
  try {
    const { date, price } = req.body
    if (!date || price === undefined) {
      return res.status(400).json({ message: "date and price are required" })
    }
    const doc = await GoldPrice.create({ date, price })
    return res.status(201).json(doc)
  } catch (err) {
    console.error("[gold] create error", err)
    if (err.code === 11000) {
      return res.status(409).json({ message: "Price for this date already exists" })
    }
    return res.status(500).json({ message: "Server error" })
  }
}

export const getAllGoldPrices = async (_req, res) => {
  try {
    const list = await GoldPrice.find().sort({ date: -1 })
    return res.json(list)
  } catch (err) {
    console.error("[gold] list error", err)
    return res.status(500).json({ message: "Server error" })
  }
}

export const updateGoldPrice = async (req, res) => {
  try {
    const { id } = req.params
    const { date, price } = req.body
    const updated = await GoldPrice.findByIdAndUpdate(
      id,
      { ...(date ? { date } : {}), ...(price !== undefined ? { price } : {}) },
      { new: true },
    )
    if (!updated) return res.status(404).json({ message: "Not found" })
    return res.json(updated)
  } catch (err) {
    console.error("[gold] update error", err)
    return res.status(500).json({ message: "Server error" })
  }
}

export const deleteGoldPrice = async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await GoldPrice.findByIdAndDelete(id)
    if (!deleted) return res.status(404).json({ message: "Not found" })
    return res.json({ message: "Deleted", id })
  } catch (err) {
    console.error("[gold] delete error", err)
    return res.status(500).json({ message: "Server error" })
  }
}

export const getRealtimeGoldPrice = async (_req, res) => {
  try {
    const rt = await fetchRealtimePrice()
    return res.json(rt)
  } catch (err) {
    console.error("[gold] realtime error", err?.message || err)
    return res.status(502).json({ message: "Failed to fetch realtime price" })
  }
}

export const predictGoldPrice = async (req, res) => {
  try {
    const days = Math.max(1, Math.min(365, Number(req.query.days) || 7))
    const useRealtime = String(req.query.useRealtime || "0") === "1"
    const data = await GoldPrice.find().sort({ date: 1 }) // ascending by date

    if (data.length === 0) {
      return res.status(400).json({ message: "No data available to predict" })
    }

    // Optionally augment with realtime as the most recent point
    let augmented = [...data]
    let realtimeUsed = null
    if (useRealtime) {
      try {
        const rt = await fetchRealtimePrice()
        realtimeUsed = rt
        augmented = [
          ...augmented,
          {
            date: new Date(), // now
            price: rt.price,
          },
        ]
      } catch (e) {
        console.warn("[gold] unable to augment with realtime, continuing without it")
      }
    }

    // If only one point after augmentation, naive hold
    if (augmented.length === 1) {
      const last = augmented[0]
      const predictedDate = new Date(last.date)
      predictedDate.setDate(predictedDate.getDate() + days)
      return res.json({
        method: "naive",
        inputDays: days,
        latestDate: last.date,
        predictedDate,
        predictedPrice: Math.max(0, last.price),
        realtimeUsed,
      })
    }

    // Prepare arrays
    const xs = augmented.map((d) => new Date(d.date).getTime() / (1000 * 60 * 60 * 24))
    const ys = augmented.map((d) => d.price)
    const n = xs.length
    const meanX = xs.reduce((a, b) => a + b, 0) / n
    const meanY = ys.reduce((a, b) => a + b, 0) / n

    let num = 0
    let den = 0
    for (let i = 0; i < n; i++) {
      const dx = xs[i] - meanX
      num += dx * (ys[i] - meanY)
      den += dx * dx
    }
    const slope = den === 0 ? 0 : num / den
    const intercept = meanY - slope * meanX

    // R²
    let ssTot = 0
    let ssRes = 0
    for (let i = 0; i < n; i++) {
      const yHat = intercept + slope * xs[i]
      ssTot += Math.pow(ys[i] - meanY, 2)
      ssRes += Math.pow(ys[i] - yHat, 2)
    }
    const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot

    const lastDate = augmented[augmented.length - 1].date
    const lastX = new Date(lastDate).getTime() / (1000 * 60 * 60 * 24)
    const futureX = lastX + days
    const lrPred = intercept + slope * futureX

    // Returns-based fallback when regression is near-flat or poor fit
    let method = "linear_regression"
    let predictedPrice = Math.max(0, lrPred)
    const EPS = 1e-6
    if (Math.abs(slope) < EPS || r2 < 0.05) {
      // Compute average daily return over last up to 7 intervals
      const returns = []
      for (let i = 1; i < augmented.length; i++) {
        const prev = augmented[i - 1].price
        const cur = augmented[i].price
        if (prev > 0) returns.push((cur - prev) / prev)
      }
      const recent = returns.slice(-7)
      const avgR = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : 0
      const lastPrice = augmented[augmented.length - 1].price
      predictedPrice = Math.max(0, lastPrice * Math.pow(1 + avgR, days))
      method = "avg_returns_fallback"
    }

    const predictedDate = new Date(lastDate)
    predictedDate.setDate(predictedDate.getDate() + days)

    return res.json({
      method,
      inputDays: days,
      latestDate: lastDate,
      predictedDate,
      predictedPrice,
      slope,
      intercept,
      r2,
      realtimeUsed,
    })
  } catch (err) {
    console.error("[gold] predict error", err)
    return res.status(500).json({ message: "Server error" })
  }
}
