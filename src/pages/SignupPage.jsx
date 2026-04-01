import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast, { Toaster } from 'react-hot-toast'

export default function SignupPage() {
  const [role, setRole] = useState('WORKER')
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isFormValid, setIsFormValid] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const isValidFullName = (name) => {
    return name.trim() !== '' && /^[a-zA-Z\s]+$/.test(name)
  }

  const isValidEmail = (email) => {
    return email.trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const isValidMobile = (mobile) => {
    return /^\d{10}$/.test(mobile)
  }

  const isValidPassword = (password) => {
    if (password.length < 8) return false
    if (/\s/.test(password)) return false
    const passwordPattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,}$/
    return passwordPattern.test(password)
  }

  useEffect(() => {
    const { fullName, mobile, email, password, confirmPassword } = formData
    const newErrors = { fullName: '', mobile: '', email: '', password: '', confirmPassword: '' }

    if (fullName && !isValidFullName(fullName)) {
      newErrors.fullName = 'Name should only contain alphabets'
    }

    if (mobile && !isValidMobile(mobile)) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number'
    }

    if (email && !isValidEmail(email)) {
      newErrors.email = 'Enter a valid email address'
    }

    if (password && !isValidPassword(password)) {
      newErrors.password = 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
    }

    if (confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)

    const valid = 
      isValidFullName(fullName) &&
      isValidMobile(mobile) &&
      isValidEmail(email) &&
      isValidPassword(password) &&
      password === confirmPassword

    setIsFormValid(valid)
  }, [formData])

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!isFormValid) {
      if (!isValidFullName(formData.fullName)) return toast.error('Check full name')
      if (!isValidMobile(formData.mobile)) return toast.error('Check mobile number')
      if (!isValidEmail(formData.email)) return toast.error('Check email address')
      if (!isValidPassword(formData.password)) return toast.error('Check password strength')
      if (formData.password !== formData.confirmPassword) return toast.error('Passwords match failure')
      return toast.error('Please fill all fields correctly')
    }

    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('full_name', formData.fullName)
      params.append('mobile', formData.mobile)
      params.append('email', formData.email)
      params.append('password', formData.password)
      params.append('role', role)

      const res = await api.post('signup.php', params)
      const data = res.data

      if (data.status === 'success' || data.status === '1' || data.message?.toLowerCase().includes('successful')) {
        toast.success('Identity verified and created. You may now enter.')
        setTimeout(() => navigate('/login'), 2000)
      } else {
        toast.error(data.message || 'Identity creation rejected')
      }
    } catch (err) {
      toast.error('Network error. Is your server running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page" style={{ background: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Toaster position="top-right" />
      
      <div className="android-login-title" style={{ marginTop: '40px' }}>Sign Up</div>
      <div style={{ textAlign: 'center' }}>
         <div className="android-welcome-msg">Create your VisionStone ID to begin.</div>
      </div>

      <div style={{ width: '100%', maxWidth: '400px', padding: '0 20px', marginBottom: '40px' }}>
        <div className="android-card">
          <form onSubmit={handleSignup}>
            <div className="series-item">
              <label className="series-label">{role === 'OWNER' ? "Owner's Full Name" : "Worker's Full Name"}</label>
              <input
                className="android-input"
                type="text"
                placeholder={role === 'OWNER' ? "Owner's Full Name" : "Worker's Full Name"}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
              {errors.fullName && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.fullName}</div>}
            </div>

            <div className="series-item">
              <label className="series-label">Mobile Number</label>
              <input
                className="android-input"
                type="tel"
                maxLength={10}
                placeholder="10-digit mobile number"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
              />
              {errors.mobile && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.mobile}</div>}
            </div>

            <div className="series-item">
              <label className="series-label">Email Address</label>
              <input
                className="android-input"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {errors.email && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.email}</div>}
            </div>

            <div className="series-item">
              <label className="series-label">Password</label>
              <input
                className="android-input"
                type={showPw ? 'text' : 'password'}
                placeholder="Min 8 chars, A-Z, a-z, 0-9, !@#"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              {errors.password && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.password}</div>}
            </div>

            <div className="series-item">
              <label className="series-label">Confirm Password</label>
              <input
                className="android-input"
                type={showPw ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
              {errors.confirmPassword && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.confirmPassword}</div>}
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

            <div className="android-toggle" style={{ margin: '20px 0' }}>
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
              {loading ? <div className="spinner" style={{ margin: '0 auto', width: '24px', height: '24px' }}></div> : 'Create Account'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <span style={{ fontSize: '14px', color: '#64748b' }}>Already have an account? </span>
              <span className="android-link" onClick={() => navigate('/login')}>
                Login
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

