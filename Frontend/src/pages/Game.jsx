import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";


const HISTORY_KEY = 'cg_history_v1'

const COLORS = [
  { key: 'red', label: 'Red', className: 'red', multiplier: 2 },
  { key: 'green', label: 'Green', className: 'green', multiplier: 2 },
  { key: 'blue', label: 'Blue', className: 'blue', multiplier: 2 },
]

function getRoundPhase(nowMs) {
  const seconds = Math.floor(nowMs / 1000)
  const mod = seconds % 70
  if (mod < 60) {
    return { phase: 'bet', remaining: 60 - mod }
  }
  return { phase: 'result', remaining: 70 - mod }
}

export default function Game() {
  const { balance, setBalance, updateProfile } = useAuth()
  const [selected, setSelected] = useState(null)
  const [betsLocked, setBetsLocked] = useState(false)
  const [result, setResult] = useState(null)
  const [betAmount, setBetAmount] = useState(100)
  const [pendingBet, setPendingBet] = useState(null) // { roundId, color, amount }
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

  const socket = new SockJS(`http://localhost:8080/ws`);
 const stompClient = Stomp.over(socket);


  useEffect(() => {
    stompClient.connect({}, () => {
      
      stompClient.subscribe(`/topic/events`, (message) => {
        const slotUpdate = JSON.parse(message.body);
        console.log("Slot update received:", slotUpdate);
  
        // // Update the slot status in the state
     });
    });
  
    return () => {
      if (stompClient.connected) {
        stompClient.disconnect();
      }
    };
  },[])
  

  useEffect(() => {
    const id = setInterval(() => {
      const { phase, remaining } = getRoundPhase(Date.now())
      setBetsLocked(phase === 'result')
      if (phase === 'result') {
        const currentRoundId = Math.floor(Date.now() / 1000 / 70)
        if (lastResolvedRoundRef.current !== currentRoundId) {
          resolveRound(currentRoundId)
          lastResolvedRoundRef.current = currentRoundId
        }
      } else {
        setResult(null)
      }
    }, 200)
    return () => clearInterval(id)
  }, [])

  const timers = useMemo(() => {
    const { phase, remaining } = getRoundPhase(Date.now())
    return { phase, remaining }
  }, [betsLocked, result])

  function placeBet(colorKey) {
    if (betsLocked) return
    setSelected(colorKey)
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
  }

  function resolveRound(currentRoundId) {
    const winning = COLORS[Math.floor(Math.random() * COLORS.length)].key
    setResult(winning)
    setHistory((h) => [winning, ...h].slice(0, 50))
    if (pendingBet && pendingBet.roundId === currentRoundId) {
      if (pendingBet.color === winning) {
        const payout = pendingBet.amount * 2
        const next = balance + payout
        setBalance(next)
        updateProfile({ balance: next })
      }
      setPendingBet(null)
      setSelected(null)
    }
  }

  return (
    <div className="game-wrap">
      <div className="card col" style={{ gap: 12 }}>
        <div className="row" style={{ justifyContent: 'space-between', width: '100%' }}>
          <div className="row" style={{ gap: 10 }}>
            <span className="pill">Phase: {timers.phase === 'bet' ? 'Betting' : 'Result'}</span>
            <span className="pill">Time: {String(timers.remaining).padStart(2,'0')}s</span>
          </div>
          <div className="pill">{pendingBet ? `Locked: ${pendingBet.amount}` : `Ready`}</div>
        </div>
        <div className="progress">
          <div className={`bar ${timers.phase}`} style={{
            width: `${timers.phase === 'bet' ? ((60 - timers.remaining) / 60) * 100 : ((10 - timers.remaining) / 10) * 100}%`
          }} />
        </div>
      </div>

      <div className="result-overlay">
        {result && (
          <div className="badge">Result: {result.toUpperCase()}</div>
        )}
        <div className="color-grid">
          {COLORS.map((c) => (
            <button
              key={c.key}
              disabled={betsLocked}
              onClick={() => placeBet(c.key)}
              className={`btn color-btn ${c.className} ${selected === c.key ? 'selected' : ''}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card col" style={{ gap: 12 }}>
        <h3 style={{ margin: 0 }}>Bet Controls</h3>
        <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
          <input
            type="number"
            min="1"
            value={betAmount}
            onChange={(e) => setBetAmount(Math.max(1, Math.floor(Number(e.target.value) || 0)))}
            style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.16)', background: '#0d1020', color: 'var(--text)' }}
          />
          <div className="chips">
            {[50,100,200,500,1000].map((v) => (
              <button key={v} className="btn" onClick={() => setBetAmount(v)}>{v}</button>
            ))}
          </div>
          <div className="row" style={{ marginLeft: 'auto', gap: 8 }}>
            <button className="btn" disabled={betsLocked || !selected || betAmount > balance} onClick={confirmBet}>
              {pendingBet ? 'Bet Placed' : selected ? `Place ${betAmount} on ${selected.toUpperCase()}` : 'Select a color'}
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>History</h3>
          <button className="btn" onClick={() => setHistory([])}>Clear</button>
        </div>
        <div className="history" style={{ marginTop: 12 }}>
          {history.map((h, idx) => (
            <div key={idx} className={`dot ${h}`}></div>
          ))}
          {history.length === 0 && <div className="muted">No history yet.</div>}
        </div>
      </div>
    </div>
  )
}


