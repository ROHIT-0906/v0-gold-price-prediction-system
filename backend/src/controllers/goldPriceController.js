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
