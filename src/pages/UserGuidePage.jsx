import { ChevronLeft, Book, Shield, Zap, Building, HardHat, Camera, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function UserGuidePage() {
  const navigate = useNavigate()

  const sections = [
    {
      id: 'introduction',
      title: '1. Introduction',
      icon: <Info size={24} />,
      content: 'StoneVision AI is a specialized ERP and Computer Vision solution for the granite industry. It uses a custom-trained TensorFlow Lite model to classify 7 unique stone types while managing factory-floor logistics.'
    },
    {
      id: 'security',
      title: '2. Setup & Security',
      icon: <Shield size={24} />,
      content: [
         {
           subtitle: '2.1 Registration (Signup)',
           details: [
             'Role-Based Access: Toggle between Owner and Worker at the top.',
             'Mobile: Strictly 10 digits.',
             'Password: Must contain 8+ characters, Uppercase, Lowercase, Number, and Special Character (@#$%^&+=!).'
           ]
         },
         {
           subtitle: '2.2 Login',
           details: [
             'Enter your Email or Mobile.',
             'The system automatically identifies your account type and loads the correct dashboard.'
           ]
         },
         {
            subtitle: '2.3 Forgot Password',
            details: [
              'Only your 10-digit mobile is required for verification.',
              'The backend verifies your identity before allowing a password reset.'
            ]
         }
      ]
    },
    {
      id: 'ai-engine',
      title: '3. The AI Engine (Google Lens Behavior)',
      icon: <Zap size={24} />,
      content: [
        'How it works (The Scan Process):',
        '1. Full Frame Check: First, the AI checks if a Major Stone Slab is the primary subject.',
        '2. 5-Region Analysis: The app crops the Center, Top, Bottom, Left, and Right areas to ensure the texture is consistent.',
        '3. Strict Rejection: If the AI detects Faces, Text, or Electronics (Laptops/Phones), it immediately blocks classification to prevent junk data.',
        '4. Color Sanity: It analyzes pixel RGB values to distinguish between dark stones like Black Galaxy and Rajasthan Green.'
      ]
    },
    {
      id: 'owner-ops',
      title: '4. Owner Operations',
      icon: <Building size={24} />,
      content: [
        '4.1 Inventory Management',
        '- Add slabs with photos, sizes, and quantities.',
        '- Track "In Stock" vs "Out of Stock" items.',
        '4.2 Worksite & Workers',
        '- Create sites (Quarry, Factory, Warehouse).',
        '- Assign tasks to workers and monitor their progress via real-time notifications.'
      ]
    },
    {
      id: 'worker-ops',
      title: '5. Worker Operations',
      icon: <HardHat size={24} />,
      content: [
        '5.1 Task Management',
        '- View your daily assignments from the dashboard.',
        '- Submit Work Updates by attaching photos of finished slabs and adding remarks.'
      ]
    },
    {
      id: 'camera-guide',
      title: '6. Image Quality Guidelines',
      icon: <Camera size={24} />,
      content: [
        '✅ DO THIS:',
        '- Use bright, natural lighting',
        '- Fill the screen with stone texture',
        '- Clean the stone surface',
        '- Keep the camera steady',
        '❌ AVOID THIS:',
        '- Using low light or heavy shadows',
        '- Including hands, tools, or feet in frame',
        '- Scanning slabs covered in mud or water',
        '- Taking blurry or moving shots'
      ]
    }
  ]

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="flex items-center gap-4 mb-8">
        <button 
          className="btn btn-outline" 
          style={{ padding: '0.8rem', borderRadius: '14px', border: 'none', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} 
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={20} color="#3b82f6" />
        </button>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>VisionStone AI User Guide</h1>
      </div>

      <div className="card mb-8" style={{ borderRadius: '24px', padding: '40px', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: 'white', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '16px' }}>Mastering StoneVision AI</h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: '1.6', maxWidth: '500px' }}>
            Comprehensive documentation for owners and workers to maximize factor efficiency and AI accuracy.
          </p>
        </div>
        <Book size={180} style={{ position: 'absolute', bottom: '-40px', right: '-20px', opacity: 0.1, transform: 'rotate(-15deg)' }} />
      </div>

      <div className="flex flex-column gap-6">
        {sections.map((section) => (
          <div key={section.id} className="app-card" style={{ borderRadius: '20px', padding: '32px' }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', borderRadius: '14px' }}>
                {section.icon}
              </div>
              <h3 className="user-name" style={{ fontSize: '1.3rem' }}>{section.title}</h3>
            </div>
            
            <div className="page-description" style={{ color: '#334155', lineHeight: '1.7', fontSize: '1.05rem' }}>
              {Array.isArray(section.content) ? (
                <div className="flex flex-column gap-4">
                  {section.content.map((item, idx) => {
                    if (typeof item === 'string') {
                      return <div key={idx} style={{ marginBottom: item.startsWith('-') ? '4px' : '8px' }}>{item}</div>
                    } else {
                      return (
                        <div key={idx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                          <div style={{ fontWeight: '700', marginBottom: '8px', color: '#0f172a' }}>{item.subtitle}</div>
                          {item.details.map((detail, dIdx) => (
                            <div key={dIdx} style={{ fontSize: '0.95rem', marginBottom: '4px', paddingLeft: '12px', borderLeft: '2px solid #cbd5e1' }}>{detail}</div>
                          ))}
                        </div>
                      )
                    }
                  })}
                </div>
              ) : (
                section.content
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 p-8" style={{ borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
         <p className="page-description">Version 1.1.1 | © 2026 StoneVision AI Infrastructure</p>
      </div>
    </div>
  )
}
