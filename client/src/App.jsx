import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ThemeProvider } from './context/ThemeContext'

import Layout from './components/Layout/Layout'
import Home from './pages/Home/Home'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import SetupProfile from './pages/SetupProfile/SetupProfile'
import ForgotPassword from './pages/ForgotPassword/ForgotPassword'
import Landing from './pages/Landing/Landing'
import NotFound from './pages/NotFound/NotFound'
import AccountSettings from './pages/AccountSettings/AccountSettings'
import TeamManagement from './pages/TeamManagement/TeamManagement'
import TeamCreation from './pages/TeamCreation/TeamCreation'
import Tasks from './pages/Tasks/Tasks'
import FAQ from './pages/FAQ/FAQ'
import About from './pages/About/About'
import Contact from './pages/Contact/Contact'
import Privacy from './pages/Privacy/Privacy'
import Terms from './pages/Terms/Terms'

function PublicRoute({ isAuthenticated, needsProfileSetup, children }) {
  if (isAuthenticated) {
    return <Navigate to={needsProfileSetup ? '/setup-profile' : '/app'} replace />
  }
  return children
}

function ProtectedRoute({ isAuthenticated, needsProfileSetup, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }
  if (needsProfileSetup) {
    return <Navigate to="/setup-profile" replace />
  }
  return children
}

function SetupProfileRoute({ isAuthenticated, needsProfileSetup, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  if (!needsProfileSetup) {
    return <Navigate to="/app" replace />
  }
  return children
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'))
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false)
  const [registeredUser, setRegisteredUser] = useState(() => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
  }, [])

  function handleLoginSuccess(token, user) {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setIsAuthenticated(true)
    setNeedsProfileSetup(false)
  }

  function handleRegisterSuccess(token, user) {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setRegisteredUser(user)
    setIsAuthenticated(true)
    setNeedsProfileSetup(true)
  }

  function handleCompleteProfile(profileData) {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const updatedUser = { ...user, ...profileData }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    setNeedsProfileSetup(false)
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setNeedsProfileSetup(false)
  }

  return (
    <ThemeProvider>
      <BrowserRouter basename="/kandew">
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route
            path="/login"
            element={
              <PublicRoute isAuthenticated={isAuthenticated} needsProfileSetup={needsProfileSetup}>
                <Login onLoginSuccess={handleLoginSuccess} />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute isAuthenticated={isAuthenticated} needsProfileSetup={needsProfileSetup}>
                <Register onRegisterSuccess={handleRegisterSuccess} />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute isAuthenticated={isAuthenticated} needsProfileSetup={needsProfileSetup}>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/setup-profile"
            element={
              <SetupProfileRoute isAuthenticated={isAuthenticated} needsProfileSetup={needsProfileSetup}>
                <SetupProfile registeredUser={registeredUser} onCompleteProfile={handleCompleteProfile} />
              </SetupProfileRoute>
            }
          />

          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          <Route
            path="/app"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} needsProfileSetup={needsProfileSetup}>
                <Layout onLogout={handleLogout} />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="account" element={<AccountSettings />} />
            <Route path="team/new" element={<TeamCreation />} />
            <Route path="team/:teamId/manage" element={<TeamManagement />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
