import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { ChevronDown, Send, ArrowRight, Plus } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

export default function AssignWorkPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [workers, setWorkers] = useState([])
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  
  // Local state for each worker's form
  const [formData, setFormData] = useState({})

  const workTypes = ['Cutting', 'Polishing', 'Cleaning', 'Packing', 'Loading']

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [wRes, sRes] = await Promise.all([
        api.get('workerslist.php'),
        api.get('getworksiteslist.php')
      ])
      const wData = Array.isArray(wRes.data) ? wRes.data : (wRes.data.data || wRes.data.workers || [])
      const sData = Array.isArray(sRes.data) ? sRes.data : (sRes.data.data || sRes.data.sites || [])
      setWorkers(wData)
      setSites(sData)
      
      // Initialize form data for each worker
      const initialForms = {}
      wData.forEach(w => {
         initialForms[w.id] = { title: 'Select work', location: 'Select site location', description: '' }
      })
      setFormData(initialForms)
    } catch (e) {
      console.error(e)
      toast.error('Network failure syncing team and sites')
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (workerId, field, value) => {
    setFormData(prev => ({
      ...prev,
      [workerId]: { ...prev[workerId], [field]: value }
    }))
  }

  const handleAssign = async (workerId) => {
    const form = formData[workerId]
    if (form.title === 'Select work' || form.location === 'Select site location') {
      return toast.error('Please select valid mission type and location')
    }
    
    try {
      const params = new URLSearchParams()
      params.append('title', form.title)
      params.append('description', form.description)
      params.append('site_location', form.location)
      params.append('worker_id', workerId)
      params.append('owner_id', user.id)

      const res = await api.post('assign_work.php', params)
      if (res.data.status === 'success' || res.data.status === true || res.data.status === '1') {
        toast.success(`Mission assigned to ${workerId}`)
        setExpandedId(null)
        // Reset form for this worker
        handleFieldChange(workerId, 'title', 'Select work')
        handleFieldChange(workerId, 'location', 'Select site location')
        handleFieldChange(workerId, 'description', '')
      } else {
        toast.error(res.data.message || 'Mission assignment rejected')
      }
    } catch (e) {
      toast.error('Secure link failure')
      console.error(e)
    }
  }

  if (loading) {
     return <div className="loading-container"><div className="spinner"></div></div>
  }

  return (
    <div>
      <Toaster position="top-right" />
      <div className="justify-between items-center mb-8 flex">
        <div className="page-header mb-0">
          <h1 className="page-title">Deploy Personnel</h1>
          <p className="page-description">Sequential series of active operational team members</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/workers')}>
          <Plus size={20} />
          New Enrollment
        </button>
      </div>

      <div className="card-series">
        {workers.map((worker) => (
          <div key={worker.id} className="app-card">
            <div 
              className="header-worker" 
              onClick={() => setExpandedId(expandedId === worker.id ? null : worker.id)}
            >
              <div>
                 <div className="user-name" style={{ fontSize: '1.15rem' }}>{worker.fullName || worker.full_name}</div>
                 <div className="page-description" style={{ fontSize: '.85rem', marginTop: '4px' }}>{worker.mobile}</div>
              </div>
              <ChevronDown 
                size={20} 
                style={{ 
                  transform: expandedId === worker.id ? 'rotate(180deg)' : 'none', 
                  transition: '0.3s',
                  color: expandedId === worker.id ? 'var(--accent)' : 'var(--text-muted)'
                }} 
              />
            </div>

            <div className={`expand-container ${expandedId === worker.id ? 'open' : ''}`}>
              <div className="worker-details-area">
                 <p className="user-name mb-6" style={{ fontSize: '1rem', fontWeight: '800' }}>
                   Assigning to {worker.fullName || worker.full_name}
                 </p>
                 
                 <label className="input-group-label" style={{ marginTop: '16px' }}>Mission Type</label>
                 <div className="flex items-center input px-6 py-4 mb-4 pointer" style={{ background: 'white', borderRadius: '12px' }}>
                    <select 
                      value={formData[worker.id]?.title}
                      onChange={(e) => handleFieldChange(worker.id, 'title', e.target.value)}
                      style={{ border: 'none', background: 'none', width: '100%', outline: 'none', color: 'var(--link-blue)', fontWeight: 'bold' }}
                    >
                       <option disabled>Select work</option>
                       {workTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ArrowRight size={16} color="var(--link-blue)" style={{ transform: 'rotate(90deg)' }} />
                 </div>

                 <label className="input-group-label" style={{ marginTop: '16px' }}>Vision Site Location</label>
                 <div className="flex items-center input px-6 py-4 mb-4 pointer" style={{ background: 'white', borderRadius: '12px' }}>
                    <select 
                      value={formData[worker.id]?.location}
                      onChange={(e) => handleFieldChange(worker.id, 'location', e.target.value)}
                      style={{ border: 'none', background: 'none', width: '100%', outline: 'none', color: 'var(--link-blue)', fontWeight: 'bold' }}
                    >
                       <option disabled>Select site location</option>
                       {sites.map(s => <option key={s.id} value={s.siteName || s.site_name}>{s.siteName || s.site_name}</option>)}
                    </select>
                    <ArrowRight size={16} color="var(--link-blue)" style={{ transform: 'rotate(90deg)' }} />
                 </div>

                 <EditText
                    value={formData[worker.id]?.description}
                    onChange={(val) => handleFieldChange(worker.id, 'description', val)}
                 />

                 <button 
                   className="btn btn-primary" 
                   style={{ width: '200px', height: '56px', borderRadius: '28px', marginTop: '24px', background: '#D1D1D1', color: 'black' }}
                   onClick={() => handleAssign(worker.id)}
                 >
                    Assign Work
                 </button>
              </div>
            </div>
          </div>
        ))}
        {workers.length === 0 && (
           <div className="card text-center p-20">
              <Plus size={48} style={{ margin: '0 auto 1rem', opacity: .2 }} />
              <p className="page-description">No workers found in vision grid. Enroll a member to begin deployment.</p>
           </div>
        )}
      </div>
    </div>
  )
}

function EditText({ value, onChange }) {
   return (
      <textarea
        className="input"
        placeholder="Work description"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ 
          marginTop: '16px', height: '120px', background: 'white', border: 'none', 
          borderRadius: '12px', padding: '16px', width: '100%', resize: 'none' 
        }}
      />
   )
}
