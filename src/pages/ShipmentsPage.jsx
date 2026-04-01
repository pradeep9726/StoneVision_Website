import { useEffect, useState } from 'react'
import api from '../api/axios'
import { Truck, Search, Plus, MoreVertical, Trash2, Edit, ChevronRight, X, Clock, CheckCircle2, MapPin, User, Hash } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState({ pending: [], completed: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [showModal, setShowModal] = useState(false)
  const [editingShipment, setEditingShipment] = useState(null)
  
  const [formData, setFormData] = useState({
    shipmentId: '',
    customerName: '',
    deliveryLocation: '',
    status: 'In Transit'
  })

  useEffect(() => {
    fetchShipments()
  }, [])

  const fetchShipments = async () => {
    try {
      const res = await api.get('shipmentslist.php')
      setShipments({
        pending: res.data.pending || [],
        completed: res.data.completed || []
      })
    } catch (e) {
      console.error(e)
      toast.error('Logistics stream unavailable')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault()
    if (!formData.shipmentId || !formData.customerName) return toast.error('Check shipment identifiers')
    
    try {
      const params = new URLSearchParams()
      params.append('shipment_id', formData.shipmentId)
      params.append('customer_name', formData.customerName)
      params.append('delivery_location', formData.deliveryLocation)
      params.append('status', formData.status)

      if (editingShipment) {
        params.append('id', editingShipment.id)
        await api.post('updateshipment.php', params)
        toast.success('Logistics record updated')
      } else {
        await api.post('createshipment.php', params)
        toast.success('New shipment dispatched')
      }
      setShowModal(false)
      setEditingShipment(null)
      fetchShipments()
    } catch (err) {
      console.error(err)
      toast.error('Secure logistics link failure')
    }
  }

  const openEditModal = (shipment) => {
    setEditingShipment(shipment)
    setFormData({
      shipmentId: shipment.shipmentId || shipment.shipment_id,
      customerName: shipment.customerName || shipment.customer_name,
      deliveryLocation: shipment.deliveryLocation || shipment.delivery_location,
      status: shipment.status
    })
    setShowModal(true)
  }

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>

  const currentList = activeTab === 'pending' ? shipments.pending : shipments.completed

  return (
    <div>
      <Toaster position="top-right" />
      <div className="justify-between items-center mb-8 flex">
        <div className="page-header mb-0">
          <h1 className="page-title">Operational Logistics</h1>
          <p className="page-description">Real-time tracking of stone shipments and commercial delivery</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingShipment(null); setFormData({shipmentId:'', customerName:'', deliveryLocation:'', status:'In Transit'}); setShowModal(true); }}>
          <Plus size={20} />
          Create New Shipment
        </button>
      </div>

      <div className="flex gap-8 mb-8 border-b" style={{ borderBottom: '1px solid var(--border)' }}>
        <button 
          className={`pb-4 px-2 font-medium transition-all ${activeTab === 'pending' ? 'border-b-2 border-primary text-primary' : 'text-muted'}`}
          style={{ borderBottom: activeTab === 'pending' ? '3px solid var(--accent)' : 'none', color: activeTab === 'pending' ? 'var(--text-primary)' : 'var(--text-muted)' }}
          onClick={() => setActiveTab('pending')}
        >
          Pending Deployments ({shipments.pending.length})
        </button>
        <button 
          className={`pb-4 px-2 font-medium transition-all ${activeTab === 'completed' ? 'border-b-2 border-primary text-primary' : 'text-muted'}`}
          style={{ borderBottom: activeTab === 'completed' ? '3px solid var(--accent)' : 'none', color: activeTab === 'completed' ? 'var(--text-primary)' : 'var(--text-muted)' }}
          onClick={() => setActiveTab('completed')}
        >
          Completed Missions ({shipments.completed.length})
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Shipment ID</th>
              <th>Customer Entity</th>
              <th>Delivery Coordinate</th>
              <th>Mission Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentList.map((item, i) => (
              <tr key={i}>
                <td>
                  <div className="flex items-center gap-3">
                    <Hash size={16} color="var(--text-muted)" />
                    <span className="user-name" style={{ fontSize: '.95rem' }}>{item.shipmentId || item.shipment_id}</span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <User size={16} color="var(--text-muted)" />
                    {item.customerName || item.customer_name}
                  </div>
                </td>
                <td>
                   <div className="flex items-center gap-2 page-description" style={{ fontSize: '.875rem' }}>
                      <MapPin size={16} />
                      {item.deliveryLocation || item.delivery_location}
                   </div>
                </td>
                <td>
                  <div className={`tag ${activeTab === 'pending' ? 'tag-warning' : 'tag-success'}`}>
                    {activeTab === 'pending' ? <Clock size={12} className="mr-1" /> : <CheckCircle2 size={12} className="mr-1" />}
                    {item.status}
                  </div>
                </td>
                <td>
                   <div className="flex gap-2">
                      <button className="btn btn-sm btn-outline" style={{ border: 'none' }} onClick={() => openEditModal(item)}><Edit size={18} /></button>
                   </div>
                </td>
              </tr>
            ))}
            {currentList.length === 0 && (
              <tr><td colSpan="5" className="text-center page-description" style={{ padding: '6rem' }}>No logistics found in the current grid.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
           <div className="modal-content" onClick={e => e.stopPropagation()}>
              <X className="close-btn" onClick={() => setShowModal(false)} />
              <h2 className="logo-text mb-2">{editingShipment ? 'Modify Logistics Record' : 'Create Logistic Mission'}</h2>
              <p className="page-description mb-8">Establish a new delivery tracking record in the vision fleet</p>
              
              <form onSubmit={handleCreateOrUpdate}>
                 <div className="form-group">
                    <label className="label">Public Shipment ID</label>
                    <input 
                      type="text" 
                      className="input" 
                      placeholder="e.g. SVS-1025"
                      value={formData.shipmentId}
                      onChange={e => setFormData({...formData, shipmentId: e.target.value})}
                    />
                 </div>
                 <div className="form-group">
                    <label className="label">Customer / Purchasing Entity</label>
                    <input 
                      type="text" 
                      className="input" 
                      placeholder="Customer Name"
                      value={formData.customerName}
                      onChange={e => setFormData({...formData, customerName: e.target.value})}
                    />
                 </div>
                 <div className="form-group">
                    <label className="label">Geographical Delivery Node</label>
                    <input 
                      type="text" 
                      className="input" 
                      placeholder="Street, City, Country"
                      value={formData.deliveryLocation}
                      onChange={e => setFormData({...formData, deliveryLocation: e.target.value})}
                    />
                 </div>
                 <div className="form-group">
                    <label className="label">Logistics State</label>
                    <select 
                      className="input" 
                      value={formData.status}
                      disabled={editingShipment?.status === 'Delivered'}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                    >
                      {(!editingShipment || (editingShipment.status !== 'Out for Delivery' && editingShipment.status !== 'Delivered')) && (
                        <option>In Transit</option>
                      )}
                      {(!editingShipment || editingShipment.status !== 'Delivered') && (
                        <>
                          <option>Out for Delivery</option>
                          <option>On Hold</option>
                        </>
                      )}
                      <option>Delivered</option>
                    </select>
                    {editingShipment?.status === 'Delivered' && (
                      <p className="page-description mt-2" style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Completed missions cannot be reverted.</p>
                    )}
                 </div>
                 <button type="submit" className="btn btn-primary w-full mt-6" style={{ height: '56px' }}>
                    {editingShipment ? 'Secure Mission Update' : 'Initialize Fleet Mission'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  )
}
