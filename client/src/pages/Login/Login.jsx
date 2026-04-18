import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { fetchMe } from '../../lib/api'

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    if (!email.trim() || !password) {
      setFormError('Email and password are required.')
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email: email.trim(), password })
      const user = await fetchMe(data.token)
      onLoginSuccess(data.token, user)
      navigate('/app')
    } catch (err) {
      setFormError(err.response?.data?.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-surface">
      <div className="w-full max-w-md">
        <div className="bg-surface-container border border-outline rounded-3xl p-8 shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-on-surface">Login</h1>
            <p className="text-sm text-on-surface-variant">Sign in to continue to Kandew</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-on-surface">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-surface border border-outline rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-on-surface">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface border border-outline rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
            </div>

            {formError && (
              <div className="text-sm text-secondary bg-secondary/10 border border-secondary/20 rounded-xl px-4 py-3">
                {formError}
              </div>
            )}

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Log In'}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
