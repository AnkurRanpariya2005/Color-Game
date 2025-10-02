import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { userAction } from '../store/Event/user.js'
import axios from 'axios'
import { API_BASE_URL } from '../config/Api.js' 


export default function Register() {
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch();

  // useEffect(() => {
  //   const saved = localStorage.getItem('cg_last_email')
  //   if (saved) setEmail(saved)
  // }, [])

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
    
      const res=await axios.post(`${API_BASE_URL}/api/user/register`,{email:emailTrimmed,password:password});
      console.log(res.data);
      if(res.data.message=="Registration successful" && res.data.token!="User already exist")
      {
        dispatch(userAction.storeUser({useName:res.data.email,email:res.data.email,token:res.data.token,balance:res.data.balance }));
        navigate('/');
      }else{
        alert("User already exist");
        navigate("/register");
      }
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


