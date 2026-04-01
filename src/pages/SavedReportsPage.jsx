import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import {
   FileText, Search, MoreVertical, Trash2, Edit, ChevronRight, X,
   MapPin, Calendar, Clock, Database, ShieldCheck, Microscope,
   Layers, HardHat, Camera, Filter
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

export default function SavedReportsPage() {
   const { user } = useAuth()
   const [reports, setReports] = useState([])
   const [loading, setLoading] = useState(true)
   const [search, setSearch] = useState('')
   const [selectedReport, setSelectedReport] = useState(null)

   useEffect(() => {
      fetchReports()
   }, [])

   const fetchReports = async () => {
      try {
         const res = await api.get(`reportslist.php?user_id=${user.id}`)
         const raw = res.data
         const data = raw.data || (Array.isArray(raw) ? raw : [])
         
         // Filter locally for previous week items
         const oneWeekAgo = new Date();
         oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
         
         const recentReports = data.filter(report => {
           const reportDateStr = report.report_date || report.reportDate;
           if (!reportDateStr) return false;
           const reportDate = new Date(reportDateStr);
           return reportDate >= oneWeekAgo;
         });
         
         setReports(recentReports)
      } catch (e) {
         console.error(e)
         toast.error('Could not authenticate vision archives')
      } finally {
         setLoading(false)
      }
   }

   const handleDelete = async (reportId) => {
      if (!window.confirm('Erase this vision mission from archives?')) return
      try {
         // Logic for deleting reports (matching Android if applicable, otherwise simple id deletetion)
         const res = await api.get(`deletereport.php?id=${reportId}`)
         if (res.data.status === 'success' || res.data.status === true) {
            toast.success('Mission report destroyed')
            fetchReports()
         } else {
            toast.error(res.data.message || 'Report terminal locked')
         }
      } catch (e) {
         toast.error('Link failure')
      }
   }

   const getImageUrl = (path) => {
      if (!path || path === 'null') return 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400';
      // As per SavedReportsActivity.kt: baseUrl + report.imagePath
      // Where baseUrl is .../visionstone/
      const baseUrl = "http://180.235.121.253:8087/visionstone/";
      return path.startsWith('http') ? path : baseUrl + path;
   }

   const filtered = reports.filter(r =>
      (r.stone_name || r.stoneName || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.origin || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.worker_name || r.workerName || '').toLowerCase().includes(search.toLowerCase())
   )

   if (loading) return <div className="loading-container"><div className="spinner"></div></div>

   return (
      <div>
         <Toaster position="top-right" />
         <div className="justify-between items-center mb-8 flex">
            <div className="page-header mb-0">
               <h1 className="page-title">Vision Archives</h1>
               <p className="page-description">Detailed identification logs and geographical origin logs</p>
            </div>
            <div className="flex gap-4">
               <div className="input flex items-center gap-3" style={{ maxWidth: '300px', padding: '0 1rem' }}>
                  <Search size={18} color="var(--text-muted)" />
                  <input
                     type="text"
                     placeholder="Find in archives..."
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     style={{ width: '100%', padding: '.75rem 0', border: 'none', background: 'none', outline: 'none', fontSize: '.9rem' }}
                  />
               </div>
            </div>
         </div>

         <div className="card-grid">
            {filtered.map((report, i) => (
               <div key={i} className="app-card overflow-hidden" style={{ padding: '0' }} onClick={() => setSelectedReport(report)}>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
                     <img
                        src={getImageUrl(report.image_path || report.imagePath)}
                        alt="Vision Report"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400'; }}
                     />
                     <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                        <div className="tag tag-success" style={{ background: 'rgba(255,255,255,0.9)', color: 'black', backdropFilter: 'blur(4px)' }}>
                           Grade {parseFloat(report.rating || 0).toFixed(1)}
                        </div>
                     </div>
                  </div>

                  <div className="p-6">
                     <div className="justify-between items-start flex mb-4">
                        <div>
                           <h3 className="user-name" style={{ fontSize: '1.2rem' }}>{report.stone_name || report.stoneName || 'Unknown Specimen'}</h3>
                           <div className="page-description flex items-center gap-2 mt-1" style={{ fontSize: '.8rem' }}>
                              <MapPin size={14} /> {report.origin || 'Source Unknown'}
                           </div>
                        </div>
                        {/* Delete button removed as requested */}
                     </div>

                     <div className="justify-between items-center flex mt-6 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
                        <div className="flex items-center gap-2">
                           <Calendar size={14} color="var(--text-muted)" />
                           <span className="page-description" style={{ fontSize: '.75rem' }}>{report.report_date || report.reportDate || 'Vision Date Unrecorded'}</span>
                        </div>
                        <ChevronRight size={18} color="var(--text-muted)" />
                     </div>
                  </div>
               </div>
            ))}
            {filtered.length === 0 && (
               <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '10rem' }}>
                  <FileText size={48} style={{ margin: '0 auto 1.5rem', opacity: .2 }} />
                  <p className="page-description">No mission archives found in the grid.</p>
               </div>
            )}
         </div>

         {selectedReport && (
            <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
               <div className="modal-content" style={{ maxWidth: '900px', width: '90%', padding: '0', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                  <X className="close-btn" onClick={() => setSelectedReport(null)} style={{ top: '24px', right: '24px', zIndex: 10, background: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: '50%', padding: '4px' }} />

                  <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 350px' }}>
                     <div style={{ height: '100%', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                           src={getImageUrl(selectedReport.image_path || selectedReport.imagePath)}
                           style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain' }}
                           onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=600'}
                        />
                     </div>

                     <div className="p-10 flex flex-column gap-8" style={{ background: 'white' }}>
                        <div>
                           <div className="tag tag-success mb-2">Authenticated Archive</div>
                           <h2 className="logo-text" style={{ fontSize: '2rem' }}>{selectedReport.stone_name || selectedReport.stoneName}</h2>
                           <div className="page-description flex items-center gap-2 mt-2">
                              <MapPin size={16} /> {selectedReport.origin}
                           </div>
                        </div>

                        <div className="flex flex-column gap-6">
                           <div className="flex items-center gap-4">
                              <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', borderRadius: '12px' }}>
                                 <ShieldCheck size={20} />
                              </div>
                              <div>
                                 <div className="page-description" style={{ fontSize: '.7rem' }}>Vision Quality Grade</div>
                                 <div className="user-name">Premium Class {selectedReport.rating || '9.8'}/10</div>
                              </div>
                           </div>

                           <div className="flex items-center gap-4">
                              <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '12px' }}>
                                 <HardHat size={20} />
                              </div>
                              <div>
                                 <div className="page-description" style={{ fontSize: '.7rem' }}>Authorized Operative</div>
                                 <div className="user-name">{selectedReport.worker_name || selectedReport.workerName || 'System Scanner'}</div>
                              </div>
                           </div>

                           <div className="flex items-center gap-4">
                              <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', borderRadius: '12px' }}>
                                 <Microscope size={20} />
                              </div>
                              <div>
                                 <div className="page-description" style={{ fontSize: '.7rem' }}>Processing Finish</div>
                                 <div className="user-name">{selectedReport.finish_type || selectedReport.finishType || 'Polished'}</div>
                              </div>
                           </div>

                           <div className="flex items-center gap-4">
                              <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '12px' }}>
                                 <Clock size={20} />
                              </div>
                              <div>
                                 <div className="page-description" style={{ fontSize: '.7rem' }}>Archival Timestamp</div>
                                 <div className="user-name">{selectedReport.report_date || selectedReport.reportDate}</div>
                              </div>
                           </div>
                        </div>

                        <div className="mt-auto pt-8" style={{ borderTop: '1px solid var(--border)' }}>
                           <button className="btn btn-outline w-full" onClick={() => setSelectedReport(null)}>Exit Archive View</button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   )
}
