"use client"

import { useMemo } from "react"

function formatDate(d) {
  return d.toLocaleDateString()
}

export default function PriceChart({ data, predictedLine }) {
  // Normalize width/height via viewBox for responsiveness
  const width = 800
  const height = 320
  const padding = { top: 20, right: 20, bottom: 40, left: 48 }

  const points = useMemo(() => {
    // Merge domain candidates from data and predictedLine
    const allX = [
      ...data.map((d) => d.date.getTime()),
      ...(Array.isArray(predictedLine) ? predictedLine.map((d) => d.date.getTime()) : []),
    ]
    const allY = [
      ...data.map((d) => d.price),
      ...(Array.isArray(predictedLine) ? predictedLine.map((d) => d.price) : []),
    ]
    const minX = Math.min(...allX)
    const maxX = Math.max(...allX)
    const minY = Math.min(...allY)
    const maxY = Math.max(...allY)

    const innerW = width - padding.left - padding.right
    const innerH = height - padding.top - padding.bottom

    const scaleX = (x) => {
      if (maxX === minX) return padding.left + innerW / 2
      return padding.left + ((x - minX) / (maxX - minX)) * innerW
    }
    const scaleY = (y) => {
      if (maxY === minY) return padding.top + innerH / 2
      return padding.top + (1 - (y - minY) / (maxY - minY)) * innerH
    }

    const main = data.map((d) => [scaleX(d.date.getTime()), scaleY(d.price)])
    const pred =
      Array.isArray(predictedLine) && predictedLine.length >= 2
        ? predictedLine.map((d) => [scaleX(d.date.getTime()), scaleY(d.price)])
        : null

    // Build simple x ticks: first, middle, last (now uses expanded domain)
    const ticks = [
      { x: padding.left, label: new Date(minX).toLocaleDateString() },
      { x: padding.left + (width - padding.left - padding.right) / 2, label: "…" },
      { x: width - padding.right, label: new Date(maxX).toLocaleDateString() },
    ]

    // y ticks: min, mid, max
    const yTicks = [
      { y: padding.top + (height - padding.top - padding.bottom), label: minY.toFixed(2) },
      { y: padding.top + (height - padding.top - padding.bottom) / 2, label: ((minY + maxY) / 2).toFixed(2) },
      { y: padding.top, label: maxY.toFixed(2) },
    ]

    return { main, pred, ticks, yTicks }
  }, [data, predictedLine])

  const linePath = (pts) => pts.map((p) => p.join(",")).join(" ")

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[320px]">
      {/* Axes */}
      <line x1={48} y1={height - 40} x2={width - 20} y2={height - 40} stroke="#e5e7eb" />
      <line x1={48} y1={20} x2={48} y2={height - 40} stroke="#e5e7eb" />

      {/* Main historical line */}
      {points.main.length > 1 && (
        <polyline fill="none" stroke="#0ea5e9" /* sky-500 */ strokeWidth="2" points={linePath(points.main)} />
      )}

      {/* Predicted line segment */}
      {points.pred && (
        <polyline
          fill="none"
          stroke="#10b981" /* emerald-500 */
          strokeDasharray="6 4"
          strokeWidth="2"
          points={linePath(points.pred)}
        />
      )}

      {/* X ticks */}
      {points.ticks.map((t, i) => (
        <g key={i}>
          <line x1={t.x} y1={height - 40} x2={t.x} y2={height - 44} stroke="#9ca3af" />
          <text x={t.x} y={height - 20} textAnchor="middle" fontSize="12" fill="#374151">
            {t.label}
          </text>
        </g>
      ))}

      {/* Y ticks */}
      {points.yTicks.map((t, i) => (
        <g key={i}>
          <line x1={48} y1={t.y} x2={44} y2={t.y} stroke="#9ca3af" />
          <text x={40} y={t.y + 4} textAnchor="end" fontSize="12" fill="#374151">
            {t.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
