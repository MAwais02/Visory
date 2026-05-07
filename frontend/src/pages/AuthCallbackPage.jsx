// ============================================================
// AuthCallbackPage.jsx
// ============================================================
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useAuthStore from '../context/authStore'

export function AuthCallbackPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { setAuth, fetchMe } = useAuthStore()

  useEffect(() => {
    const token = params.get('token')
    if (token) {
      setAuth(token, null)
      fetchMe().then(() => navigate('/dashboard'))
    } else {
      navigate('/login?error=oauth_failed')
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#8888aa]">Signing you in...</p>
      </div>
    </div>
  )
}

export default AuthCallbackPage

// ============================================================
// NotFoundPage.jsx
// ============================================================
// (exported separately below — put in its own file)
