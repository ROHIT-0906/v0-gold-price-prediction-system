"use client"

import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import api from "../api/axios"

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || "/dashboard"

  const [form, setForm] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await api.post("/auth/login", form)
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user", JSON.stringify(res.data.user))
      navigate(from)
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Log in</h2>
        {error && <p className="text-red-600 mb-3">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              className="w-full border rounded-md px-3 py-2"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-sky-500 text-white py-2 hover:bg-sky-600 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Log in"}
          </button>
        </form>
        <p className="text-sm mt-3">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-sky-600 underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  )
}
