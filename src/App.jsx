import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import DashboardPage from './pages/DashboardPage'
import InventoryPage from './pages/InventoryPage'
import WorkSitesPage from './pages/WorkSitesPage'
import WorkersPage from './pages/WorkersPage'
import DetectionPage from './pages/DetectionPage'
import SavedReportsPage from './pages/SavedReportsPage'
import ShipmentsPage from './pages/ShipmentsPage'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'
import EditProfilePage from './pages/EditProfilePage'
import TasksPage from './pages/TasksPage'
import HelpPage from './pages/HelpPage'
import SettingsPage from './pages/SettingsPage'
import AssignWorkPage from './pages/AssignWorkPage'
import UserGuidePage from './pages/UserGuidePage'
import toast, { Toaster } from 'react-hot-toast'

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-container"><div className="spinner"></div></div>
  if (!user) return <Navigate to="/login" />
  if (role && user.role !== role) {
    toast.error('Insufficient clearance for this sector')
    return <Navigate to="/dashboard" />
  }
  return children
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="inventory" element={<ProtectedRoute role="OWNER"><InventoryPage /></ProtectedRoute>} />
            <Route path="worksites" element={<ProtectedRoute role="OWNER"><WorkSitesPage /></ProtectedRoute>} />
            <Route path="workers" element={<ProtectedRoute role="OWNER"><WorkersPage /></ProtectedRoute>} />
            <Route path="detect" element={<ProtectedRoute><DetectionPage /></ProtectedRoute>} />
            <Route path="reports" element={<ProtectedRoute><SavedReportsPage /></ProtectedRoute>} />
            <Route path="shipments" element={<ProtectedRoute role="OWNER"><ShipmentsPage /></ProtectedRoute>} />
            <Route path="notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="edit-profile" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
            <Route path="tasks" element={<ProtectedRoute role="WORKER"><TasksPage /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
            <Route path="assign-work" element={<ProtectedRoute role="OWNER"><AssignWorkPage /></ProtectedRoute>} />
            <Route path="user-guide" element={<ProtectedRoute><UserGuidePage /></ProtectedRoute>} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
