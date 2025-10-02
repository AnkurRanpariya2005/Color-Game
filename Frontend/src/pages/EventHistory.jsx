"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { eventAction } from "../store/Event/event.js"
import { api } from "../config/Api.js"

export default function EventHistory() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const history = useSelector((state) => state.event.eventHistory)
  const dispatch = useDispatch()

  useEffect(() => {
    fetchEventHistory()
  }, [])

  const fetchEventHistory = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/api/events/history')
      if (response.data) {
        dispatch(eventAction.setEventHistory(response.data))
      }
    } catch (err) {
      console.error('Error fetching event history:', err)
      setError('Failed to load event history')
    } finally {
      setLoading(false)
    }
  }

  const colorCounts = history.reduce((acc, event) => {
    const color = typeof event === 'string' ? event : event.color || event.result
    if (color) {
      acc[color.toLowerCase()] = (acc[color.toLowerCase()] || 0) + 1
    }
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
          <div className="row" style={{ gap: 8 }}>
            <button 
              className="btn" 
              onClick={fetchEventHistory} 
              disabled={loading}
              style={{ textDecoration: "none" }}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <Link to="/" className="btn" style={{ textDecoration: "none" }}>
              Back to Game
            </Link>
          </div>
        </div>

        {error && (
          <div className="pill" style={{ color: 'var(--danger)' }}>
            {error}
          </div>
        )}

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
            {history.map((event, idx) => {
              const color = typeof event === 'string' ? event : event.color || event.result
              const colorLower = color?.toLowerCase()
              return (
                <div key={idx} className={`history-item ${colorLower}`}>
                  <div className="history-number">#{history.length - idx}</div>
                  <div className={`history-color ${colorLower}`}>
                    {colorLower === "red" ? "🔴" : colorLower === "green" ? "🟢" : "🔵"}
                  </div>
                  <div className="history-label">{color?.toUpperCase()}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
