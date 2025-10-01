"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useAuth } from "../context/AuthContext.jsx"

const HISTORY_KEY = "cg_history_v1"

const COLORS = [
  { key: "red", label: "Red", className: "red", multiplier: 2 },
  { key: "green", label: "Green", className: "green", multiplier: 2 },
  { key: "blue", label: "Blue", className: "blue", multiplier: 2 },
]

function getRoundPhase(nowMs) {
  const seconds = Math.floor(nowMs / 1000)
  const mod = seconds % 70
  if (mod < 60) {
    return { phase: "bet", remaining: 60 - mod }
  }
  return { phase: "result", remaining: 70 - mod }
}

function Confetti({ color }) {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 0.5,
  }))

  return (
    <div className="confetti-container">
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.x}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            background: color === "red" ? "#ef4444" : color === "green" ? "#10b981" : "#3b82f6",
          }}
        />
      ))}
    </div>
  )
}

export default function Game() {
  const { user, balance, setBalance, updateProfile, addBetToHistory, betHistory } = useAuth()
  const [selected, setSelected] = useState(null)
  const [betsLocked, setBetsLocked] = useState(false)
  const [result, setResult] = useState(null)
  const [betAmount, setBetAmount] = useState(100)
  const [pendingBet, setPendingBet] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [lastWin, setLastWin] = useState(null)
  const [shake, setShake] = useState(false)
  const [currentTime, setCurrentTime] = useState(Date.now())

  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      if (raw) return JSON.parse(raw)
    } catch {}
    return []
  })

  const lastResolvedRoundRef = useRef(null)

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 60)))
  }, [history])

  useEffect(() => {
    let rafId
    const updateTimer = () => {
      const now = Date.now()
      setCurrentTime(now)
      const { phase, remaining } = getRoundPhase(now)
      setBetsLocked(phase === "result")

      if (phase === "result") {
        const currentRoundId = Math.floor(now / 1000 / 70)
        if (lastResolvedRoundRef.current !== currentRoundId) {
          resolveRound(currentRoundId)
          lastResolvedRoundRef.current = currentRoundId
        }
      } else {
        setResult(null)
        setShowConfetti(false)
      }

      rafId = requestAnimationFrame(updateTimer)
    }
    rafId = requestAnimationFrame(updateTimer)
    return () => cancelAnimationFrame(rafId)
  }, [])

  const timers = useMemo(() => {
    return getRoundPhase(currentTime)
  }, [currentTime])

  function placeBet(colorKey) {
    if (betsLocked) return
    setSelected(colorKey)
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
  }

  function confirmBet() {
    if (betsLocked || !selected) return
    const currentRoundId = Math.floor(Date.now() / 1000 / 70)
    if (pendingBet && pendingBet.roundId === currentRoundId) return
    if (betAmount <= 0) return
    if (betAmount > balance) return

    const nextBalance = balance - betAmount
    setBalance(nextBalance)
    updateProfile({ balance: nextBalance })
    setPendingBet({ roundId: currentRoundId, color: selected, amount: betAmount })
    if (navigator.vibrate) {
      navigator.vibrate([20, 10, 20])
    }
  }

  function resolveRound(currentRoundId) {
    const winning = COLORS[Math.floor(Math.random() * COLORS.length)].key
    setResult(winning)
    setHistory((h) => [winning, ...h].slice(0, 50))

    if (pendingBet && pendingBet.roundId === currentRoundId) {
      const won = pendingBet.color === winning
      const payout = won ? pendingBet.amount * 2 : 0

      if (user) {
        addBetToHistory({
          roundId: currentRoundId,
          timestamp: Date.now(),
          betColor: pendingBet.color,
          betAmount: pendingBet.amount,
          result: winning,
          won,
          payout,
        })
      }

      if (won) {
        const next = balance + payout
        setBalance(next)
        updateProfile({ balance: next })
        setShowConfetti(true)
        setLastWin(winning)
        if (navigator.vibrate) {
          navigator.vibrate([50, 30, 50, 30, 50])
        }
      } else {
        setShake(true)
        setTimeout(() => setShake(false), 500)
        if (navigator.vibrate) {
          navigator.vibrate(100)
        }
      }
      setPendingBet(null)
      setSelected(null)
    }
  }

  const progressPercent =
    timers.phase === "bet" ? ((60 - timers.remaining) / 60) * 100 : ((10 - timers.remaining) / 10) * 100

  return (
    <div className={`game-wrap ${shake ? "shake" : ""}`}>
      {showConfetti && lastWin && <Confetti color={lastWin} />}

      <div className="card col" style={{ gap: 16 }}>
        <div className="row" style={{ justifyContent: "space-between", width: "100%" }}>
          <div className="row" style={{ gap: 10 }}>
            <span className={`pill phase-pill ${timers.phase}`}>
              {timers.phase === "bet" ? "🎯 Betting" : "🎲 Result"}
            </span>
            <span className={`pill timer-pill ${timers.remaining <= 10 ? "urgent" : ""}`}>
              ⏱️ {String(timers.remaining).padStart(2, "0")}s
            </span>
          </div>
          <div className={`pill ${pendingBet ? "locked-pill" : ""}`}>
            {pendingBet ? `🔒 Locked: $${pendingBet.amount}` : `✅ Ready`}
          </div>
        </div>
        <div className="progress">
          <div className={`bar ${timers.phase}`} style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="result-overlay">
        {result && <div className={`badge result-badge ${result}`}>🎉 Result: {result.toUpperCase()}</div>}
        <div className="color-grid">
          {COLORS.map((c) => (
            <button
              key={c.key}
              disabled={betsLocked}
              onClick={() => placeBet(c.key)}
              className={`btn color-btn ${c.className} ${selected === c.key ? "selected" : ""} ${
                result === c.key ? "winner" : ""
              } ${betsLocked && pendingBet?.color === c.key ? "pending" : ""}`}
            >
              <span className="color-label">{c.label}</span>
              {selected === c.key && <span className="selected-indicator">✓</span>}
              {result === c.key && <span className="winner-indicator">🏆</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="card col" style={{ gap: 16 }}>
        <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>💰 Bet Controls</h3>
        <div className="bet-controls">
          <div className="bet-input-group">
            <input
              type="number"
              min="1"
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, Math.floor(Number(e.target.value) || 0)))}
              className="bet-input"
              placeholder="Enter amount"
            />
            <div className="chips">
              {[50, 100, 200, 500, 1000].map((v) => (
                <button
                  key={v}
                  className={`chip-btn ${betAmount === v ? "active" : ""}`}
                  onClick={() => setBetAmount(v)}
                >
                  ${v}
                </button>
              ))}
            </div>
          </div>
          <button
            className={`btn confirm-btn ${pendingBet ? "confirmed" : ""}`}
            disabled={betsLocked || !selected || betAmount > balance}
            onClick={confirmBet}
            style={{ width: "100%" }}
          >
            {pendingBet
              ? "✓ Bet Placed"
              : selected
                ? `🎲 Place $${betAmount} on ${selected.toUpperCase()}`
                : "👆 Select a color"}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
          <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>📊 Result History</h3>
          <button
            className="btn clear-btn"
            onClick={() => setHistory([])}
            style={{ padding: "8px 16px", fontSize: "14px" }}
          >
            Clear
          </button>
        </div>
        <div className="history">
          {history.map((h, idx) => (
            <div key={idx} className={`dot ${h} ${idx === 0 ? "latest" : ""}`} title={h}></div>
          ))}
          {history.length === 0 && (
            <div style={{ color: "var(--muted)", padding: "20px 0", textAlign: "center" }}>No history yet.</div>
          )}
        </div>
      </div>

      {user && (
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
            <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>📜 Your Bet History</h3>
            <button
              className="btn clear-btn"
              onClick={() => updateProfile({ betHistory: [] })}
              style={{ padding: "8px 16px", fontSize: "14px" }}
            >
              Clear
            </button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="bet-history-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Bet</th>
                  <th>Amount</th>
                  <th>Result</th>
                  <th>Outcome</th>
                  <th>Payout</th>
                </tr>
              </thead>
              <tbody>
                {betHistory.slice(0, 20).map((bet, idx) => (
                  <tr key={idx} className={bet.won ? "win-row" : "loss-row"}>
                    <td>{new Date(bet.timestamp).toLocaleTimeString()}</td>
                    <td>
                      <span
                        className="color-indicator"
                        style={{
                          background:
                            bet.betColor === "red" ? "#ef4444" : bet.betColor === "green" ? "#10b981" : "#3b82f6",
                        }}
                      ></span>
                      {bet.betColor.toUpperCase()}
                    </td>
                    <td>${bet.betAmount}</td>
                    <td>
                      <span
                        className="color-indicator"
                        style={{
                          background: bet.result === "red" ? "#ef4444" : bet.result === "green" ? "#10b981" : "#3b82f6",
                        }}
                      ></span>
                      {bet.result.toUpperCase()}
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
        </div>
      )}
    </div>
  )
}
