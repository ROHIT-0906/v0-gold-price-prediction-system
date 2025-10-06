import mongoose from "mongoose"

const connectDB = async () => {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error("MONGODB_URI not set in environment")
  }
  mongoose.set("strictQuery", true)
  await mongoose.connect(uri, { autoIndex: true })
  console.log("[backend] MongoDB connected")
}

export default connectDB
