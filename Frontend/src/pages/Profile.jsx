import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Profile() {
  const { user, balance, updateProfile, setBalance } = useAuth()
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '')
  const [email] = useState(user?.email || '')

  const save = () => {
    updateProfile({ avatarUrl })
  }

  const addFunds = (amount) => {
    const next = Math.max(0, balance + amount)
    setBalance(next)
    updateProfile({ balance: next })
  }

  return (
    <div className="profile">
      <div className="avatar">
        <img src={avatarUrl || user.avatarUrl} alt="avatar" />
      </div>
      <div className="col">
        <div className="card col">
          <h2>Profile</h2>
          <div>Email: {email}</div>
          <label>Avatar URL</label>
          <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
          <button className="btn" onClick={save}>Save</button>
        </div>
        <div className="card row" style={{ justifyContent: 'space-between' }}>
          <div>Balance: {balance.toFixed(2)}</div>
          <div className="row">
            <button className="btn" onClick={() => addFunds(100)}>+100</button>
            <button className="btn" onClick={() => addFunds(500)}>+500</button>
            <button className="btn" onClick={() => addFunds(-100)}>-100</button>
          </div>
        </div>
      </div>
    </div>
  )
}


