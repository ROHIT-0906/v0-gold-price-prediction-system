import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User.js"

const signToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  })
}

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" })
    }
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ message: "Email already in use" })
    }
    const salt = await bcrypt.genSalt(10)
    const hashed = await bcrypt.hash(password, salt)
    const user = await User.create({ name, email, password: hashed })

    const token = signToken(user)
    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
    })
  } catch (err) {
    console.error("[auth] signup error", err)
    return res.status(500).json({ message: "Server error" })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }
    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" })
    }
    const token = signToken(user)
    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
    })
  } catch (err) {
    console.error("[auth] login error", err)
    return res.status(500).json({ message: "Server error" })
  }
}

export const logout = async (_req, res) => {
  // Stateless JWT: client should remove token; route exists for symmetry
  return res.json({ message: "Logged out successfully" })
}
