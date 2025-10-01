"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

const STORAGE_KEY = "cg_user_v1"

const defaultUser = null

const AuthContext = createContext({
  user: defaultUser,
  balance: 0,
  betHistory: [],
  login: async (_email, _password) => {},
  register: async (_email, _password) => {},
  logout: () => {},
  updateProfile: (_updates) => {},
  setBalance: (_next) => {},
  addBetToHistory: (_bet) => {},
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(defaultUser)
  const [balance, setBalance] = useState(1000)
  const [betHistory, setBetHistory] = useState([])

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        setUser(parsed.user ?? defaultUser)
        setBalance(parsed.balance ?? 1000)
        setBetHistory(parsed.betHistory ?? [])
      } catch {}
    }
  }, [])

  useEffect(() => {
    const payload = JSON.stringify({ user, balance, betHistory })
    localStorage.setItem(STORAGE_KEY, payload)
  }, [user, balance, betHistory])

  const login = async (email, password) => {
    const raw = localStorage.getItem(`user_${email}`)
    if (!raw) throw new Error("Account not found")
    const acc = JSON.parse(raw)
    if (acc.password !== password) throw new Error("Invalid credentials")
    setUser({
      email,
      avatarUrl: acc.avatarUrl || `https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(email)}`,
    })
    setBalance(acc.balance ?? 1000)
    setBetHistory(acc.betHistory ?? [])
  }

  const register = async (email, password) => {
    if (localStorage.getItem(`user_${email}`)) {
      throw new Error("Email already registered")
    }
    const avatarUrl = `https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(email)}`
    const initial = { email, password, balance: 1000, avatarUrl, betHistory: [] }
    localStorage.setItem(`user_${email}`, JSON.stringify(initial))
    setUser({ email, avatarUrl })
    setBalance(1000)
    setBetHistory([])
  }

  const logout = () => {
    setUser(null)
  }

  const updateProfile = (updates) => {
    if (!user) return
    const raw = localStorage.getItem(`user_${user.email}`)
    if (!raw) return
    const acc = JSON.parse(raw)
    const next = { ...acc, ...updates }
    localStorage.setItem(`user_${user.email}`, JSON.stringify(next))
    setUser((u) => (u ? { ...u, ...updates } : u))
    if (typeof updates.balance === "number") setBalance(updates.balance)
    if (updates.betHistory) setBetHistory(updates.betHistory)
  }

  const addBetToHistory = (bet) => {
    const newHistory = [bet, ...betHistory]
    setBetHistory(newHistory)
    updateProfile({ betHistory: newHistory })
  }

  const value = useMemo(
    () => ({ user, balance, betHistory, login, register, logout, updateProfile, setBalance, addBetToHistory }),
    [user, balance, betHistory],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
