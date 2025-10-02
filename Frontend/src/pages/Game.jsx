"use client"

import { useEffect, useRef, useState } from "react"

import SockJS from "sockjs-client"
import { Stomp } from "@stomp/stompjs"

import { useSelector } from "react-redux"
import { eventAction } from "../store/Event/event"
import { useDispatch } from "react-redux"
const HISTORY_KEY = "cg_history_v1"

const COLORS = [
  { key: "RED", label: "Red", className: "red", multiplier: 2 },
  { key: "GREEN", label: "Green", className: "green", multiplier: 2 },
  { key: "BLUE", label: "Blue", className: "blue", multiplier: 2 },
]

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
            background:
              color === "red"
                ? "#ef4444"
                : color === "green"
                ? "#10b981"
                : "#3b82f6",
          }}
        />
      ))}
    </div>
  )
}

/** Parse server ISO time robustly (handles microseconds by truncating to ms) */
function parseServerTimeToMs(isoString) {
  if (!isoString) return NaN
  // truncate fractional seconds to 3 digits if more are present
  // e.g. "2025-10-01T18:01:05.023077" -> "2025-10-01T18:01:05.023"
  const fixed = isoString.replace(/\.(\d{3})\d+/, ".$1")
  const ms = Date.parse(fixed)
  if (!isNaN(ms)) return ms
  // fallback
  const d = new Date(fixed)
  return isNaN(d.getTime()) ? NaN : d.getTime()
}

export default function Game() {
  const {user}=useSelector((state)=>state.user);
  
  const dispatch = useDispatch()
  const curre = useSelector((state) => state.event.Event)
  console.log(curre,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaaaaa")
  // UI / game state
  const [selected, setSelected] = useState(null)
  const [betsLocked, setBetsLocked] = useState(true)
  const [result, setResult] = useState(null)
  const [betAmount, setBetAmount] = useState(100)
  const [pendingBet, setPendingBet] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [lastWin, setLastWin] = useState(null)
  const [shake, setShake] = useState(false)

  const [startTimer, setStartTimer] = useState(0);


  // server event & timers
  const [currentEvent, setCurrentEvent] = useState()
  const [remainingTime, setRemainingTime] = useState(0)
  const [progressPercent, setProgressPercent] = useState(0)

  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      if (raw) return JSON.parse(raw)
    } catch {
      // ignore
      }
    return []
  })

  const stompRef = useRef(null)
  const lastResolvedRoundRef = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (curre) {
      setCurrentEvent(curre)
    }
  }, [curre])

  // --- WebSocket subscription / incoming events ---
  useEffect(() => {
    const socket = new SockJS(`http://localhost:8080/ws`)
    const client = Stomp.over(socket)
    stompRef.current = client

    client.connect({}, () => {
      client.subscribe(`/topic/events`, (message) => {
        try {
          const event = JSON.parse(message.body)
          console.log("📩 Event received:", event)
          dispatch(eventAction.clearEvent());
          dispatch(eventAction.StorageEvent(event))
          // set latest event (UI/timer will follow this)
          setCurrentEvent(event)
          
          setStartTimer(event.startAt);
          // lock/unlock bets based on backend status
          setBetsLocked(event.status !== "BETTING")

          // if backend already provided the result, resolve here
          if (event.status === "RESULT" && event.result) {
            if (lastResolvedRoundRef.current !== event.id) {
              resolveRound(event.id, event.result)
              // resolveRound will set lastResolvedRoundRef after success
            }
          } else {
            // clear result until backend pushes one
            setResult(null)
            setShowConfetti(false)
          }
        } catch (err) {
          console.error("Failed parse event:", err)
        }
      })
      client.subscribe(`/topic/status`, (message) => {
        try {
          const status = JSON.parse(message.body)
          const result = "RED"
          console.log("📩 Status received:", status)
          
            
        
          dispatch(eventAction.setStatus(status.status));
          // lock/unlock bets based on backend status
          
          setBetsLocked(status.status !== "BETTING")

          // if backend already provided the result, resolve here
          if (status.status === "RESULT_WAIT" && result) {
            if (lastResolvedRoundRef.current !== status.eventId) {
              resolveRound(status.eventId, result)
              // resolveRound will set lastResolvedRoundRef after success
            }
          } else {
            // clear result until backend pushes one
            setResult(null)
            setShowConfetti(false)
          }
        } catch (err) {
          console.error("Failed parse event:", err)
        }
      })
      
    
    if(!currentEvent)
    {
      console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaaaaa");
      client.send("/app/join", {});
      client.subscribe(`/topic/players`, (message) => {
        try {
          console.log("BBBBBBBBBBBBBBBBBBBBBBBB")
          const event = JSON.parse(message.body)
          console.log("📩 Event received:", event)

          // set latest event (UI/timer will follow this)
          dispatch(eventAction.StorageEvent(event))
          setCurrentEvent(event)
          setStartTimer(event.startAt);
          // lock/unlock bets based on backend status
          setBetsLocked(event.status !== "BETTING")

          // if backend already provided the result, resolve here
          if (event.status === "RESULT" && event.result) {
            if (lastResolvedRoundRef.current !== event.id) {
              resolveRound(event.id, event.result)
              // resolveRound will set lastResolvedRoundRef after success
            }
          } else {
            // clear result until backend pushes one
            setResult(null)
            setShowConfetti(false)
          }
        } catch (err) {
          console.error("Failed parse event:", err)
        }
      })
    
    }
    
  })


    return () => {
      try {
        if (client && client.connected) client.disconnect()
      } catch (e) {
        console.warn("Error during WebSocket disconnect:", e)
    }
    }
    // only run once
  }, [])


  // Persist history
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 60)))
  }, [history])

  // --- countdown & progress tick (immediate + interval) ---
  useEffect(() => {
    if (!currentEvent) {
      setRemainingTime(0)
      setProgressPercent(0)
      return
    }

    const tick = () => {
      const now = Date.now()
      const startMs = parseServerTimeToMs(currentEvent.startAt)
      const endMs = parseServerTimeToMs(currentEvent.endAt)

      if (isNaN(startMs) || isNaN(endMs)) {
        console.warn("Invalid event time:", currentEvent.startAt, currentEvent.endAt)
        setRemainingTime(0)
        setProgressPercent(0)
        return
      }

      // if we're before start, show time to start; otherwise show time to end
      const isBeforeStart = now < startMs
      // const remaining = Math.max(0, Math.ceil((isBeforeStart ? startMs : endMs) - now) / 1000)
      // We want integer seconds
      const remainingSeconds = Math.max(0, Math.ceil((isBeforeStart ? (startMs - now) : (endMs - now)) / 1000))
      setRemainingTime(remainingSeconds)

      // progress: 0 until start, then elapsed/total
      let percent = 0
      if (now >= startMs) {
        const total = endMs - startMs
        const elapsed = Math.min(Math.max(0, now - startMs), total)
        percent = total > 0 ? Math.min(100, (elapsed / total) * 100) : 100
      } else {
        percent = 0
      }
      setProgressPercent(percent)

      // keep bets locked unless backend told us BETTING
      setBetsLocked(currentEvent.status !== "BETTING")
    }

    // run immediately so UI updates without waiting 1s
    tick()
    // clear any existing interval
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(tick, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [currentEvent])

  // --- place / confirm bets ---
  // function placeBet(colorKey) {
  //   if (betsLocked) return
  //   setSelected(colorKey)
  //   if (navigator.vibrate) navigator.vibrate(10)
  // }

  // function confirmBet() {
  //   if (betsLocked || !selected || !currentEvent) return
  //   if (pendingBet && pendingBet.roundId === currentEvent.id) return
  //   if (betAmount <= 0 || betAmount > balance) return

  //   // local optimistic balance update
  //   const nextBalance = balance - betAmount
  //   setBalance(nextBalance)
  //   updateProfile({ balance: nextBalance })

  //   const pb = { roundId: currentEvent.id, color: selected, amount: betAmount }
  //   setPendingBet(pb)
  //   if (navigator.vibrate) navigator.vibrate([20, 10, 20])

  //   // send to backend (safe: supports either client.publish or client.send)
  //   try {
  //     const client = stompRef.current
  //     const payload = {
  //       eventId: currentEvent.id,
  //       color: selected,
  //       amount: betAmount,
  //       userId: user?.id || "guest",
  //     }

  //     if (client) {
  //       // new Client style uses publish; old "Stomp.over" style uses send
  //       if (typeof client.publish === "function") {
  //         client.publish({ destination: "/app/bet", body: JSON.stringify(payload) })
  //       } else if (typeof client.send === "function") {
  //         client.send("/app/bet", {}, JSON.stringify(payload))
  //       } else {
  //         console.warn("STOMP client has no send/publish method")
  //       }
  //     }
  //   } catch (e) {
  //     console.warn("Failed to send bet to backend:", e)
  //   }
  // }

  // --- resolve round when backend provides result ---
  function resolveRound(roundId, winningColor) {
    if (!winningColor) return
    // avoid double-resolve
    if (lastResolvedRoundRef.current === roundId) return

    setResult(winningColor)
    setHistory((h) => [winningColor, ...h].slice(0, 50))

    if (pendingBet && pendingBet.roundId === roundId) {
      const won = pendingBet.color === winningColor
      // const payout = won ? pendingBet.amount * 2 : 0

     

      if (won) {
        
       
        setShowConfetti(true)
        setLastWin(winningColor)
        if (navigator.vibrate) navigator.vibrate([50, 30, 50, 30, 50])
      } else {
        setShake(true)
        setTimeout(() => setShake(false), 500)
        if (navigator.vibrate) navigator.vibrate(100)
      }

      setPendingBet(null)
      setSelected(null)
    }

    // finally mark this round resolved so we don't handle it twice
    lastResolvedRoundRef.current = roundId
  }

  // progress bar computed already in state, but keep a derived phase string
  const phase = currentEvent?.status === "BETTING" ? "bet" : "result"
  const statusText = currentEvent
    ? currentEvent.status === "BETTING"
      ? "🎯 Betting"
      : currentEvent.status === "RESULT"
      ? currentEvent.result
        ? `🎉 Result: ${String(currentEvent.result).toUpperCase()}`
        : "🎲 Result (waiting...)"
      : currentEvent.status
    : "Waiting for event"

// added later by ankur
  const placeBet = (color) => setSelected(color)
  const confirmBet = () => {
    console.log("Confirm bet clicked, hahahahhahahahahahhahah");
    const client = stompRef.current
    if (!selected || !currentEvent) return
    client.send(
      "/app/bet",
      {},
      JSON.stringify({ userId: 1, eventId: currentEvent.id, color: selected, amount: betAmount })
    )
    setSelected(null)
  }

  return (
    <div className={`game-wrap ${shake ? "shake" : ""}`}>
      {showConfetti && lastWin && <Confetti color={lastWin} />}

      <div className="card col" style={{ gap: 16 }}>
        <div className="row" style={{ justifyContent: "space-between", width: "100%" }}>
          <div className="row" style={{ gap: 10 }}>
            <span className={`pill phase-pill ${phase}`}>{statusText}</span>
            <span className={`pill timer-pill ${remainingTime <= 10 ? "urgent" : ""}`}>
              ⏱️ {String(remainingTime).padStart(2, "0")}s
            </span>
          </div>
          <div className={`pill ${pendingBet ? "locked-pill" : ""}`}>
            {pendingBet ? `🔒 Locked: $${pendingBet.amount}` : `✅ Ready`}
          </div>
        </div>

        <div className="progress">
          <div className={`bar ${phase}`} style={{ width: `${progressPercent}%` }} />
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
            disabled={betsLocked || !selected || betAmount > user.balance}
            onClick={confirmBet}
            style={{ width: "100%" }}
          >
            {pendingBet ? "✓ Bet Placed" : selected ? `🎲 Place $${betAmount} on ${selected.toUpperCase()}` : "👆 Select a color"}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
          <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>📊 Result History</h3>
          <button className="btn clear-btn" onClick={() => setHistory([])} style={{ padding: "8px 16px", fontSize: "14px" }}>
            Clear
          </button>
        </div>
        <div className="history">
          {history.map((h, idx) => (
            <div key={idx} className={`dot ${h} ${idx === 0 ? "latest" : ""}`} title={h}></div>
          ))}
          {history.length === 0 && <div style={{ color: "var(--muted)", padding: "20px 0", textAlign: "center" }}>No history yet.</div>}
        </div>
      </div>

      {user && (
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
            <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>📜 Your Bet History</h3>
         
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
                
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
