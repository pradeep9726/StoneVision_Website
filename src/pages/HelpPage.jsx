import { Phone, Mail, ChevronLeft, Book } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function HelpPage() {
   const navigate = useNavigate()

   const handleCall = () => {
      window.location.href = 'tel:+9118001234567'
   }

   const handleEmail = () => {
      window.location.href = 'mailto:support@stoneVisionAI.com'
   }

   return (
      <div className="help-container" style={{ maxWidth: '500px', margin: '0 auto', paddingBottom: '40px' }}>
         <div className="flex items-center gap-4 mb-8">
            <button
               className="btn btn-outline"
               style={{ padding: '0.8rem', borderRadius: '14px', border: 'none', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
               onClick={() => navigate('/dashboard')}
            >
               <ChevronLeft size={20} color="#3b82f6" />
            </button>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Support & Help</h1>
         </div>

         <div className="card mb-6" style={{ borderRadius: '24px', padding: '24px', overflow: 'hidden' }}>
            <p className="page-description mb-6" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>For any technical assistance or platform queries, please contact our support team.</p>

            <div className="flex-column gap-6">
               <div
                  className="flex items-center gap-4 hover-bg pointer p-2"
                  style={{ borderBottom: '1px solid #f1f5f9', transition: 'all 0.2s', borderRadius: '12px' }}
                  onClick={handleCall}
               >
                  <div className="avatar" style={{ width: '52px', height: '52px', background: 'rgba(59,130,246,0.1)', flexShrink: 0 }}>
                     <Phone size={22} color="#3b82f6" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                     <div className="user-name" style={{ fontSize: '1.1rem', marginBottom: '2px' }}>Call Support</div>
                     <div className="page-description" style={{ fontSize: '0.9rem', color: '#64748b' }}>+91 1800 123 4567</div>
                  </div>
                  <button className="btn btn-primary" style={{ height: '44px', borderRadius: '12px', padding: '0 20px', background: '#FFCC00', color: 'black' }}>Call</button>
               </div>

               <div
                  className="flex items-center gap-4 hover-bg pointer p-2"
                  style={{ borderBottom: '1px solid #f1f5f9', transition: 'all 0.2s', borderRadius: '12px' }}
                  onClick={handleEmail}
               >
                  <div className="avatar" style={{ width: '52px', height: '52px', background: 'rgba(16,185,129,0.1)', flexShrink: 0 }}>
                     <Mail size={22} color="#10b981" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                     <div className="user-name" style={{ fontSize: '1.1rem', marginBottom: '2px' }}>Email Us</div>
                     <div className="page-description" style={{ fontSize: '0.9rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>support@stoneVisionAI.com</div>
                  </div>
                  <button className="btn btn-outline" style={{ height: '44px', borderRadius: '12px', padding: '0 20px' }}>Email</button>
               </div>

               <div
                  className="flex items-center gap-4 hover-bg pointer p-2"
                  style={{ transition: 'all 0.2s', borderRadius: '12px' }}
                  onClick={() => window.open('/User%20Guide.pdf', '_blank')}
               >
                  <div className="avatar" style={{ width: '52px', height: '52px', background: 'rgba(59,130,246,0.1)', flexShrink: 0 }}>
                     <Book size={22} color="#3b82f6" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                     <div className="user-name" style={{ fontSize: '1.1rem', marginBottom: '2px' }}>User Guide</div>
                     <div className="page-description" style={{ fontSize: '0.9rem', color: '#64748b' }}>Read and learn how to use the app</div>
                  </div>
                  <button className="btn btn-outline" style={{ height: '44px', borderRadius: '12px', padding: '0 20px' }}>Read</button>
               </div>
            </div>
         </div>

         <div className="card mb-6" style={{ borderRadius: '24px', padding: '32px' }}>
            <h3 className="user-name mb-8" style={{ fontSize: '1.4rem' }}>Frequently Asked Questions</h3>
            <div className="flex-column gap-8">
               <div>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '6px', color: '#000' }}>How do I update my task status?</div>
                  <div className="page-description" style={{ fontSize: '1rem', color: '#64748b' }}>Go to the task details and tap "Update Status"</div>
               </div>
               <div>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '6px', color: '#000' }}>How do I upload work photos?</div>
                  <div className="page-description" style={{ fontSize: '1rem', color: '#64748b' }}>Open the task and tap "Upload Work Photo"</div>
               </div>
               <div>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '6px', color: '#000' }}>How do I use AI stone scan?</div>
                  <div className="page-description" style={{ fontSize: '1rem', color: '#64748b' }}>Tap "Scan Stone" from the dashboard quick actions</div>
               </div>
            </div>
         </div>

         <div className="card" style={{ borderRadius: '24px', padding: '24px' }}>
            <h3 className="user-name mb-4">System Information</h3>
            <div className="flex justify-between items-center py-3" style={{ borderBottom: '1px solid var(--border)' }}>
               <span className="page-description">Version</span>
               <span className="user-name" style={{ fontSize: '0.9rem' }}>1.1.1 (Stable)</span>
            </div>
            <div className="flex justify-between items-center py-3">
               <span className="page-description">Server Status</span>
               <div className="flex items-center gap-2">
                  <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></div>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#10b981' }}>Operational</span>
               </div>
            </div>
         </div>
      </div>
   )
}





