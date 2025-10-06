"use client"

import { useEffect, useState } from "react"
import api from "../api/axios"
import Navbar from "../components/Navbar"

export default function Dashboard() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ date: "", price: "" })
  const [submitting, setSubmitting] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get("/gold-prices")
      setItems(res.data)
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const addItem = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await api.post("/gold-prices", {
        date: form.date,
        price: Number(form.price),
      })
      setForm({ date: "", price: "" })
      fetchData()
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add price")
    } finally {
      setSubmitting(false)
    }
  }

  const deleteItem = async (id) => {
    try {
      await api.delete(`/gold-prices/${id}`)
      setItems((prev) => prev.filter((it) => it._id !== id))
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete")
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <h2 className="text-2xl font-semibold mb-4">Current Gold Prices</h2>

        <section className="mb-6 bg-white border rounded-lg p-4">
          <h3 className="font-medium mb-3">Add New Price</h3>
          {error && <p className="text-red-600 mb-3">{error}</p>}
          <form onSubmit={addItem} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm mb-1" htmlFor="date">
                Date
              </label>
              <input
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={onChange}
                className="w-full border rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="price">
                Price
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={onChange}
                className="w-full border rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-md bg-sky-500 text-white py-2 hover:bg-sky-600 disabled:opacity-50"
              >
                {submitting ? "Adding..." : "Add"}
              </button>
            </div>
          </form>
        </section>

        <section className="bg-white border rounded-lg p-4">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Price</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td className="p-2" colSpan="3">
                        No records yet.
                      </td>
                    </tr>
                  ) : (
                    items.map((it) => (
                      <tr key={it._id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{new Date(it.date).toLocaleDateString()}</td>
                        <td className="p-2">{it.price}</td>
                        <td className="p-2">
                          <button
                            onClick={() => deleteItem(it._id)}
                            className="text-white bg-red-600 hover:bg-red-700 rounded px-3 py-1"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
