import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import {
  Users, Search, Plus, Filter, MoreVertical,
  Trash2, Edit, ChevronRight, User, Phone,
  AtSign, Smartphone, X
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

export default function WorkersPage() {
  const navigate = useNavigate()
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingWorker, setEditingWorker] = useState(null)

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    role: 'WORKER'
  })

  useEffect(() => {
    fetchWorkers()
  }, [])

  const fetchWorkers = async () => {
    try {
      const res = await api.get('workerslist.php')
      const raw = res.data
      const data = raw.workers || raw.data || (Array.isArray(raw) ? raw : [])
      setWorkers(data)
    } catch (e) {
      console.error(e)
      toast.error('Could not authenticate vision workers database')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveWorker = async (e) => {
    e.preventDefault()
    if (!formData.fullName || !formData.mobile || !formData.email) {
      return toast.error('Please fill all operational fields')
    }

    try {
      if (editingWorker) {
        // App's updateProfile logic
        const params = new URLSearchParams()
        params.append('mode', 'update')
        params.append('user_id', editingWorker.id)
        params.append('full_name', formData.fullName)
        params.append('email', formData.email)
        params.append('mobile', formData.mobile)

        const res = await api.post('profile.php', params)
        if (res.data.status === 'success' || res.data.status === true) {
          toast.success('Worker identity parameters updated')
        } else {
          toast.error(res.data.message || 'Update rejected')
        }
      } else {
        const params = new URLSearchParams()
        params.append('full_name', formData.fullName)
        params.append('email', formData.email)
        params.append('mobile', formData.mobile)
        params.append('password', formData.password)
        params.append('role', 'WORKER')

        const res = await api.post('signup.php', params)
        if (res.data.status === 'success' || res.data.status === true) {
          toast.success('Worker credentials established and secured')
        } else {
          toast.error(res.data.message || 'Identity creation rejected')
        }
      }
      setShowModal(false)
      setEditingWorker(null)
      fetchWorkers()
    } catch (err) {
      console.error(err)
      toast.error('Secure grid connection failure')
    }
  }

  const handleDelete = async (workerId) => {
    if (!window.confirm('Terminate worker from vision portal?')) return
    try {
      const res = await api.get(`deleteworker.php?id=${workerId}`)
      if (res.data.status === 'success' || res.data.status === true) {
        toast.success('Worker terminated from grid')
        fetchWorkers()
      } else {
        toast.error(res.data.message || 'Termination failed')
      }
    } catch (e) {
      toast.error('Deletion failure')
    }
  }

  const openEdit = (worker) => {
    setEditingWorker(worker)
    setFormData({
      fullName: worker.full_name || worker.fullName || '',
      mobile: worker.mobile || '',
      email: worker.email || '',
      password: '',
      role: 'WORKER'
    })
    setShowModal(true)
  }

  const filtered = workers.filter(w =>
    (w.fullName || w.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (w.mobile || '').toLowerCase().includes(search.toLowerCase()) ||
    (w.email || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="page-description">Updating vision team profiles...</p>
      </div>
    )
  }

  return (
    <div>
      <Toaster position="top-right" />
      <div className="justify-between items-center mb-8 flex">
        <div className="page-header mb-0">
          <h1 className="page-title">Operational Team</h1>
          <p className="page-description">Manage and assign tasks to stone manufacturing workers</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingWorker(null); setFormData({ fullName: '', mobile: '', email: '', password: '', role: 'WORKER' }); setShowModal(true); }}>
          <Plus size={20} />
          Invite Team Member
        </button>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="input flex items-center gap-3" style={{ maxWidth: '400px', padding: '0 1rem' }}>
          <Search size={20} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by name or mobile"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '.85rem 0', border: 'none', background: 'none', outline: 'none', fontSize: '.95rem' }}
          />
        </div>
      </div>

      <div className="card-grid">
        {filtered.map((worker, i) => (
          <div key={i} className="app-card" style={{ padding: '24px' }}>
            <div className="justify-between items-start flex mb-6">
              <div className="avatar" style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'var(--bg-input)', fontSize: '1.5rem' }}>
                {(worker.fullName || worker.full_name)?.[0] || 'W'}
              </div>
              <div className="flex gap-2">
                <button className="btn btn-sm btn-outline" style={{ padding: '.5rem', border: 'none' }} onClick={() => openEdit(worker)}><Edit size={18} /></button>
                {/* Delete button removed */}
              </div>
            </div>

            <h3 className="user-name mb-1" style={{ fontSize: '1.25rem' }}>{worker.fullName || worker.full_name}</h3>
            <div className="tag tag-success mb-6">Member ID: {worker.id}</div>

            <div className="flex flex-column gap-3 mb-6">
              <div className="flex items-center gap-3 page-description" style={{ fontSize: '.875rem' }}>
                <Smartphone size={16} />
                {worker.mobile}
              </div>
              {worker.email && (
                <div className="flex items-center gap-3 page-description" style={{ fontSize: '.875rem' }}>
                  <AtSign size={16} />
                  {worker.email}
                </div>
              )}
            </div>

            <button className="btn btn-primary btn-sm w-full" onClick={() => navigate('/assign-work', { state: { workerId: worker.id } })}>Assign High Level Work</button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <X className="close-btn" onClick={() => setShowModal(false)} />
            <h2 className="logo-text mb-2">{editingWorker ? 'Modify Team Identity' : 'New Team Enrollment'}</h2>
            <p className="page-description mb-8">Establish a secure identity in the vision portal</p>

            <form onSubmit={handleSaveWorker}>
              <div className="form-group">
                <label className="label">Full Legal Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="label">Access Email Address</label>
                <input
                  type="email"
                  className="input"
                  placeholder="worker@visionstone.ai"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="label">Mobile Identification</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="+91 91234 56789"
                  value={formData.mobile}
                  onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>
              {!editingWorker && (
                <div className="form-group">
                  <label className="label">Secure Entry Password</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              )}
              <button type="submit" className="btn btn-primary w-full mt-6" style={{ height: '56px' }}>
                {editingWorker ? 'Update Identity Attributes' : 'Authorize and Create Member'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
