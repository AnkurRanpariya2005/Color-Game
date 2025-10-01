import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const saved = localStorage.getItem('cg_last_email')
    if (saved) setEmail(saved)
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const emailTrimmed = email.trim().toLowerCase()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
        throw new Error('Please enter a valid email address')
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }
      if (password !== confirm) {
        throw new Error('Passwords do not match')
      }
      await register(emailTrimmed, password)
      localStorage.setItem('cg_last_email', emailTrimmed)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Register failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-form">
      <div className="card col">
        <h1>Create account</h1>
        {error && <div className="pill" style={{ color: 'var(--danger)' }}>{error}</div>}
        <form className="col" onSubmit={onSubmit}>
          <div className="col">
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>
          <div className="col">
            <label>Password</label>
            <div className="row" style={{ gap: 8 }}>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                required
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowPassword((s) => !s)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <div style={{ color: 'var(--muted)', fontSize: 12 }}>Min 6 characters</div>
          </div>
          <div className="col">
            <label>Confirm Password</label>
            <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type={showPassword ? 'text' : 'password'} required />
          </div>
          <div className="auth-actions">
            <button className="btn" type="submit" disabled={loading}>{loading ? 'Loading...' : 'Register'}</button>
            <Link to="/login" className="link">I have an account</Link>
          </div>
        </form>
      </div>
    </div>
  )
}


