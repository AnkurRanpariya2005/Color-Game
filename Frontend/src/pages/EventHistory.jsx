"use client"

import { useState } from "react"
import { Link } from "react-router-dom"

const HISTORY_KEY = "cg_history_v1"

export default function EventHistory() {
  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      if (raw) return JSON.parse(raw)
    } catch {}
    return []
  })

  const colorCounts = history.reduce((acc, color) => {
    acc[color] = (acc[color] || 0) + 1
    return acc
  }, {})

  const totalEvents = history.length
  const redCount = colorCounts.red || 0
  const greenCount = colorCounts.green || 0
  const blueCount = colorCounts.blue || 0

  const redPercent = totalEvents > 0 ? ((redCount / totalEvents) * 100).toFixed(1) : 0
  const greenPercent = totalEvents > 0 ? ((greenCount / totalEvents) * 100).toFixed(1) : 0
  const bluePercent = totalEvents > 0 ? ((blueCount / totalEvents) * 100).toFixed(1) : 0

  return (
    <div className="page-container">
      <div className="card col" style={{ gap: 20 }}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ margin: 0 }}>📊 Event History</h1>
          <Link to="/" className="btn" style={{ textDecoration: "none" }}>
            Back to Game
          </Link>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Events</div>
            <div className="stat-value">{totalEvents}</div>
          </div>
          <div
            className="stat-card"
            style={{ background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))" }}
          >
            <div className="stat-label">🔴 Red</div>
            <div className="stat-value">
              {redCount} ({redPercent}%)
            </div>
          </div>
          <div
            className="stat-card"
            style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))" }}
          >
            <div className="stat-label">🟢 Green</div>
            <div className="stat-value">
              {greenCount} ({greenPercent}%)
            </div>
          </div>
          <div
            className="stat-card"
            style={{ background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))" }}
          >
            <div className="stat-label">🔵 Blue</div>
            <div className="stat-value">
              {blueCount} ({bluePercent}%)
            </div>
          </div>
        </div>

        <div className="distribution-chart">
          <div className="chart-bar" style={{ width: `${redPercent}%`, background: "#ef4444" }}>
            {redPercent > 5 && <span>{redPercent}%</span>}
          </div>
          <div className="chart-bar" style={{ width: `${greenPercent}%`, background: "#10b981" }}>
            {greenPercent > 5 && <span>{greenPercent}%</span>}
          </div>
          <div className="chart-bar" style={{ width: `${bluePercent}%`, background: "#3b82f6" }}>
            {bluePercent > 5 && <span>{bluePercent}%</span>}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Recent Results</h2>
        {history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>
            <p>No events yet. Play the game to see results!</p>
            <Link to="/" className="btn" style={{ textDecoration: "none", marginTop: 16 }}>
              Play Now
            </Link>
          </div>
        ) : (
          <div className="history-grid">
            {history.map((color, idx) => (
              <div key={idx} className={`history-item ${color}`}>
                <div className="history-number">#{history.length - idx}</div>
                <div className={`history-color ${color}`}>
                  {color === "red" ? "🔴" : color === "green" ? "🟢" : "🔵"}
                </div>
                <div className="history-label">{color.toUpperCase()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
