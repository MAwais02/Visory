import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import useAuthStore from '../context/authStore'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      setAuth(data.token, data.user)
      toast.success('Account created! Let\'s set up your profile.')
      navigate('/onboarding')
    } catch (err) {
      const errors = err.response?.data?.errors
      toast.error(errors?.[0]?.msg || err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const pw = form.password
  const strength = pw.length === 0 ? 0 : pw.length < 6 ? 1 : pw.length < 10 ? 2 : /[A-Z]/.test(pw) && /[0-9]/.test(pw) ? 4 : 3
  const strengthColors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-slide-up relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 mb-4 shadow-lg shadow-primary-500/30">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Start learning smarter</h1>
          <p className="text-[#8888aa] text-sm mt-1">AI-powered courses personalized for you</p>
        </div>

        <div className="card p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" required value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="input" placeholder="Jane Smith" />
            </div>

            <div>
              <label className="label">Email</label>
              <input type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="input" placeholder="you@example.com" />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input pr-10" placeholder="Min. 8 characters" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8888aa] hover:text-white">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {pw.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColors[strength] : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <span className={`text-xs ${['', 'text-red-400', 'text-yellow-400', 'text-blue-400', 'text-green-400'][strength]}`}>
                    {strengthLabels[strength]}
                  </span>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating account...' : 'Create Free Account'}
            </button>
          </form>

          <p className="text-[10px] text-[#8888aa] text-center">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

        <p className="text-center text-sm text-[#8888aa] mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
