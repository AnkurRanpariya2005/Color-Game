"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { eventAction } from "../store/Event/event.js"
import { api } from "../config/Api.js"

export default function BetHistory() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const user = useSelector((state) => state.user)
  const betHistory = useSelector((state) => state.event.betHistory)
  const dispatch = useDispatch()

  useEffect(() => {
    fetchBetHistory()
  }, [])

  const fetchBetHistory = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/api/bets/history')
      if (response.data) {
        dispatch(eventAction.setBetHistory(response.data))
      }
    } catch (err) {
      console.error('Error fetching bet history:', err)
      setError('Failed to load bet history')
    } finally {
      setLoading(false)
    }
  }

  if (!user.token || !user.email) {
    return (
      <div className="page-container">
        <div className="card col" style={{ textAlign: "center", gap: 20 }}>
          <h1>🔒 Login Required</h1>
          <p>Please login to view your bet history</p>
          <Link to="/login" className="btn">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  const totalBets = betHistory.length
  const totalWins = betHistory.filter((b) => b.won).length
  const totalLosses = totalBets - totalWins
  const totalWagered = betHistory.reduce((sum, b) => sum + b.betAmount, 0)
  const totalPayout = betHistory.reduce((sum, b) => sum + (b.won ? b.payout : 0), 0)
  const netProfit = totalPayout - totalWagered
  const winRate = totalBets > 0 ? ((totalWins / totalBets) * 100).toFixed(1) : 0

  return (
    <div className="page-container">
      <div className="card col" style={{ gap: 20 }}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ margin: 0 }}>📜 Your Bet History</h1>
          <div className="row" style={{ gap: 8 }}>
            <button 
              className="btn" 
              onClick={fetchBetHistory} 
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
            <div className="stat-label">Total Bets</div>
            <div className="stat-value">{totalBets}</div>
          </div>
          <div className="stat-card win">
            <div className="stat-label">Wins</div>
            <div className="stat-value">{totalWins}</div>
          </div>
          <div className="stat-card loss">
            <div className="stat-label">Losses</div>
            <div className="stat-value">{totalLosses}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Win Rate</div>
            <div className="stat-value">{winRate}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Wagered</div>
            <div className="stat-value">${totalWagered}</div>
          </div>
          <div className={`stat-card ${netProfit >= 0 ? "win" : "loss"}`}>
            <div className="stat-label">Net Profit</div>
            <div className="stat-value">
              {netProfit >= 0 ? "+" : ""}${netProfit}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>All Bets</h2>
        {betHistory.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>
            <p>No bets placed yet. Start playing to see your history!</p>
            <Link to="/" className="btn" style={{ textDecoration: "none", marginTop: 16 }}>
              Play Now
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="bet-history-table">
              <thead>
                <tr>
                  <th>Round</th>
                  <th>Time</th>
                  <th>Bet Color</th>
                  <th>Amount</th>
                  <th>Result</th>
                  <th>Outcome</th>
                  <th>Payout</th>
                </tr>
              </thead>
              <tbody>
                {betHistory.map((bet, idx) => (
                  <tr key={idx} className={bet.won ? "win-row" : "loss-row"}>
                    <td>#{bet.roundId}</td>
                    <td>{new Date(bet.timestamp).toLocaleString()}</td>
                    <td>
                      <div className="row" style={{ gap: 8, alignItems: "center" }}>
                        <span
                          className="color-indicator"
                          style={{
                            background:
                              bet.betColor === "red" ? "#ef4444" : bet.betColor === "green" ? "#10b981" : "#3b82f6",
                          }}
                        ></span>
                        {bet.betColor.toUpperCase()}
                      </div>
                    </td>
                    <td>${bet.betAmount}</td>
                    <td>
                      <div className="row" style={{ gap: 8, alignItems: "center" }}>
                        <span
                          className="color-indicator"
                          style={{
                            background:
                              bet.result === "red" ? "#ef4444" : bet.result === "green" ? "#10b981" : "#3b82f6",
                          }}
                        ></span>
                        {bet.result.toUpperCase()}
                      </div>
                    </td>
                    <td>
                      <span className={`bet-result ${bet.won ? "win" : "loss"}`}>{bet.won ? "✓ WIN" : "✗ LOSS"}</span>
                    </td>
                    <td className={`payout ${bet.won ? "win" : "loss"}`}>
                      {bet.won ? `+$${bet.payout}` : `-$${bet.betAmount}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
