"use client"

import { useNavigate } from "react-router-dom"

export default function Navbar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  return (
    <header className="bg-white border-b">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <h1 className="font-semibold text-lg">Gold Price Dashboard</h1>
        <button onClick={handleLogout} className="rounded-md bg-gray-800 text-white px-4 py-2 hover:bg-gray-700">
          Logout
        </button>
      </div>
    </header>
  )
}
