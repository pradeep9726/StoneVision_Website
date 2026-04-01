import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast, { Toaster } from 'react-hot-toast'
import { ChevronLeft, Camera } from 'lucide-react'

export default function EditProfilePage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    mobile: user?.mobile || '',
    email: user?.email || '',
    userId: user?.id || ''
  })
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    mobile: ''
  })
  const [isFormValid, setIsFormValid] = useState(true)
  const [loading, setLoading] = useState(false)

  const isValidFullName = (name) => {
    return name.trim() !== '' && /^[a-zA-Z\s]+$/.test(name)
  }

  const isValidEmail = (email) => {
    return email.trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const isValidMobile = (mobile) => {
    return /^\d{10}$/.test(mobile)
  }

  useEffect(() => {
    const { fullName, email, mobile } = formData
    const newErrors = { fullName: '', email: '', mobile: '' }

    if (fullName && !isValidFullName(fullName)) {
      newErrors.fullName = 'Name should only contain alphabets'
    }

    if (email && !isValidEmail(email)) {
      newErrors.email = 'Enter a valid email address'
    }

    if (mobile && !isValidMobile(mobile)) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number'
    }

    setErrors(newErrors)

    const valid = 
      isValidFullName(fullName) &&
      isValidEmail(email) &&
      isValidMobile(mobile)

    setIsFormValid(valid)
  }, [formData])

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!isFormValid) {
       if (!isValidFullName(formData.fullName)) return toast.error('Check full name')
       if (!isValidMobile(formData.mobile)) return toast.error('Check phone number')
       if (!isValidEmail(formData.email)) return toast.error('Check email address')
       return toast.error('Check all fields')
    }

    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('mode', 'update')
      params.append('user_id', user.id)
      params.append('full_name', formData.fullName)
      params.append('mobile', formData.mobile)
      params.append('email', formData.email)

      const res = await api.post('profile.php', params)
      const data = res.data

      if (data.status === 'success' || data.status === true) {
        // Sync local auth session
        const updatedUser = { 
          ...user, 
          name: formData.fullName, 
          mobile: formData.mobile, 
          email: formData.email 
        }
        login(updatedUser)
        toast.success('Identity profile secured and updated')
        setTimeout(() => navigate('/profile'), 1500)
      } else {
        toast.error(data.message || 'Update rejected')
      }
    } catch (err) {
      toast.error('Profile link failure')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page" style={{ background: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Toaster position="top-right" />
      
      <div style={{ width: '100%', maxWidth: '400px', padding: '24px' }}>
         <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
            <button className="btn btn-outline" style={{ padding: '0.8rem', borderRadius: '14px', border: 'none' }} onClick={() => navigate('/profile')}>
               <ChevronLeft size={24} />
            </button>
            <h1 style={{ fontSize: '22px', fontWeight: 'bold', marginLeft: '12px' }}>Edit Profile</h1>
         </div>

         <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
               <div className="avatar" style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#E0E0E0', fontSize: '3rem' }}>
                  {formData.fullName?.[0] || 'U'}
               </div>
               <button 
                  className="btn btn-primary" 
                  style={{ position: 'absolute', bottom: '0', right: '0', borderRadius: '50%', width: '36px', height: '36px', padding: '0', display: 'grid', placeItems: 'center', pointerEvents: 'none' }}
               >
                  <Camera size={18} />
               </button>
            </div>
         </div>

         <div className="android-card">
            <form onSubmit={handleUpdate}>
               <div className="series-item">
                  <label className="series-label">Full Name</label>
                  <input
                     className="android-input"
                     type="text"
                     placeholder="Full Name"
                     value={formData.fullName}
                     onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                  {errors.fullName && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.fullName}</div>}
               </div>

               <div className="series-item">
                  <label className="series-label">Phone Number</label>
                  <input
                     className="android-input"
                     type="tel"
                     maxLength={10}
                     placeholder="Phone Number"
                     value={formData.mobile}
                     onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                  />
                  {errors.mobile && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.mobile}</div>}
               </div>

               <div className="series-item">
                  <label className="series-label">Email</label>
                  <input
                     className="android-input"
                     type="email"
                     placeholder="Email"
                     value={formData.email}
                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  {errors.email && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.email}</div>}
               </div>

               <button
                  type="submit"
                  className="android-btn-primary"
                  disabled={loading || !isFormValid}
                  style={{ marginTop: '20px', background: '#334155', color: '#FFCC00', opacity: isFormValid ? 1 : 0.5 }}
               >
                  {loading ? <div className="spinner" style={{ margin: '0 auto', width: '24px', height: '24px' }}></div> : 'Save Changes'}
               </button>

               <button
                  type="button"
                  className="android-btn-primary"
                  onClick={() => navigate('/profile')}
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
