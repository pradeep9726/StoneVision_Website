import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../api/axios'
import toast, { Toaster } from 'react-hot-toast'
import { ChevronLeft, Lock } from 'lucide-react'

export default function ChangePasswordPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const mobile = state?.mobile || ''
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const [errors, setErrors] = useState({ password: '', confirm: '' })
  const [isFormValid, setIsFormValid] = useState(false)

  const isValidPassword = (password) => {
    if (password.length < 8) return false
    if (/\s/.test(password)) return false
    const pattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,}$/
    return pattern.test(password)
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (!isValidPassword(newPassword)) return toast.error('Check password strength')
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match')

    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('mobile', mobile)
      params.append('new_password', newPassword)

      const res = await api.post('resetpassword.php', params)
      const data = res.data

      if (data.status === 'success' || data.status === '1' || data.success === true) {
        toast.success('Your security credentials have been updated. Access reset.')
        setTimeout(() => navigate('/login'), 2000)
      } else {
        toast.error(data.message || 'Verification could not update credentials')
      }
    } catch (err) {
      toast.error('Network failure connecting to VisionStone infrastructure')
    } finally {
      setLoading(false)
    }
  }

  const validate = (pass, conf) => {
    const errs = { password: '', confirm: '' }
    if (pass && !isValidPassword(pass)) {
      errs.password = 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
    }
    if (conf && pass !== conf) {
      errs.confirm = 'Passwords do not match'
    }
    setErrors(errs)
    setIsFormValid(isValidPassword(pass) && pass === conf && conf !== '')
  }

  const onPassChange = (val) => {
    setNewPassword(val)
    validate(val, confirmPassword)
  }

  const onConfirmChange = (val) => {
    setConfirmPassword(val)
    validate(newPassword, val)
  }

  return (
    <div className="auth-page" style={{ background: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Toaster position="top-right" />
      
      <div style={{ width: '100%', maxWidth: '400px', padding: '24px' }}>
         <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
            <button className="btn btn-outline" style={{ padding: '0.8rem', borderRadius: '14px', border: 'none' }} onClick={() => navigate('/login')}>
               <ChevronLeft size={24} />
            </button>
            <h1 style={{ fontSize: '22px', fontWeight: 'bold', marginLeft: '12px' }}>Reset Security Key</h1>
         </div>

         <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div className="stat-icon" style={{ background: '#f1f5f9', color: '#1e293b', width: '80px', height: '80px', borderRadius: '24px', margin: '0 auto' }}>
               <Lock size={32} />
            </div>
            <p className="page-description" style={{ marginTop: '16px', fontSize: '14px' }}>
               Mobile Identity: <strong style={{ color: '#000' }}>{mobile}</strong> verified. Please establish a new secure entry key.
            </p>
         </div>

         <div className="android-card" style={{ marginTop: '0' }}>
            <form onSubmit={handleReset}>
                <div className="series-item">
                   <label className="series-label">New Password</label>
                   <input
                     className="android-input"
                     type="password"
                     placeholder="New Password"
                     value={newPassword}
                     onChange={(e) => onPassChange(e.target.value)}
                   />
                   {errors.password && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.password}</div>}
                </div>

                <div className="series-item">
                   <label className="series-label">Confirm New Password</label>
                   <input
                     className="android-input"
                     type="password"
                     placeholder="Confirm New Password"
                     value={confirmPassword}
                     onChange={(e) => onConfirmChange(e.target.value)}
                   />
                   {errors.confirm && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.confirm}</div>}
                </div>

                <button
                   type="submit"
                   className="android-btn-primary"
                   disabled={loading || !isFormValid}
                   style={{ marginTop: '20px', background: '#334155', color: '#FFCC00', opacity: isFormValid ? 1 : 0.5 }}
                >
                   {loading ? <div className="spinner" style={{ margin: '0 auto', width: '24px', height: '24px' }}></div> : 'Establish New Key'}
                </button>

               <button
                  type="button"
                  className="android-btn-primary"
                  onClick={() => navigate('/login')}
                  style={{ marginTop: '12px', background: 'transparent', color: '#000000', border: '1px solid #EEEEEE' }}
               >
                  Cancel
               </button>
            </form>
         </div>
      </div>
    </div>
  )
}
