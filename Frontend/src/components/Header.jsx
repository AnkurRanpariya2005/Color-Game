"use client"

import { useNavigate, Link } from "react-router-dom"

import { useTheme } from "../context/ThemeContext.jsx"
import { useSelector } from "react-redux"
import { userAction } from "../store/Event/user.js"
import { useDispatch } from "react-redux"
import { eventAction } from "../store/Event/event.js"
export default function Header() {
  const user=useSelector((state=>state.user));
  const dispatch=useDispatch();
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  console.log(user);

  return (
    <header className="app-header">
      <div className="inner">
        <div className="row" style={{ gap: 12, flex: 1 }}>
          <Link to="/" className="brand link" style={{ color: "var(--text)", textDecoration: "none" }}>
            🎨 Color Trading
          </Link>
          <span className="pill">1-min rounds · 10s results</span>
        </div>
        <div className="row" style={{ gap: 12 }}>
          <button
            className="icon-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {user.token ? (
            <>
              <button className="wallet-btn" onClick={() => navigate("/profile")} title="View wallet">
                <span className="wallet-icon">💰</span>
                <span className="wallet-amount">${user.balance.toFixed(2)}</span>
              </button>

              <Link to="/bet-history" className="icon-btn" title="Bet History">
                📜
              </Link>
              <Link to="/event-history" className="icon-btn" title="Event History">
                📊
              </Link>

              <button className="avatar-btn" onClick={() => navigate("/profile")} title={user.email}>
                <img src={user.avatarUrl || "/placeholder.svg"} alt="avatar" />
              </button>
              <button
                className="btn"
                onClick={() => {
                  // Clear Redux store
                  dispatch(userAction.clearUser())
                  dispatch(eventAction.clearEvent())
                  // Clear localStorage
                  
                  // Navigate to login
                  navigate("/login");
                }}
                style={{ padding: "10px 16px", fontSize: "14px", minHeight: "auto" }}
              >
                Logout
              </button>
            </>
          ) : (
            <div className="row" style={{ gap: 8 }}>
              <Link
                to="/login"
                className="btn"
                style={{
                  textDecoration: "none",
                  padding: "10px 16px",
                  fontSize: "14px",
                  minHeight: "auto",
                }}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn"
                style={{
                  textDecoration: "none",
                  background: "transparent",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                  padding: "10px 16px",
                  fontSize: "14px",
                  minHeight: "auto",
                }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
