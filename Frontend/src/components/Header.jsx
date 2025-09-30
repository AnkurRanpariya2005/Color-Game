import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Header() {
  const { user, balance, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="app-header">
      <div className="inner">
        <div className="row" style={{ gap: 16 }}>
          <Link to="/" className="brand link" style={{ color: 'var(--text)', textDecoration: 'none' }}>Color Trading</Link>
          <span className="pill">1-min rounds · 10s results</span>
        </div>
        <div className="row">
          {user ? (
            <>
              <div className="balance">Balance: {balance.toFixed(2)}</div>
              <button
                className="avatar-btn"
                onClick={() => navigate('/profile')}
                title={user.email}
              >
                <img src={user.avatarUrl} alt="avatar" />
              </button>
              <button className="btn" onClick={logout}>Logout</button>
            </>
          ) : (
            <div className="row" style={{ gap: 8 }}>
              <Link to="/login" className="btn" style={{ textDecoration:'none' }}>Login</Link>
              <Link to="/register" className="btn" style={{ textDecoration:'none', background: 'transparent', color: 'var(--text)', border: '1px solid rgba(255,255,255,0.16)' }}>Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}


