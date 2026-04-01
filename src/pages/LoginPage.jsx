import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast, { Toaster } from 'react-hot-toast'

export default function LoginPage() {
  const [role, setRole] = useState('WORKER')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isFormValid, setIsFormValid] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const isValidMobile = (m) => /^\d{10}$/.test(m)

  useEffect(() => {
    if (identifier && !isValidMobile(identifier)) {
      setError('Enter a valid 10-digit mobile number')
    } else {
      setError('')
    }
    setIsFormValid(isValidMobile(identifier) && password.length > 0)
  }, [identifier, password])

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!isFormValid) return toast.error('Check your mobile and password')
    
    setLoading(true)
    try {
      const formData = new URLSearchParams()
      formData.append('identifier', identifier)
      formData.append('password', password)
      formData.append('role', role)

      const res = await api.post('login.php', formData)
      const data = res.data

      if (data.status === true || data.status === 'success' || data.status === '1' || data.message?.toLowerCase().includes('successful')) {
        const userData = {
          id: data.data?.id || data.userId || '1',
          name: data.data?.full_name || data.data?.fullName || data.fullName || 'User',
          email: data.data?.email || identifier,
          mobile: data.data?.mobile || '',
          role,
        }
        login(userData)
        toast.success(`Welcome back, ${userData.name}!`)
        navigate('/dashboard')
      } else {
        toast.error(data.message || 'Login failed. Check your credentials.')
      }
    } catch (err) {
      toast.error('Network error. Is your server running?')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page" style={{ background: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Toaster position="top-right" />
      
      <div className="android-login-title" style={{ marginTop: '100px' }}>Login</div>
      <div style={{ textAlign: 'center' }}>
         <div className="android-welcome-msg">Welcome back! Please enter your details.</div>
      </div>

      <div style={{ width: '100%', maxWidth: '400px', padding: '0 20px' }}>
        <div className="android-card">
          <form onSubmit={handleLogin}>
            <div className="series-item" style={{ marginBottom: '16px' }}>
              <input
                className="android-input"
                type="tel"
                maxLength={10}
                placeholder="Enter your 10-digit mobile"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value.replace(/\D/g, ''))}
              />
              {error && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{error}</div>}
            </div>
            
            <div className="series-item" style={{ marginBottom: '16px' }}>
              <input
                className="android-input"
                type={showPw ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div style={{ textAlign: 'right', marginTop: '-12px' }}>
               <span 
                 className="android-link" 
                 style={{ fontSize: '12px', color: '#64748b' }} 
                 onClick={() => setShowPw(!showPw)}
              >
                 {showPw ? 'Hide Password' : 'Show Password'}
               </span>
            </div>

            <div className="android-toggle" style={{ margin: '24px 0' }}>
              <button
                type="button"
                className={`android-toggle-btn ${role === 'WORKER' ? 'active' : ''}`}
                onClick={() => setRole('WORKER')}
              >
                Worker
              </button>
              <button
                type="button"
                className={`android-toggle-btn ${role === 'OWNER' ? 'active' : ''}`}
                onClick={() => setRole('OWNER')}
              >
                Owner
              </button>
            </div>

            <button
              type="submit"
              className="android-btn-primary"
              disabled={loading || !isFormValid}
              style={{ marginTop: '10px', opacity: isFormValid ? 1 : 0.5 }}
            >
              {loading ? <div className="spinner" style={{ margin: '0 auto', width: '24px', height: '24px' }}></div> : 'Login'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <span className="android-link" onClick={() => navigate('/forgot-password')} style={{ fontSize: '14px' }}>
                Forgot Password?
              </span>
            </div>

            <div style={{ height: '1.5px', background: '#EEEEEE', margin: '20px 0' }}></div>

            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '14px', color: '#64748b' }}>Don’t have an account? </span>
              <span className="android-link" onClick={() => navigate('/signup')}>
                Sign Up
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

