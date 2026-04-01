import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { 
  User, Mail, Phone, ShieldCheck, 
  ChevronLeft, LogOut, Edit
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

export default function ProfilePage() {
  const { user, logout, login } = useAuth()
  const navigate = useNavigate()
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.email) {
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [user?.email])

  const fetchProfile = async () => {
    try {
      // Correcting to match profile.php requirement: mode=get and email
      const res = await api.get(`profile.php?mode=get&email=${user.email}`)
      const data = res.data
      
      if (data.status === true || data.status === 'success') {
        const fetched = data.data
        setProfileData(fetched)
        
        // Sync with AuthContext to update name everywhere (Dashboard, etc.)
        login({ 
          ...user, 
          name: fetched.full_name || fetched.fullName || fetched.name, 
          mobile: fetched.mobile || fetched.phone,
          email: fetched.email 
        })
      } else {
        console.error('Profile fetch rejected:', data.message)
      }
    } catch (e) {
      console.error('Vision profile fetch failure:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Grid access terminated safely')
    navigate('/login')
  }

  const displayUser = profileData || { 
    full_name: user?.name, 
    email: user?.email, 
    mobile: user?.mobile, 
    role: user?.role 
  }

  return (
    <div className="auth-page" style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Toaster position="top-right" />
      
      <div style={{ width: '100%', maxWidth: '400px', padding: '24px' }}>
         <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
            <button className="btn btn-outline" style={{ padding: '0.8rem', borderRadius: '14px', border: 'none' }} onClick={() => navigate('/dashboard')}>
               <ChevronLeft size={24} />
            </button>
            <h1 style={{ fontSize: '22px', fontWeight: 'bold', marginLeft: '12px' }}>Profile View</h1>
         </div>

         <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div className="avatar" style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#F1F5F9', color: '#334155', fontSize: '3rem', margin: '0 auto', border: '4px solid white', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
               {displayUser.full_name?.[0] || 'U'}
            </div>
            <h2 className="logo-text" style={{ fontSize: '22px', marginTop: '20px' }}>{displayUser.full_name || 'User Name'}</h2>
            <p className="page-description" style={{ fontSize: '16px', color: '#64748b' }}>{user?.role === 'OWNER' ? 'Organization Manager' : 'Field Operative'}</p>
         </div>

         <div className="profile-card">
            <div className="profile-row">
               <div className="profile-icon-bg">
                  <User size={20} color="#FFCC00" />
               </div>
               <div style={{ flex: 1 }}>
                  <div className="page-description" style={{ fontSize: '12px' }}>Personal Identity</div>
                  <div className="user-name" style={{ fontSize: '16px' }}>{displayUser.full_name || 'Not Available'}</div>
               </div>
            </div>

            <div className="profile-row">
               <div className="profile-icon-bg">
                  <Phone size={20} color="#FFCC00" />
               </div>
               <div style={{ flex: 1 }}>
                  <div className="page-description" style={{ fontSize: '12px' }}>Communication Line</div>
                  <div className="user-name" style={{ fontSize: '16px' }}>{displayUser.mobile || 'None Linked'}</div>
               </div>
            </div>

            <div className="profile-row" style={{ borderBottom: 'none' }}>
               <div className="profile-icon-bg">
                  <Mail size={20} color="#FFCC00" />
               </div>
               <div style={{ flex: 1 }}>
                  <div className="page-description" style={{ fontSize: '12px' }}>Encryption Address</div>
                  <div className="user-name" style={{ fontSize: '16px' }}>{displayUser.email || 'None Linked'}</div>
               </div>
            </div>
         </div>

         <button
            className="android-btn-primary"
            onClick={() => navigate('/edit-profile')}
            style={{ marginTop: '32px', background: '#000000', color: '#FFCC00' }}
         >
            <div className="flex items-center justify-center gap-2">
               <Edit size={20} />
               Modify Credentials
            </div>
         </button>

         <button
            className="android-btn-primary"
            onClick={handleLogout}
            style={{ marginTop: '16px', background: '#fee2e2', color: '#000000', border: 'none' }}
         >
            <div className="flex items-center justify-center gap-2">
               <LogOut size={20} />
               Secure Logout
            </div>
         </button>
      </div>
      
      <style>{`
        .profile-card {
           background: white;
           padding: 8px 20px;
           border-radius: 24px;
           box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .profile-row {
           display: flex;
           align-items: center;
           gap: 16px;
           padding: 16px 0;
           border-bottom: 1px solid #f1f5f9;
        }
        .profile-icon-bg {
           width: 40px;
           height: 40px;
           border-radius: 12px;
           background: #f8fafc;
           display: flex;
           align-items: center;
           justify-content: center;
        }
      `}</style>
    </div>
  )
}
