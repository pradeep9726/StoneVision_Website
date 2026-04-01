import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast, { Toaster } from 'react-hot-toast'
import { ChevronLeft, Lock } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!identifier) return toast.error('Please enter your email or mobile')

    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('mobile', identifier) // Using 'mobile' as the key to match checkmobile.php

      const res = await api.post('checkmobile.php', params)
      const data = res.data

      const status = String(data?.status || '').toLowerCase()
      const message = String(data?.message || '').toLowerCase()

      // Exact conditions from ForgotPasswordActivity.kt
      if (status === 'success' || status === 'true' || status === '1' || message.includes('verified') || message.includes('exists')) {
        toast.success('Mobile verified. You may now reset your password.')
        setTimeout(() => navigate('/change-password', { state: { mobile: identifier } }), 1000)
      } else {
        toast.error(data.message || 'User does not exist')
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
      
      <div style={{ width: '100%', maxWidth: '400px', padding: '24px' }}>
         <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
            <button className="btn btn-outline" style={{ padding: '0.8rem', borderRadius: '14px', border: 'none' }} onClick={() => navigate('/login')}>
               <ChevronLeft size={24} />
            </button>
            <h1 style={{ fontSize: '22px', fontWeight: 'bold', marginLeft: '12px' }}>Forgot Password?</h1>
         </div>

         <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div className="stat-icon" style={{ background: '#f1f5f9', color: '#1e293b', width: '80px', height: '80px', borderRadius: '24px', margin: '0 auto' }}>
               <Lock size={32} />
            </div>
            <p className="page-description" style={{ marginTop: '16px', fontSize: '14px' }}>
               Enter your registered mobile number to verify your identity and unlock your account access.
            </p>
         </div>

         <div className="android-card" style={{ marginTop: '0' }}>
            <form onSubmit={handleVerify}>
                <div className="series-item">
                   <label className="series-label">Specify 10-Digit Mobile</label>
                   <input
                     className="android-input"
                     type="tel"
                     maxLength={10}
                     placeholder="Enter your 10-digit mobile"
                     value={identifier}
                     onChange={(e) => setIdentifier(e.target.value.replace(/\D/g, ''))}
                   />
                </div>

               <button
                  type="submit"
                  className="android-btn-primary"
                  disabled={loading}
                  style={{ marginTop: '20px', background: '#334155', color: '#FFCC00' }}
               >
                  {loading ? <div className="spinner" style={{ margin: '0 auto', width: '24px', height: '24px' }}></div> : 'Verify Mobile'}
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
