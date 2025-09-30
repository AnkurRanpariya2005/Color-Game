import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email.trim(), password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-form">
      <div className="card col">
        <h1>Login</h1>
        {error && <div className="pill" style={{ color: 'var(--danger)' }}>{error}</div>}
        <form className="col" onSubmit={onSubmit}>
          <div className="col">
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>
          <div className="col">
            <label>Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </div>
          <div className="auth-actions">
            <button className="btn" type="submit" disabled={loading}>{loading ? 'Loading...' : 'Login'}</button>
            <Link to="/register" className="link">Create account</Link>
          </div>
        </form>
      </div>
    </div>
  )
}


