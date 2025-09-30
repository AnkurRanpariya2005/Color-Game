import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const { register } = useAuth()
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
      await register(email.trim(), password)
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
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
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


