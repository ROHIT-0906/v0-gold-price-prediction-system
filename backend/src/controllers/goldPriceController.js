import GoldPrice from "../models/GoldPrice.js"

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

export const predictGoldPrice = async (req, res) => {
  try {
    const days = Math.max(1, Math.min(365, Number(req.query.days) || 7))
    const data = await GoldPrice.find().sort({ date: 1 }) // ascending by date

    if (data.length === 0) {
      return res.status(400).json({ message: "No data available to predict" })
    }

    // If only one point, naive hold
    if (data.length === 1) {
      const last = data[0]
      const predictedDate = new Date(last.date)
      predictedDate.setDate(predictedDate.getDate() + days)
      return res.json({
        method: "naive",
        inputDays: days,
        latestDate: last.date,
        predictedDate,
        predictedPrice: Math.max(0, last.price),
      })
    }

    // Simple linear regression: price ~ a + b * time_in_days
    const xs = data.map((d) => new Date(d.date).getTime() / (1000 * 60 * 60 * 24))
    const ys = data.map((d) => d.price)
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

    const lastDate = data[data.length - 1].date
    const lastX = new Date(lastDate).getTime() / (1000 * 60 * 60 * 24)
    const futureX = lastX + days
    const rawPredicted = intercept + slope * futureX
    const predictedPrice = Math.max(0, rawPredicted)

    // R² for reference
    let ssTot = 0
    let ssRes = 0
    for (let i = 0; i < n; i++) {
      const yHat = intercept + slope * xs[i]
      ssTot += Math.pow(ys[i] - meanY, 2)
      ssRes += Math.pow(ys[i] - yHat, 2)
    }
    const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot

    const predictedDate = new Date(lastDate)
    predictedDate.setDate(predictedDate.getDate() + days)

    return res.json({
      method: "linear_regression",
      inputDays: days,
      latestDate: lastDate,
      predictedDate,
      predictedPrice,
      slope,
      intercept,
      r2,
    })
  } catch (err) {
    console.error("[gold] predict error", err)
    return res.status(500).json({ message: "Server error" })
  }
}
