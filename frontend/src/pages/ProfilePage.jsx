import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { User, Bell, Lock, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import useAuthStore from '../context/authStore'

const LEARNING_STYLES = ['visual', 'auditory', 'reading', 'kinesthetic']
const LEVELS = ['beginner', 'intermediate', 'advanced']

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [tab, setTab] = useState('profile')
  const [form, setForm] = useState({
    name: user?.name || '',
    profile: {
      learningObjectives: user?.profile?.learningObjectives?.join('\n') || '',
      areasOfInterest: user?.profile?.areasOfInterest || [],
      priorKnowledgeLevel: user?.profile?.priorKnowledgeLevel || 'beginner',
      learningStyle: user?.profile?.learningStyle || 'visual',
      hoursPerWeek: user?.profile?.hoursPerWeek || 5,
    },
    notificationPrefs: user?.notificationPrefs || { emailReminders: true, inAppNotifications: true, milestoneAlerts: true, weeklyDigest: true },
  })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })

  const profileMutation = useMutation({
    mutationFn: (payload) => api.put('/users/me/profile', payload),
    onSuccess: (data) => { updateUser(data.data.user); toast.success('Profile saved') },
    onError: () => toast.error('Save failed'),
  })

  const pwMutation = useMutation({
    mutationFn: (payload) => api.put('/users/me/password', payload),
    onSuccess: () => { toast.success('Password updated'); setPwForm({ currentPassword: '', newPassword: '', confirm: '' }) },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  })

  const handleProfileSave = () => {
    profileMutation.mutate({
      name: form.name,
      profile: {
        ...form.profile,
        learningObjectives: form.profile.learningObjectives.split('\n').filter(Boolean),
      },
      notificationPrefs: form.notificationPrefs,
    })
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
  ]

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-white">Profile Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1 w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${tab === id ? 'bg-primary-500 text-white shadow' : 'text-[#8888aa] hover:text-white'}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-white/[0.07]">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-white">{user?.name}</p>
              <p className="text-sm text-[#8888aa]">{user?.email}</p>
              <span className={`badge mt-1 ${user?.role === 'admin' ? 'badge-yellow' : 'badge-primary'}`}>{user?.role}</span>
            </div>
          </div>

          <div>
            <label className="label">Full Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" />
          </div>

          <div>
            <label className="label">Learning Goals (one per line)</label>
            <textarea rows={3} value={form.profile.learningObjectives}
              onChange={e => setForm(f => ({ ...f, profile: { ...f.profile, learningObjectives: e.target.value } }))}
              className="input resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Experience Level</label>
              <select value={form.profile.priorKnowledgeLevel}
                onChange={e => setForm(f => ({ ...f, profile: { ...f.profile, priorKnowledgeLevel: e.target.value } }))}
                className="input">
                {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Learning Style</label>
              <select value={form.profile.learningStyle}
                onChange={e => setForm(f => ({ ...f, profile: { ...f.profile, learningStyle: e.target.value } }))}
                className="input">
                {LEARNING_STYLES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Hours per week: <span className="text-primary-400 font-bold">{form.profile.hoursPerWeek}h</span></label>
            <input type="range" min={1} max={40} value={form.profile.hoursPerWeek}
              onChange={e => setForm(f => ({ ...f, profile: { ...f.profile, hoursPerWeek: Number(e.target.value) } }))}
              className="w-full accent-primary-500" />
          </div>

          <button onClick={handleProfileSave} disabled={profileMutation.isPending}
            className="btn-primary flex items-center gap-2">
            <Save size={15} /> {profileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="card p-6 space-y-4">
          {Object.entries(form.notificationPrefs).map(([key, val]) => (
            <label key={key} className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-white capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
              </div>
              <div onClick={() => setForm(f => ({ ...f, notificationPrefs: { ...f.notificationPrefs, [key]: !val } }))}
                className={`w-11 h-6 rounded-full transition-all cursor-pointer relative ${val ? 'bg-primary-500' : 'bg-white/10'}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${val ? 'left-5.5 translate-x-0.5' : 'left-0.5'}`} />
              </div>
            </label>
          ))}
          <button onClick={handleProfileSave} disabled={profileMutation.isPending} className="btn-primary flex items-center gap-2 mt-2">
            <Save size={15} /> Save Preferences
          </button>
        </div>
      )}

      {tab === 'security' && (
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-white">Change Password</h3>
          {['currentPassword', 'newPassword', 'confirm'].map(field => (
            <div key={field}>
              <label className="label capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
              <input type="password" value={pwForm[field]}
                onChange={e => setPwForm(f => ({ ...f, [field]: e.target.value }))}
                className="input" placeholder="••••••••" />
            </div>
          ))}
          <button
            onClick={() => {
              if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match')
              pwMutation.mutate({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
            }}
            disabled={pwMutation.isPending} className="btn-primary flex items-center gap-2">
            <Lock size={15} /> {pwMutation.isPending ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      )}
    </div>
  )
}
