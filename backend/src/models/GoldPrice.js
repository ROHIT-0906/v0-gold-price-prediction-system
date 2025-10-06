import mongoose from "mongoose"

const goldPriceSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    price: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
)

goldPriceSchema.index({ date: 1 }, { unique: true })

const GoldPrice = mongoose.model("GoldPrice", goldPriceSchema)
export default GoldPrice
