import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import {
  Bell, CheckCircle2, AlertCircle, Clock, Search, MoreVertical,
  Trash2, Edit, ChevronRight, X, Info, ShieldAlert, History, Mail, Image as ImageIcon
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifs, setNotifs] = useState({ new: [], older: [] })
  const [loading, setLoading] = useState(true)
  const [selectedNotif, setSelectedNotif] = useState(null)

  useEffect(() => {
    fetchNotifs()
  }, [])

  const fetchNotifs = async () => {
    try {
      const res = await api.get(`get_notifications.php?owner_id=${user.id}`)
      const raw = res.data
      const all = raw.data || raw.notifications || (Array.isArray(raw) ? raw : [])

      const news = all.filter(n => (n.isRead === '0' || n.is_read === '0'))
      const olders = all.filter(n => (n.isRead === '1' || n.is_read === '1'))

      setNotifs({ new: news, older: olders })

      // Mark all as read when page is opened
      if (news.length > 0) {
        api.get(`mark_notifications_read.php?owner_id=${user.id}`)
      }
    } catch (e) {
      console.error(e)
      toast.error('Could not authenticate vision alerts source')
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (notif) => {
    let filename = notif.imagePath || notif.image_path || notif.photo;

    // Search message for image filenames if not explicitly provided (matching Android adapter)
    if (!filename && notif.message) {
      const words = notif.message.split(/\s+/);
      for (const word of words) {
        const clean = word.trim();
        const lower = clean.toLowerCase();
        if (lower.endsWith(".jpg") || lower.endsWith(".png") || lower.endsWith(".jpeg")) {
          if (lower.startsWith("update_") || lower.startsWith("inv_")) {
            filename = clean;
            break;
          }
        }
      }
    }

    if (!filename || filename === 'null') return null;

    const baseUrl = "http://180.235.121.253:8087/visionstone/uploads/";
    const cleanFilename = filename.startsWith('/') ? filename.substring(1).trim() : filename.trim();

    if (filename.startsWith("http")) return filename;
    if (cleanFilename.startsWith("update_")) return baseUrl + "work_updates/" + cleanFilename;
    if (cleanFilename.startsWith("inv_")) return baseUrl + "inventory/" + cleanFilename;
    if (cleanFilename.startsWith("inventory/")) return baseUrl + cleanFilename;
    if (cleanFilename.startsWith("work_updates/")) return baseUrl + cleanFilename;

    return baseUrl + "work_updates/" + cleanFilename;
  }

  const allCount = notifs.new.length + notifs.older.length

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <Toaster position="top-right" />
      <div className="justify-between items-center mb-8 flex">
        <div className="page-header mb-0">
          <h1 className="page-title">Vision Alerts</h1>
          <p className="page-description">Real-time operational streams from manufacturing nodes</p>
        </div>
        <div className="avatar" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', width: '48px', height: '48px', position: 'relative' }}>
          <Bell size={24} />
          {notifs.new.length > 0 && <div className="badge pulse"></div>}
        </div>
      </div>

      <div className="flex flex-column gap-10">
        {notifs.new.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="tag tag-danger" style={{ padding: '.2rem .8rem', fontSize: '.7rem' }}>NEW MISSION LOGS</div>
            </div>
            <div className="flex flex-column gap-3">
              {notifs.new.map((n, i) => (
                <div key={i} className="card p-0 overflow-hidden" style={{ borderLeft: '4px solid var(--danger)', cursor: 'pointer' }} onClick={() => setSelectedNotif(n)}>
                  <div className="p-6">
                    <div className="flex gap-6 mb-4">
                      <div className="stat-icon" style={{ flexShrink: 0, width: '56px', height: '56px', background: 'rgba(239,68,68,0.05)', borderRadius: '16px' }}>
                        <ShieldAlert size={24} color="var(--danger)" />
                      </div>
                      <div className="flex-1">
                        <div className="justify-between items-start flex mb-2">
                          <h3 className="user-name" style={{ fontSize: '1.1rem' }}>{n.title}</h3>
                          <span className="page-description" style={{ fontSize: '.75rem' }}>{n.createdAt || n.created_at}</span>
                        </div>
                        <p className="page-description" style={{ color: 'var(--text-primary)', fontSize: '.95rem' }}>{n.message}</p>
                      </div>
                    </div>
                    {getImageUrl(n) && (
                      <div className="mt-4" style={{ width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden' }}>
                        <img src={getImageUrl(n)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="tag" style={{ padding: '.2rem .8rem', fontSize: '.7rem', background: 'var(--bg-input)', color: 'var(--text-muted)' }}>ARCHIVED ALERTS</div>
          </div>
          <div className="flex flex-column gap-3">
            {notifs.older.map((n, i) => (
              <div key={i} className="card p-0 overflow-hidden" style={{ border: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => setSelectedNotif(n)}>
                <div className="p-6" style={{ opacity: 0.8 }}>
                  <div className="flex gap-6 mb-4">
                    <div className="stat-icon" style={{ flexShrink: 0, width: '56px', height: '56px', background: 'var(--bg-input)', borderRadius: '16px' }}>
                      <History size={24} color="var(--text-muted)" />
                    </div>
                    <div className="flex-1">
                      <div className="justify-between items-start flex mb-2">
                        <h3 className="user-name" style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>{n.title}</h3>
                        <span className="page-description" style={{ fontSize: '.75rem' }}>{n.createdAt || n.created_at}</span>
                      </div>
                      <p className="page-description" style={{ fontSize: '.9rem' }}>{n.message}</p>
                    </div>
                  </div>
                  {getImageUrl(n) && (
                    <div className="mt-4" style={{ width: '100%', height: '150px', borderRadius: '12px', overflow: 'hidden', grayscale: '100%' }}>
                      <img src={getImageUrl(n)} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {allCount === 0 && (
              <div className="card text-center p-20">
                <Mail size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                <p className="page-description">Vision stream is clear. No active alerts.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {selectedNotif && (
        <div className="modal-overlay" onClick={() => setSelectedNotif(null)}>
          <div className="modal-content" style={{ maxWidth: '500px', padding: '0', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <X className="close-btn" onClick={() => setSelectedNotif(null)} style={{ top: '20px', right: '20px', zIndex: 10, background: 'rgba(255,255,255,0.8)', borderRadius: '50%', padding: '4px' }} />

            {getImageUrl(selectedNotif) && (
              <div style={{ width: '100%', height: '250px', background: 'var(--bg-input)' }}>
                <img
                  src={getImageUrl(selectedNotif)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}

            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="logo-text" style={{ fontSize: '1.4rem' }}>{selectedNotif.title}</h2>
              </div>
              <div className="page-description flex items-center gap-2 mb-8" style={{ fontSize: '.8rem' }}>
                <Clock size={14} /> Mission Timestamp: {selectedNotif.createdAt || selectedNotif.created_at}
              </div>

              <div className="bg-input p-6 mb-8" style={{ borderRadius: '16px', color: 'var(--text-primary)', lineHeight: '1.6', fontSize: '1rem' }}>
                {selectedNotif.message}
              </div>

              <button className="btn btn-primary w-full" style={{ height: '56px', borderRadius: '28px' }} onClick={() => setSelectedNotif(null)}>Acknowledge Alert</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .pulse {
          box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          animation: pulse 1.5s infinite cubic-bezier(0.66, 0, 0, 1);
        }
        @keyframes pulse {
          to { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
        }
        .badge {
          position: absolute;
          top: 0; right: 0;
          width: 12px; height: 12px;
          background: var(--danger);
          border-radius: 50%;
          border: 2px solid white;
        }
      `}</style>
    </div>
  )
}
