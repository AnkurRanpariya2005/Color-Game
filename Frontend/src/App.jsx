"use client"

import "./App.css"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import { ThemeProvider } from "./context/ThemeContext.jsx"
import Header from "./components/Header.jsx"
import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx"
import Game from "./pages/Game.jsx"
import Profile from "./pages/Profile.jsx"
import BetHistory from "./pages/BetHistory.jsx"
import EventHistory from "./pages/EventHistory.jsx"
import { useSelector } from "react-redux"

function ProtectedRoute({ children }) {
  const user=useSelector((state)=>state.user);
  console.log(user);
  if (!user.token) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  return (
    <ThemeProvider>
     
        <BrowserRouter>
        <div className="app-container">
          <Header />
          <main className="app-main">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/"
                  element={
                <ProtectedRoute>
                      <Game />
                      </ProtectedRoute>
                    
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bet-history"
                  element={
                    <ProtectedRoute>
                      <BetHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/event-history"
                  element={
                    <ProtectedRoute>
                      <EventHistory />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      
    </ThemeProvider>
  )
}

export default App
