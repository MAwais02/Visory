import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center text-center px-4">
      <div className="animate-slide-up">
        <p className="text-8xl font-black text-white/5 leading-none">404</p>
        <h1 className="text-2xl font-bold text-white mt-4">Page not found</h1>
        <p className="text-[#8888aa] mt-2 mb-6">This page doesn't exist or was moved.</p>
        <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
          <Home size={16} /> Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
