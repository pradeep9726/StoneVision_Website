import { useEffect, useState, useRef } from 'react'
import api from '../api/axios'
import { CheckCircle, Clock, MapPin, Search, Calendar, MoreVertical, LayoutGrid, List as ListIcon, Info, ClipboardList, X, Camera, Send } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast, { Toaster } from 'react-hot-toast'

export default function TasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [status, setStatus] = useState('Completed')
  const [remarks, setRemarks] = useState('Updated via VisionStone Web Portal')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await api.get(`get_worker_tasks.php?worker_id=${user.id}`)
      const data = res.data
      const list = Array.isArray(data) ? data : (data.data || data.tasks || [])
      setTasks(list)
    } catch (e) {
      console.error(e)
      toast.error('Could not syncing assignment tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateClick = (task) => {
    setSelectedTask(task)
    setShowUpdateModal(true)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onload = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmitUpdate = async (e) => {
    e.preventDefault()
    if (!image) return toast.error('Operational requirement: mission photo evidence required')
    
    setSubmitting(true)
    try {
      const formData = new FormData()
      // Use exact names from WorkUpdateActivity.kt and save_work_update.php
      formData.append('task_id', selectedTask.id)
      formData.append('worker_id', user.id)
      formData.append('owner_id', selectedTask.ownerId || selectedTask.owner_id || '1')
      formData.append('status', status)
      formData.append('remarks', remarks)
      formData.append('image', image)

      const res = await api.post('save_work_update.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (res.data.status === 'success' || res.data.status === true) {
        toast.success(`Mission Update: ${selectedTask.title} verified and uploaded`)
        setShowUpdateModal(false)
        fetchTasks()
        resetForm()
      } else {
        toast.error(res.data.message || 'Mission update rejected by server node')
      }
    } catch (err) {
      console.error(err)
      toast.error('Secure link archive failure')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedTask(null); setStatus('Completed'); setRemarks('Updated via VisionStone Web Portal');
    setImage(null); setImagePreview(null);
  }

  const filtered = tasks.filter(t => 
    (t.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.description || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.site_location || t.location || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="page-description">Retriving assignment records...</p>
      </div>
    )
  }

  return (
    <div>
      <Toaster position="top-right" />
      <div className="page-header mb-8">
        <h1 className="page-title">Personal Task Assignments</h1>
        <p className="page-description">Operations currently assigned to your team identity</p>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="input flex items-center gap-3" style={{ maxWidth: '400px', padding: '0 1rem' }}>
          <Search size={20} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by title or location"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '.85rem 0', border: 'none', background: 'none', outline: 'none', fontSize: '.95rem' }}
          />
        </div>
      </div>

      <div className="card-grid">
        {filtered.map((task, i) => (
          <div key={i} className="card" style={{ borderLeft: (task.status || '').toLowerCase() === 'pending' ? '5px solid var(--accent)' : '5px solid var(--success)' }}>
            <div className="justify-between items-start flex mb-4">
              <div className={`tag ${ (task.status || '').toLowerCase() === 'pending' ? 'tag-warning' : 'tag-success' }`}>
                 {(task.status || 'Pending').toUpperCase()}
              </div>
              <button className="btn btn-sm btn-outline" style={{ border: 'none', padding: '.4rem' }}><MoreVertical size={16} /></button>
            </div>
            
            <h3 className="user-name mb-4" style={{ fontSize: '1.25rem' }}>{task.title}</h3>
            <p className="page-description mb-6" style={{ fontSize: '.925rem', color: 'var(--text-primary)' }}>{task.description || "Operational task mission located in " + (task.site_location || task.location)}</p>
            
            <div className="flex flex-column gap-3 mb-8">
               <div className="flex items-center gap-3 page-description" style={{ fontSize: '.8rem' }}>
                  <MapPin size={14} />
                  {task.site_location || task.location}
               </div>
               <div className="flex items-center gap-3 page-description" style={{ fontSize: '.8rem' }}>
                  <Clock size={14} />
                  Assigned: {task.date || task.assigned_date || "Archive Records"}
               </div>
            </div>

            <div className="flex items-center gap-3">
               <button className="btn btn-primary btn-sm w-full" onClick={() => handleUpdateClick(task)}>
                  <ClipboardList size={14} /> Submit Update
               </button>
               <button className="btn btn-outline btn-sm w-full"><Info size={14} /> Details</button>
            </div>
          </div>
        ))}
      </div>

      {showUpdateModal && selectedTask && (
        <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
           <div className="modal-content" onClick={e => e.stopPropagation()}>
              <X className="close-btn" onClick={() => setShowUpdateModal(false)} />
              <h2 className="logo-text mb-2">Operational Mission Update</h2>
              <p className="page-description mb-8">Submit evidence for <strong>{selectedTask.title}</strong> at {selectedTask.site_location || selectedTask.location}</p>
              
              <form onSubmit={handleSubmitUpdate}>
                 <div className="form-group">
                    <label className="label">Current Status Rank</label>
                    <div className="flex gap-2">
                       {['Completed', 'Pending', 'Incomplete'].map(s => (
                          <button 
                            key={s} 
                            type="button" 
                            onClick={() => setStatus(s)} 
                            className={`btn btn-sm flex-1 ${status === s ? 'btn-primary' : 'btn-outline'}`}
                            style={{ fontSize: '.75rem', borderRadius: '12px' }}
                          >
                            {s}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="form-group">
                    <label className="label">Evidence Metadata (Remarks)</label>
                    <textarea 
                      className="input" 
                      placeholder="Enter operational observations..."
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                      style={{ height: '100px', resize: 'none' }}
                    />
                 </div>

                 <label className="label">Vision Evidence (Visual Capture)</label>
                 <div 
                   onClick={() => fileInputRef.current.click()}
                   style={{ 
                     height: '200px', background: 'var(--bg-input)', borderRadius: '20px', 
                     cursor: 'pointer', overflow: 'hidden', border: imagePreview ? 'none' : '2px dashed var(--border)',
                     display: 'grid', placeItems: 'center', marginBottom: '24px'
                   }}
                 >
                    {imagePreview ? (
                       <img src={imagePreview} alt="Selected" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                       <div className="text-center">
                          <Camera size={32} color="var(--text-muted)" className="mb-2" />
                          <p className="page-description" style={{ fontSize: '.8rem' }}>Click to capture secure vision evidence</p>
                       </div>
                    )}
                 </div>
                 <input type="file" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} accept="image/*" />

                 <button type="submit" className="btn btn-primary w-full mt-2" style={{ height: '56px' }} disabled={submitting}>
                    {submitting ? <div className="spinner"></div> : (
                       <>
                          <Send size={18} />
                          Establish Mission Update
                       </>
                    )}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  )
}
