import { useEffect, useState } from 'react'
import api from '../api/axios'
import { MapPin, Search, Plus, MoreVertical, Trash2, Edit, ChevronRight, X, Building, Navigation, ChevronDown, Phone, User } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

export default function WorkSitesPage() {
   const [sites, setSites] = useState([])
   const [loading, setLoading] = useState(true)
   const [search, setSearch] = useState('')
   const [showModal, setShowModal] = useState(false)
   const [editingSite, setEditingSite] = useState(null)
   const [expandedId, setExpandedId] = useState(null)

   const [formData, setFormData] = useState({
      siteName: '',
      address: '',
      supervisorName: '',
      supervisorPhone: ''
   })

   useEffect(() => {
      fetchSites()
   }, [])

   const fetchSites = async () => {
      try {
         const res = await api.get('getworksiteslist.php')
         console.log('--- API FULL DATA ---', res.data)
         const raw = res.data
         const data = raw.sites || raw.data || (Array.isArray(raw) ? raw : [])
         setSites(data)
      } catch (e) {
         console.error('WorkSites Load Error:', e)
         toast.error('Mission control sync failure')
      } finally {
         setLoading(false)
      }
   }

   const fetchDetailsAndExpand = async (siteId) => {
      if (expandedId === siteId) {
         setExpandedId(null)
         return
      }

      setExpandedId(siteId)

      try {
         // Attempt to fetch fresh details for this specific site
         // Using both names for compatibility with different backend flavors
         const res = await api.get(`getworksitedetails.php?site_id=${siteId}`).catch(() => null)
         if (res && res.data && res.data.site) {
            const freshSite = res.data.site
            console.log('--- FRESH SITE DETAILS ---', freshSite)
            setSites(prev => prev.map(s => s.id === siteId || s.id == siteId ? { ...s, ...freshSite } : s))
         }
      } catch (err) {
         console.warn('Individual site detail fetch skipped.')
      }
   }

   const handleCreateOrUpdate = async (e) => {
      e.preventDefault()
      if (!formData.siteName || !formData.address) return toast.error('Identification and coords required')

      try {
         if (editingSite) {
            const params = new URLSearchParams()
            params.append('site_id', editingSite.id)
            params.append('site_name', formData.siteName)
            params.append('address', formData.address)
            params.append('supervisor_name', formData.supervisorName)
            params.append('supervisor_phone', formData.supervisorPhone)

            const res = await api.post('updateworksite.php', params)
            if (res.data.status === 'success' || res.data.success === true || res.data.status === true) {
               toast.success('Site parameters updated successfully')
            } else {
               toast.error(res.data.message || 'Update synchronization failed')
            }
         } else {
            const payload = {
               site_name: formData.siteName,
               address: formData.address,
               supervisor_name: formData.supervisorName,
               supervisor_phone: formData.supervisorPhone,
               place_short: ""
            }

            const res = await api.post('addworksite.php', payload)
            if (res.data.status === 'success' || res.data.success === true || res.data.status === true) {
               toast.success('New site established in vision grid')
            } else {
               toast.error(res.data.message || 'Establishment failed')
            }
         }
         setShowModal(false)
         setEditingSite(null)
         fetchSites()
      } catch (err) {
         console.error(err)
         toast.error('Sync failure with remote core')
      }
   }

   const handleDelete = async (siteId) => {
      if (!window.confirm('Eliminate this vision site from your grid permanently?')) return
      try {
         const params = new URLSearchParams()
         params.append('site_id', siteId)
         const res = await api.post('deleteworksite.php', params)
         if (res.data.status === 'success' || res.data.success === true || res.data.status === true) {
            toast.success('Site eliminated from grid')
            fetchSites()
         }
      } catch (e) {
         toast.error('Mission failed: Site remains active')
      }
   }

   const openEditModal = (site) => {
      setEditingSite(site)
      setFormData({
         siteName: site.site_name || site.name || site.siteName || '',
         address: site.address || site.fullAddress || '',
         supervisorName: site.supervisor_name || site.supervisorName || '',
         supervisorPhone: site.supervisor_phone || site.supervisorPhone || ''
      })
      setShowModal(true)
   }

   const filtered = sites.filter(s =>
      (s.site_name || s.name || s.siteName || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.address || s.fullAddress || '').toLowerCase().includes(search.toLowerCase())
   )

   if (loading) {
      return (
         <div className="loading-container">
            <div className="spinner"></div>
            <p className="page-description">Synchronizing vision site data...</p>
         </div>
      )
   }

   return (
      <div className="animate-in">
         <Toaster position="top-right" />
         <div className="justify-between items-center mb-10 flex">
            <div className="page-header mb-0">
               <h1 className="page-title">Vision Site Grid</h1>
               <p className="page-description">Management of all manufacturing and excavation nodes</p>
            </div>
            <button className="btn btn-primary" onClick={() => { setEditingSite(null); setFormData({ siteName: '', address: '', supervisorName: '', supervisorPhone: '' }); setShowModal(true); }}>
               <Plus size={20} />
               Establish Node
            </button>
         </div>

         <div className="flex items-center gap-4 mb-10">
            <div className="input flex items-center gap-3" style={{ maxWidth: '450px', padding: '0 1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
               <Search size={20} color="var(--text-muted)" />
               <input
                  type="text"
                  placeholder="Filter nodes by identifier or address..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: '100%', padding: '1rem 0', border: 'none', background: 'none', outline: 'none', fontSize: '1rem' }}
               />
            </div>
         </div>

         <div className="card-series">
            {filtered.map((site) => (
               <div key={site.id} className={`app-card ${expandedId === site.id ? 'active' : ''}`} style={{ padding: '0', overflow: 'hidden', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                  <div
                     className="header-worker flex items-center justify-between p-7 cursor-pointer"
                     onClick={() => fetchDetailsAndExpand(site.id)}
                  >
                     <div className="flex items-center gap-5">
                        <div className="avatar" style={{ background: 'rgba(59,130,246,0.08)', color: '#3b82f6', width: '56px', height: '56px', borderRadius: '18px' }}>
                           <Building size={24} />
                        </div>
                        <div>
                           <div className="user-name" style={{ fontSize: '1.25rem', marginBottom: '2px' }}>{site.site_name || site.name || site.siteName}</div>
                           <div className="page-description" style={{ fontSize: '.9rem' }}>{site.address || site.fullAddress}</div>
                        </div>
                     </div>
                     <ChevronDown
                        size={22}
                        style={{
                           transform: expandedId === site.id ? 'rotate(180deg)' : 'none',
                           transition: '0.4s',
                           color: 'var(--text-muted)'
                        }}
                     />
                  </div>

                  <div className={`expand-container ${expandedId === site.id ? 'open' : ''}`}>
                     <div className="p-8 border-t" style={{ borderTop: '1px solid #f1f3f5', background: '#fafbfc' }}>
                        <div className="grid grid-2 gap-8 mb-10" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                           <div className="stat-card p-6" style={{ background: 'white', borderRadius: '20px', border: '1px solid #eef0f2', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                              <div className="stat-label flex items-center gap-2 mb-3" style={{ opacity: 0.7 }}><User size={16} color="#3b82f6" /> Assigned Supervisor</div>
                              <div className="user-name" style={{ fontSize: '1.1rem' }}>{site.supervisor_name || site.supervisorName || 'Not Assigned'}</div>
                           </div>
                           <div className="stat-card p-6" style={{ background: 'white', borderRadius: '20px', border: '1px solid #eef0f2', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                              <div className="stat-label flex items-center gap-2 mb-3" style={{ opacity: 0.7 }}><Phone size={16} color="#10b981" /> Primary Contact</div>
                              <div className="user-name" style={{ fontSize: '1.1rem' }}>{site.supervisor_phone || site.supervisorPhone || '-'}</div>
                           </div>
                        </div>

                        <div className="flex gap-4">
                           <button className="btn btn-outline flex-1" style={{ height: '52px', borderRadius: '14px' }} onClick={() => openEditModal(site)}>
                              <Edit size={18} /> Modify Record
                           </button>
                           {/* Delete button removed */}
                        </div>
                     </div>
                  </div>
               </div>
            ))}

            {filtered.length === 0 && (
               <div className="card text-center" style={{ padding: '5rem 2rem', border: '2px dashed #e2e8f0', borderRadius: '32px' }}>
                  <Building size={64} style={{ margin: '0 auto 1.5rem', opacity: .1 }} />
                  <p className="page-description" style={{ fontSize: '1.1rem' }}>No vision nodes currently established in your mission profile.</p>
               </div>
            )}
         </div>

         {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
               <div className="modal-content" onClick={e => e.stopPropagation()} style={{ borderRadius: '32px', padding: '40px' }}>
                  <X className="close-btn" onClick={() => setShowModal(false)} />
                  <h2 className="logo-text mb-2" style={{ fontSize: '1.8rem' }}>{editingSite ? 'Modify Vision Node' : 'Initialize New Node'}</h2>
                  <p className="page-description mb-10">Configure operational parameters for this geographically accurate excavation point</p>

                  <form onSubmit={handleCreateOrUpdate}>
                     <div className="form-group mb-5">
                        <label className="label">Site Designation</label>
                        <input
                           type="text"
                           className="input"
                           placeholder="e.g. Hyderabad Polishing Unit"
                           value={formData.siteName}
                           onChange={e => setFormData({ ...formData, siteName: e.target.value })}
                           style={{ height: '56px', borderRadius: '14px' }}
                        />
                     </div>
                     <div className="form-group mb-5">
                        <label className="label">Node Coordinate Address</label>
                        <input
                           type="text"
                           className="input"
                           placeholder="Street, City, Zip Code"
                           value={formData.address}
                           onChange={e => setFormData({ ...formData, address: e.target.value })}
                           style={{ height: '56px', borderRadius: '14px' }}
                        />
                     </div>
                     <div className="form-group mb-5">
                        <label className="label">Assigned Commander (Supervisor)</label>
                        <input
                           type="text"
                           className="input"
                           placeholder="Full Name"
                           value={formData.supervisorName}
                           onChange={e => setFormData({ ...formData, supervisorName: e.target.value })}
                           style={{ height: '56px', borderRadius: '14px' }}
                        />
                     </div>
                     <div className="form-group mb-8">
                        <label className="label">Secure Contact Mobile</label>
                        <input
                           type="tel"
                           className="input"
                           placeholder="+91 00000 00000"
                           value={formData.supervisorPhone}
                           onChange={e => setFormData({ ...formData, supervisorPhone: e.target.value })}
                           style={{ height: '56px', borderRadius: '14px' }}
                        />
                     </div>
                     <button type="submit" className="btn btn-primary w-full" style={{ height: '64px', borderRadius: '16px', fontSize: '1.1rem', background: '#3b82f6' }}>
                        {editingSite ? 'Sync Node Parameters' : 'Authorize New Node'}
                     </button>
                  </form>
               </div>
            </div>
         )}
      </div>
   )
}
