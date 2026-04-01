import { Settings, Shield, Bell, Moon, Sun, Lock, Trash2, Globe, Database, HelpCircle, ChevronRight, X, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import toast, { Toaster } from 'react-hot-toast'

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [showClearModal, setShowClearModal] = useState(false)

  const handleClearCache = () => {
    toast.success('Vision cache purged and re-indexed')
    setShowClearModal(false)
  }

  return (
    <div>
      <Toaster position="top-right" />
      <div className="page-header mb-8">
        <h1 className="page-title">Portal Configuration</h1>
        <p className="page-description">Manage platform parameters, security policies and interface preferences</p>
      </div>

      <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
         <div className="card p-0 overflow-hidden">
            <div className="p-8 border-b" style={{ background: 'var(--bg-input)', borderBottom: '1px solid var(--border)' }}>
               <h3 className="logo-text flex items-center gap-4" style={{ fontSize: '1.1rem' }}>
                  <Bell size={20} color="var(--accent)" />
                  Alert Protocols
               </h3>
            </div>
            <div className="p-4">
               <div className="flex items-center justify-between p-4 hover-bg pointer" style={{ borderRadius: '16px' }} onClick={() => setNotifications(!notifications)}>
                  <div>
                     <div className="user-name">Push Vision Alerts</div>
                     <div className="page-description" style={{ fontSize: '.75rem' }}>Receive real-time stone mission updates</div>
                  </div>
                  <div className={`switch ${notifications ? 'on' : ''}`}></div>
               </div>
               <div className="flex items-center justify-between p-4 hover-bg pointer" style={{ borderRadius: '16px' }}>
                  <div>
                     <div className="user-name">Email Manifests</div>
                     <div className="page-description" style={{ fontSize: '.75rem' }}>Daily summary of inventory changes</div>
                  </div>
                  <div className="switch on"></div>
               </div>
            </div>
         </div>

         <div className="card p-0 overflow-hidden">
            <div className="p-8 border-b" style={{ background: 'var(--bg-input)', borderBottom: '1px solid var(--border)' }}>
               <h3 className="logo-text flex items-center gap-4" style={{ fontSize: '1.1rem' }}>
                  <Sun size={20} color="var(--accent)" />
                  Interface Vision
               </h3>
            </div>
            <div className="p-4">
               <div className="flex items-center justify-between p-4 hover-bg pointer" style={{ borderRadius: '16px' }} onClick={() => setDarkMode(!darkMode)}>
                  <div>
                     <div className="user-name">Deep Dark Mode</div>
                     <div className="page-description" style={{ fontSize: '.75rem' }}>Optimize for low-light factory environments</div>
                  </div>
                  <div className={`switch ${darkMode ? 'on' : ''}`}></div>
               </div>
               <div className="flex items-center justify-between p-4 hover-bg pointer" style={{ borderRadius: '16px' }}>
                  <div>
                     <div className="user-name">Language Portal</div>
                     <div className="page-description" style={{ fontSize: '.75rem' }}>Current Global Grid: English (US)</div>
                  </div>
                  <ChevronRight size={18} color="var(--text-muted)" />
               </div>
            </div>
         </div>

         <div className="card p-0 overflow-hidden">
            <div className="p-8 border-b" style={{ background: 'var(--bg-input)', borderBottom: '1px solid var(--border)' }}>
               <h3 className="logo-text flex items-center gap-4" style={{ fontSize: '1.1rem' }}>
                  <Shield size={20} color="var(--accent)" />
                  Security Grid
               </h3>
            </div>
            <div className="p-4">
               <div className="flex items-center justify-between p-4 hover-bg pointer" style={{ borderRadius: '16px' }}>
                  <div>
                     <div className="user-name">Two-Factor Authentication</div>
                     <div className="page-description" style={{ fontSize: '.75rem' }}>Add secondary encryption layer</div>
                  </div>
                  <div className="switch"></div>
               </div>
               <div className="flex items-center justify-between p-4 hover-bg pointer" style={{ borderRadius: '16px' }} onClick={() => setShowClearModal(true)}>
                  <div>
                     <div className="user-name" style={{ color: 'var(--danger)' }}>Purge Local Trace</div>
                     <div className="page-description" style={{ fontSize: '.75rem' }}>Clear cached vision data (irreversible)</div>
                  </div>
                  <Trash2 size={18} color="var(--danger)" />
               </div>
            </div>
         </div>

         <div className="card p-8 flex flex-column justify-center items-center text-center" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', border: 'none' }}>
            <div className="avatar" style={{ background: 'var(--accent)', color: 'black', width: '60px', height: '60px', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
               <ShieldAlert size={32} />
            </div>
            <h3 className="logo-text" style={{ color: 'white', marginBottom: '.5rem' }}>System Integrity</h3>
            <p className="page-description" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '.85rem', marginBottom: '1.5rem' }}>VisionStone Grid Version 2.4.1 Build Stable. Your access level is verified as {user.role}.</p>
            <button className="btn btn-primary w-full" style={{ height: '50px' }} onClick={logout}>Secure Termination (Logout)</button>
         </div>
      </div>

      {showClearModal && (
        <div className="modal-overlay" onClick={() => setShowClearModal(false)}>
           <div className="modal-content" onClick={e => e.stopPropagation()}>
              <X className="close-btn" onClick={() => setShowClearModal(false)} />
              <h2 className="logo-text mb-2">Purge Data Trace?</h2>
              <p className="page-description mb-10">This will clear all local cache and mission metadata. Secure node connection required to re-index.</p>
              
              <div className="flex gap-4">
                 <button className="btn btn-outline flex-1" onClick={() => setShowClearModal(false)}>Cancel Mission</button>
                 <button className="btn btn-primary flex-1" style={{ background: 'var(--danger)', color: 'white' }} onClick={handleClearCache}>Authorize Purge</button>
              </div>
           </div>
        </div>
      )}

      <style>{`
        .switch {
          width: 44px; height: 24px;
          background: var(--border); border-radius: 12px;
          position: relative; transition: all .3s;
        }
        .switch::after {
          content: ''; position: absolute;
          width: 18px; height: 18px;
          background: white; border-radius: 50%;
          top: 3px; left: 3px; transition: all .3s;
        }
        .switch.on { background: var(--success); }
        .switch.on::after { left: 23px; }
        
        .hover-bg:hover { background: var(--bg-primary); }
        .border-b { border-bottom: 1px solid var(--border); }
      `}</style>
    </div>
  )
}
