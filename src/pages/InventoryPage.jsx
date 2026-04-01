import { useEffect, useState, useRef } from 'react'
import api from '../api/axios'
import {
  Plus, Search, Filter, MoreVertical, Package,
  ChevronRight, LayoutGrid, List, X, Camera, ArrowRight, Trash2, Edit
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

export default function InventoryPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [view, setView] = useState('grid')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    stoneType: '',
    size: '',
    quantity: '',
    location: '',
    category: 'Granite',
    photo: null,
    photoPreview: null
  })

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const res = await api.get('inventory.php')
      const data = res.data
      const list = Array.isArray(data) ? data : (data.data || data.inventory || [])
      setItems(list)
    } catch (e) {
      console.error(e)
      toast.error('Inventory stream failed to sync')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAdd = () => {
    setEditingItem(null)
    setFormData({ stoneType: '', size: '', quantity: '', location: '', category: 'Granite', photo: null, photoPreview: null })
    setShowModal(true)
  }

  const handleOpenEdit = (item) => {
    setEditingItem(item)
    setFormData({
      stoneType: item.stoneType || item.stone_type || '',
      size: item.size || item.slabSize || '',
      quantity: item.quantity || '',
      location: item.location || '',
      category: item.category || 'Granite',
      photo: null,
      photoPreview: getImageUrl(item.photo || item.image)
    })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.stoneType || !formData.quantity) return toast.error('Required parameters missing')

    setSaving(true)
    try {
      const data = new FormData()
      data.append('stone_type', formData.stoneType)
      data.append('size', formData.size)
      data.append('quantity', formData.quantity)
      data.append('location', formData.location)
      data.append('category', formData.category)

      if (formData.photo) {
        data.append('photo', formData.photo)
      }

      if (editingItem) {
        // Logic from EditInventoryActivity.kt
        if (formData.photo) {
          // If photo is changed, app calls addInventory then deletes old
          const addRes = await api.post('save_inventory.php', data)
          if (addRes.data.status === 'success' || addRes.data.status === true) {
            await api.post('deleteinventory.php', new URLSearchParams({ inventory_id: editingItem.id }))
            toast.success('Inventory resource rebuilt with new vision')
          }
        } else {
          // Text only update
          data.append('inventory_id', editingItem.id)
          await api.post('updateinventory.php', data)
          toast.success('Inventory parameters updated')
        }
      } else {
        await api.post('save_inventory.php', data)
        toast.success('New inventory identity established')
      }

      setShowModal(false)
      fetchInventory()
    } catch (err) {
      console.error(err)
      toast.error('Data link synchronization failure')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Terminate inventory record from grid?')) return
    try {
      const res = await api.post('deleteinventory.php', new URLSearchParams({ inventory_id: id }))
      if (res.data.status === 'success' || res.data.status === true) {
        toast.success('Item purged from vision grid')
        fetchInventory()
      }
    } catch (e) {
      toast.error('Purge operation failed')
    }
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setFormData({ ...formData, photo: file, photoPreview: reader.result })
      reader.readAsDataURL(file)
    }
  }

  const getImageUrl = (photoPath) => {
    if (!photoPath || photoPath === 'null' || photoPath === '') return null;
    if (photoPath.startsWith('http')) return photoPath;
    const fileName = photoPath.split(/[/\\]/).pop().trim();
    return `/uploads/inventory/${fileName}`;
  }

  const filtered = items.filter(item =>
    (item.stoneType || item.stone_type || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.category || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>
  }

  return (
    <div>
      <Toaster position="top-right" />
      <div className="justify-between items-center mb-8 flex">
        <div className="page-header mb-0">
          <h1 className="page-title">Slab Management Grid</h1>
          <p className="page-description">Manage and track your global stone inventory records</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={20} />
          Register New Slab
        </button>
      </div>

      <div className="flex items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="input flex items-center gap-3" style={{ maxWidth: '400px', padding: '0 1rem' }}>
            <Search size={20} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by stone type, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '.85rem 0', border: 'none', background: 'none', outline: 'none', fontSize: '.95rem' }}
            />
          </div>
          <button className="btn btn-outline" style={{ background: '#fff' }}><Filter size={18} /> Filters</button>
        </div>
        <div className="flex items-center bg-input" style={{ borderRadius: '12px', padding: '4px' }}>
          <button onClick={() => setView('grid')} className={`btn btn-sm ${view === 'grid' ? 'btn-primary' : ''}`} style={{ border: 'none', borderRadius: '10px' }}><LayoutGrid size={18} /></button>
          <button onClick={() => setView('table')} className={`btn btn-sm ${view === 'table' ? 'btn-primary' : ''}`} style={{ border: 'none', borderRadius: '10px' }}><List size={18} /></button>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="card-grid">
          {filtered.map((item, i) => (
            <div key={i} className="app-card" style={{ border: 'none' }}>
              <div
                className="relative"
                style={{
                  height: '240px', background: 'var(--bg-input)', overflow: 'hidden', display: 'grid',
                  placeItems: 'center', borderBottom: '1px solid var(--border)'
                }}
              >
                {getImageUrl(item.photo || item.image) ? (
                  <img
                    src={getImageUrl(item.photo || item.image)}
                    alt={item.stoneType}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <div style={{ display: getImageUrl(item.photo || item.image) ? 'none' : 'flex' }} className="flex flex-column items-center text-center">
                  <Package size={40} color="var(--text-muted)" />
                  <div className="page-description mt-2">Vision Null</div>
                </div>
                <div className="tag tag-neutral absolute" style={{ top: '1rem', left: '1rem', background: 'rgba(255,255,255,0.95)', border: 'none' }}>
                  {item.quantity} Slabs
                </div>
                <div className="absolute flex gap-2" style={{ bottom: '1rem', right: '1rem' }}>
                  <button className="btn btn-sm bg-white shadow-sm" style={{ padding: '.5rem', borderRadius: '10px' }} onClick={() => handleOpenEdit(item)}><Edit size={16} /></button>
                  <button className="btn btn-sm bg-white shadow-sm" style={{ padding: '.5rem', borderRadius: '10px' }} onClick={() => handleDelete(item.id)}><Trash2 size={16} color="var(--danger)" /></button>
                </div>
              </div>
              <div className="p-6">
                <h3 className="user-name mb-1" style={{ fontSize: '1.25rem' }}>{item.stoneType || item.stone_type}</h3>
                <div className="tag tag-neutral mb-6" style={{ fontSize: '.75rem' }}>{item.category} | {item.size || item.slabSize || 'Variable'}</div>
                <div className="flex items-center justify-between pt-6" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <div className="avatar" style={{ width: '28px', height: '28px', fontSize: '.75rem' }}>L</div>
                    <span className="page-description" style={{ fontSize: '.8rem' }}>{item.location || 'Base Warehouse'}</span>
                  </div>
                  <button className="btn btn-outline btn-sm" style={{ padding: '.5rem' }} onClick={() => handleOpenEdit(item)}><ChevronRight size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Stone Slab Identify</th>
                <th>Inventory Category</th>
                <th>Current Quantity</th>
                <th>Slab Dimensions</th>
                <th>Storage Location</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr key={i}>
                  <td><div className="user-name">{item.stoneType || item.stone_type}</div></td>
                  <td><div className="tag tag-neutral">{item.category}</div></td>
                  <td><div className="user-name" style={{ color: 'var(--accent)' }}>{item.quantity} Slabs</div></td>
                  <td>{item.size || item.slabSize || 'Variable'}</td>
                  <td>{item.location}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-outline btn-sm" onClick={() => handleOpenEdit(item)}><Edit size={16} /></button>
                      <button className="btn btn-outline btn-sm" onClick={() => handleDelete(item.id)}><Trash2 size={16} color="var(--danger)" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <X className="close-btn" onClick={() => setShowModal(false)} />
            <h2 className="logo-text mb-2">{editingItem ? 'Edit Slab Identity' : 'New Slab Registration'}</h2>
            <p className="page-description mb-8">Maintain vision parameters for stone inventory records</p>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="label">Stone Professional Designation</label>
                <input type="text" className="input" placeholder="e.g. Black Galaxy Super Premium" value={formData.stoneType} onChange={e => setFormData({ ...formData, stoneType: e.target.value })} />
              </div>
              <div className="flex gap-4 mb-4">
                <div className="form-group flex-1">
                  <label className="label">Slab Thickness / Size</label>
                  <input type="text" className="input" placeholder="e.g. 20mm, 10'x6'" value={formData.size} onChange={e => setFormData({ ...formData, size: e.target.value })} />
                </div>
                <div className="form-group flex-1">
                  <label className="label">Operational Quantity</label>
                  <input type="number" className="input" placeholder="Number of slabs" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Storage Placement</label>
                <input type="text" className="input" placeholder="Aisle B, Block 4" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
              </div>

              <label className="label">Visual Slab Identification</label>
              <div
                onClick={() => fileInputRef.current.click()}
                style={{
                  height: '160px', background: 'var(--bg-input)', borderRadius: '16px',
                  cursor: 'pointer', overflow: 'hidden', border: formData.photoPreview ? 'none' : '2px dashed var(--border)',
                  display: 'grid', placeItems: 'center', marginBottom: '24px'
                }}
              >
                {formData.photoPreview ? (
                  <img src={formData.photoPreview} alt="Selected" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div className="text-center">
                    <Camera size={24} color="var(--text-muted)" className="mb-2" />
                    <p className="page-description" style={{ fontSize: '.75rem' }}>Click to capture or upload vision photo</p>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handlePhotoChange} style={{ display: 'none' }} accept="image/*" />

              <button type="submit" className="btn btn-primary w-full mt-4" style={{ height: '56px' }} disabled={saving}>
                {saving ? <div className="spinner"></div> : 'Save Grid Record'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
