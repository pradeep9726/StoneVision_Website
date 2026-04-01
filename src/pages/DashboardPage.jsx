import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import {
  Users, Package, Bell, Truck, MapPin, Building,
  Plus, ChevronRight, Upload, Camera, CheckCircle,
  FileText, ClipboardList
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isOwner = user?.role === 'OWNER'
  const [stats, setStats] = useState({ workers: 0, inventory: 0, notifications: 0, shipments: 0 })
  const [worksites, setWorksites] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOwner) {
      fetchOwnerData()
    } else {
      fetchWorkerTasks()
    }
  }, [isOwner])

  const parseArray = (raw, keys = ['data', 'inventory', 'workers', 'sites', 'tasks']) => {
    if (Array.isArray(raw)) return raw
    if (raw && typeof raw === 'object') {
      for (const k of keys) {
        if (Array.isArray(raw[k])) return raw[k]
      }
    }
    return []
  }

  const fetchOwnerData = async () => {
    setLoading(true)
    try {
      const [workerRes, invRes, notifRes, shipRes, siteRes] = await Promise.allSettled([
        api.get('workerslist.php'),
        api.get('inventory.php'),
        api.get(`get_notifications.php?owner_id=${user.id}`),
        api.get('shipmentslist.php'),
        api.get('getworksiteslist.php'),
      ])

      const workers = workerRes.status === 'fulfilled' ? parseArray(workerRes.value.data) : []
      const items = invRes.status === 'fulfilled' ? parseArray(invRes.value.data) : []
      const notifsResObj = notifRes.status === 'fulfilled' ? notifRes.value.data : {}
      const notifs = notifsResObj?.data || notifsResObj?.notifications || []
      const unreadCount = notifs.filter(n => n.isRead === '0' || n.is_read === '0').length

      const shipBody = shipRes.status === 'fulfilled' ? shipRes.value.data : {}
      const totalShipments = (shipBody?.pending?.length || 0) + (shipBody?.completed?.length || 0)

      const totalSlabs = items.reduce((acc, item) => {
        const qtyStr = String(item.quantity || '0').replace(/[^0-9.]/g, '')
        return acc + (parseInt(qtyStr) || 0)
      }, 0)

      const siteBody = siteRes.status === 'fulfilled' ? siteRes.value.data : {}
      const sites = siteBody?.sites || siteBody?.data || []

      setStats({
        workers: workers.length,
        inventory: totalSlabs,
        notifications: unreadCount,
        shipments: totalShipments
      })
      setWorksites(sites)
    } catch (e) {
      console.error(e)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchWorkerTasks = async () => {
    setLoading(true)
    try {
      const res = await api.get(`get_worker_tasks.php?worker_id=${user.id}`)
      const all = parseArray(res.data?.tasks || res.data)
      setTasks(all.filter(t => (t.status || t.status?.toString() || '').toLowerCase() === 'pending'))
    } catch (e) {
      console.error(e)
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="page-description">Loading vision records...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          {`Welcome, ${user.name}`}
        </h1>
        <p className="page-description">
          {isOwner ? "Organization vision grid is active and secure." : "Your operational missions for today"}
        </p>
      </div>

      {isOwner ? (
        <>
          <div className="card-grid mb-8">
            <div className="card" onClick={() => navigate('/assign-work')} style={{ cursor: 'pointer' }}>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                  <ClipboardList size={28} />
                </div>
                <div>
                  <div className="stat-value">{stats.workers}</div>
                  <div className="stat-label">Assign Work</div>
                </div>
              </div>
            </div>

            <div className="card" onClick={() => navigate('/inventory')} style={{ cursor: 'pointer' }}>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                  <Package size={28} />
                </div>
                <div>
                  <div className="stat-value">{stats.inventory}</div>
                  <div className="stat-label">Total Inventory (Slabs)</div>
                </div>
              </div>
            </div>

            <div className="card" onClick={() => navigate('/notifications')} style={{ cursor: 'pointer' }}>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                  <Bell size={28} />
                </div>
                <div>
                  <div className="stat-value">{stats.notifications}</div>
                  <div className="stat-label">Urgent Notifications</div>
                </div>
              </div>
            </div>

            <div className="card" onClick={() => navigate('/shipments')} style={{ cursor: 'pointer' }}>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                  <Truck size={28} />
                </div>
                <div>
                  <div className="stat-value">{stats.shipments}</div>
                  <div className="stat-label">Active Shipments</div>
                </div>
              </div>
            </div>
          </div>

          <div className="justify-between items-center mb-4 flex">
            <h2 className="logo-text" style={{ fontSize: '1.25rem' }}>Active Vision Sites</h2>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/worksites')}>View Grid</button>
          </div>

          <div className="table-wrap mb-8">
            <table>
              <thead>
                <tr>
                  <th>Vision Site Identify</th>
                  <th>Geographical Location</th>
                  <th>Supervisor</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {worksites.slice(0, 3).map((site, i) => (
                  <tr key={i} onClick={() => navigate('/worksites')}>
                    <td>
                      <div className="flex items-center gap-4">
                        <div className="avatar" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                          <Building size={18} />
                        </div>
                        <div className="user-name">{site.site_name || site.siteName}</div>
                      </div>
                    </td>
                    <td><div className="page-description" style={{ fontSize: '.875rem' }}>{site.address}</div></td>
                    <td>{site.supervisor_name || site.supervisorName || "N/A"}</td>
                    <td><div className="tag tag-success">Operational</div></td>
                    <td><ChevronRight size={18} color="var(--text-muted)" /></td>
                  </tr>
                ))}
                {worksites.length === 0 && (
                  <tr><td colSpan="5" className="text-center page-description" style={{ padding: '2rem' }}>No vision sites established yet</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="card" style={{ background: 'var(--bg-card-hover)', border: '2px dashed var(--border)', textAlign: 'center', padding: '3.5rem' }}>
            <h3 className="logo-text mb-2">Initialize Stone Analysis Engine</h3>
            <p className="page-description mb-6">Upload stone specimen photo for AI identification and origin detection</p>
            <button className="btn btn-primary" onClick={() => navigate('/detect')} style={{ padding: '1.2rem 4rem', fontSize: '1rem' }}>
              <Camera size={20} />
              Launch Vision Core
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="card-grid mb-8">
            <div className="card" onClick={() => navigate('/tasks')} style={{ cursor: 'pointer' }}>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'var(--accent)', color: 'var(--text-primary)' }}>
                  <ClipboardList size={28} />
                </div>
                <div>
                  <div className="stat-value">{tasks.length}</div>
                  <div className="stat-label">Assigned Missions</div>
                </div>
              </div>
            </div>
            <div className="card" onClick={() => navigate('/reports')} style={{ cursor: 'pointer' }}>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'var(--bg-input)' }}>
                  <FileText size={28} color="var(--text-secondary)" />
                </div>
                <div>
                  <div className="stat-value">View</div>
                  <div className="stat-label">Your Saved Reports</div>
                </div>
              </div>
            </div>
          </div>

          <div className="justify-between items-center mb-6 flex">
            <h2 className="logo-text" style={{ fontSize: '1.25rem' }}>Current Assignment Logs</h2>
          </div>

          <div className="card-grid">
            {tasks.map((task, i) => (
              <div key={i} className="card" style={{ borderLeft: '5px solid var(--accent)' }}>
                <div className="justify-between items-center mb-4 flex">
                  <div className="tag tag-warning">Active Mission</div>
                  <div className="stat-icon" style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--bg-input)' }}>
                    <Plus size={16} />
                  </div>
                </div>
                <h3 className="user-name mb-1" style={{ fontSize: '1.1rem' }}>{task.title}</h3>
                <p className="page-description mb-6" style={{ fontSize: '.875rem', color: 'var(--text-primary)' }}>{task.description || "Operational task mission located in " + (task.site_location || task.location)}</p>
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} color="var(--text-muted)" />
                    <span className="page-description" style={{ fontSize: '.8rem' }}>{task.location || task.site_location}</span>
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={() => navigate('/tasks')}>Mission Update</button>
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem' }}>
                <div className="stat-icon" style={{ margin: '0 auto 1.5rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', width: '80px', height: '80px', borderRadius: '24px' }}>
                  <CheckCircle size={40} />
                </div>
                <h3 className="logo-text">Mission Status: Secure</h3>
                <p className="page-description">All assigned tasks completed for current vision cycle.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
