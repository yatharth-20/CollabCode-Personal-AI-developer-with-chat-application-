import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserContext } from '../context/user.context'
import axios from '../config/axios'

const Register = () => {

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const { setUser } = useContext(UserContext)
  const navigate    = useNavigate()

  function submitHandler(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    axios.post('/users/register', { email, password })
      .then((res) => {
        sessionStorage.setItem('token', res.data.token)
        setUser(res.data.user)
        navigate('/')
      })
      .catch((err) => {
        const errorMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed. Please try again.';
        setError(errorMsg);
        setLoading(false);
      })
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>

      {}
      <div className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
        style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', top: '-5rem', right: '-5rem' }} />
      <div className="absolute w-80 h-80 rounded-full opacity-15 blur-3xl animate-pulse"
        style={{ background: 'radial-gradient(circle, #6366f1, transparent)', bottom: '-3rem', left: '-3rem', animationDelay: '1s' }} />

      {}
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl p-8"
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
        }}>

        {}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
            <i className="ri-user-add-line text-white text-2xl"></i>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white text-center mb-1">Create account</h1>
        <p className="text-center text-sm mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Join the collaborative coding platform
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
            <i className="ri-error-warning-line"></i> {error}
          </div>
        )}

        <form onSubmit={submitHandler} className="space-y-5">
          {}
          <div>
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider"
              style={{ color: 'rgba(255,255,255,0.5)' }}>Email</label>
            <div className="relative">
              <i className="ri-mail-line absolute left-3 top-1/2 -translate-y-1/2 text-purple-400"></i>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  caretColor: '#8b5cf6',
                }}
                onFocus={e => e.target.style.border = '1px solid rgba(139,92,246,0.6)'}
                onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
              />
            </div>
          </div>

          {}
          <div>
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider"
              style={{ color: 'rgba(255,255,255,0.5)' }}>Password</label>
            <div className="relative">
              <i className="ri-lock-line absolute left-3 top-1/2 -translate-y-1/2 text-purple-400"></i>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  caretColor: '#8b5cf6',
                }}
                onFocus={e => e.target.style.border = '1px solid rgba(139,92,246,0.6)'}
                onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              background: loading ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(139,92,246,0.35)',
            }}
          >
            {loading ? (
              <><i className="ri-loader-4-line animate-spin"></i> Creating account...</>
            ) : (
              <><i className="ri-user-add-line"></i> Create Account</>
            )}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Already have an account?{' '}
          <Link to="/login"
            className="font-semibold transition-colors"
            style={{ color: '#a78bfa' }}
            onMouseEnter={e => e.target.style.color = '#c4b5fd'}
            onMouseLeave={e => e.target.style.color = '#a78bfa'}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
