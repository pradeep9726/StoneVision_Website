import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, Package, Building, Users, 
  Truck, Bell, User, LogOut, Settings, HelpCircle, 
  ChevronLeft, Menu, X, ShieldCheck, ClipboardList, Camera, FileText
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const [notifCount, setNotifCount] = useState(0)

  const isOwner = user?.role === 'OWNER'

  useEffect(() => {
    if (user) {
      fetchNotifCount()
      const interval = setInterval(fetchNotifCount, 30000) // 30s sync
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchNotifCount = async () => {
    try {
      const res = await api.get(`get_notifications.php?owner_id=${user.id}`)
      const data = res.data.data || res.data.notifications || []
      const unread = data.filter(n => n.isRead === '0' || n.is_read === '0').length
      setNotifCount(unread)
    } catch (e) {
      // Silent fail for background sync
    }
  }

  const ownerLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/inventory', label: 'Inventory', icon: Package },
    { to: '/worksites', label: 'Work Sites', icon: Building },
    { to: '/workers', label: 'Team', icon: Users },
    { to: '/assign-work', label: 'Assign Work', icon: ClipboardList },
    { to: '/shipments', label: 'Shipments', icon: Truck },
    { to: '/detect', label: 'Stone Scan', icon: Camera },
    { to: '/reports', label: 'Archives', icon: FileText },
  ]

  const workerLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tasks', label: 'Current Missions', icon: ClipboardList },
    { to: '/detect', label: 'Vision Scan', icon: Camera },
    { to: '/reports', label: 'My Logs', icon: FileText },
    { to: '/profile', label: 'Identity', icon: User },
  ]

  const links = isOwner ? ownerLinks : workerLinks

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? '' : 'collapsed'}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">V</div>
          <div className="logo-info">
            <div className="logo-text">VisionStone</div>
            <div className="logo-sub">AI Analytics Portal</div>
          </div>
        </div>

        <nav className="nav-section">
          <div className="nav-label">Main Matrix</div>
          {links.map((link) => (
            <NavLink 
              key={link.to} 
              to={link.to} 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <link.icon size={20} />
              <span>{link.label}</span>
            </NavLink>
          ))}

          <div className="nav-label" style={{ marginTop: '2rem' }}>Platform</div>
          <NavLink to="/notifications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
             <div className="relative">
                <Bell size={20} />
                {notifCount > 0 && <div className="notif-badge">{notifCount}</div>}
             </div>
             <span>Active Alerts</span>
          </NavLink>
          <NavLink to="/help" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><HelpCircle size={20} /><span>Secure Help</span></NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip" onClick={() => navigate('/profile')}>
            <div className="avatar">{user?.name?.[0]}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role} Verified</div>
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="main-area">
        <header className="topbar">
          <div className="flex items-center gap-4">
             <button className="menu-toggle" onClick={() => setSidebarOpen(!isSidebarOpen)}>
               {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
             </button>
             <div className="breadcrumb">
                <span style={{ color: 'var(--text-muted)' }}>Portal / </span> 
                {location.pathname.substring(1).split('/').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ')}
             </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3 px-4 py-2 bg-input" style={{ borderRadius: '12px' }}>
                <ShieldCheck size={16} color="var(--success)" />
                <div className="user-name" style={{ fontSize: '.8rem' }}>Status: <span style={{ color: 'var(--success)' }}>GRID ACTIVE</span></div>
             </div>
             
             <div className="relative pointer p-2 hover-bg" onClick={() => navigate('/notifications')} style={{ borderRadius: '10px' }}>
                <Bell size={22} color="var(--text-primary)" />
                {notifCount > 0 && <div className="topbar-notif-badge">{notifCount}</div>}
             </div>

             <div className="avatar pointer" onClick={() => navigate('/profile')} style={{ background: 'var(--accent)', color: 'black' }}>
                {user?.name?.[0]}
             </div>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>

      <style>{`
        .sidebar.collapsed { width: 80px; min-width: 80px; }
        .sidebar.collapsed .logo-info, 
        .sidebar.collapsed span, 
        .sidebar.collapsed .nav-label,
        .sidebar.collapsed .user-info { display: none; }
        .sidebar.collapsed .nav-item { justify-content: center; padding: .75rem; }
        .sidebar.collapsed .sidebar-logo { padding: 1.5rem .5rem; justify-content: center; }
        .sidebar.collapsed .sidebar-footer { flex-direction: column; align-items: center; gap: 1rem; }
        
        .breadcrumb { font-size: .85rem; font-weight: 600; }
        .menu-toggle { background: var(--bg-input); border: none; padding: .5rem; border-radius: 10px; cursor: pointer; color: var(--text-secondary); }
        .menu-toggle:hover { color: var(--text-primary); background: var(--border); }
        
        .notif-badge {
          position: absolute; top: -5px; right: -5px;
          background: var(--danger); color: white;
          font-size: .65rem; padding: 2px 5px; border-radius: 6px;
          border: 2px solid var(--bg-secondary);
        }
        .topbar-notif-badge {
          position: absolute; top: 5px; right: 5px;
          background: var(--danger); color: white;
          font-size: .6rem; min-width: 14px; height: 14px;
          display: grid; place-items: center; border-radius: 50%;
          border: 1.5px solid white; font-weight: 800;
        }
        
        .hover-bg:hover { background: var(--bg-input); }
        .pointer { cursor: pointer; }
        
        .logout-btn { 
          background: rgba(239, 68, 68, 0.1); color: var(--danger); 
          border: none; padding: .5rem; border-radius: 10px; cursor: pointer;
          transition: all .2s;
        }
        .logout-btn:hover { background: var(--danger); color: white; transform: rotate(90deg); }
      `}</style>
    </div>
  )
}
