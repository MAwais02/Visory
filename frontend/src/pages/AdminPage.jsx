// AdminPage.jsx — 4.2.15
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, BookOpen, Trophy, TrendingUp, Shield, UserCheck, UserX, Trash2 } from 'lucide-react'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import toast from 'react-hot-toast'
import api from '../utils/api'

export default function AdminPage() {
  const qc = useQueryClient()

  const { data: statsData } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then(r => r.data),
  })
  const { data: usersData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then(r => r.data),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => api.patch(`/admin/users/${id}`, { isActive }),
    onSuccess: () => { qc.invalidateQueries(['admin-users']); toast.success('User updated') },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/users/${id}`),
    onSuccess: () => { qc.invalidateQueries(['admin-users']); toast.success('User deleted') },
    onError: (e) => toast.error(e.response?.data?.error || 'Delete failed'),
  })

  const stats = statsData?.stats || {}
  const growth = statsData?.userGrowth || []
  const users = usersData?.users || []

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-primary-400' },
    { label: 'New (30d)', value: stats.newUsers, icon: TrendingUp, color: 'text-green-400' },
    { label: 'Total Courses', value: stats.totalCourses, icon: BookOpen, color: 'text-yellow-400' },
    { label: 'Completed', value: stats.completedCourses, icon: Trophy, color: 'text-pink-400' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <Shield size={22} className="text-yellow-400" />
        <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4">
            <Icon size={20} className={`${color} mb-2`} />
            <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
            <p className="text-xs text-[#8888aa]">{label}</p>
          </div>
        ))}
      </div>

      {/* Growth chart */}
      {growth.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-4">User Growth (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={growth} barSize={24}>
              <XAxis dataKey="_id" tick={{ fill: '#8888aa', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1c1c2a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }} />
              <Bar dataKey="count" radius={[6,6,0,0]} fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Users table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-white/[0.07]">
          <h2 className="font-semibold text-white">Users ({usersData?.total || 0})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.07]">
                {['Name', 'Email', 'Courses', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-[#8888aa] font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-all">
                  <td className="px-4 py-3 text-white font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-[#8888aa]">{u.email}</td>
                  <td className="px-4 py-3 text-white">{u.coursesGenerated ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.role === 'admin' ? 'badge-yellow' : 'badge-primary'}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Banned'}</span>
                  </td>
                  <td className="px-4 py-3 text-[#8888aa] text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleMutation.mutate({ id: u._id, isActive: !u.isActive })}
                        className={`p-1.5 rounded-lg transition-all ${u.isActive ? 'text-red-400 hover:bg-red-500/10' : 'text-green-400 hover:bg-green-500/10'}`}
                        title={u.isActive ? 'Ban user' : 'Unban user'}
                      >
                        {u.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                      </button>

                      <button
                        onClick={() => {
                          const ok = window.confirm(
                            `Delete ${u.name} (${u.email})?\n\nThis will remove their courses, progress, quizzes, bookmarks and notifications.`
                          )
                          if (!ok) return
                          deleteMutation.mutate(u._id)
                        }}
                        className="p-1.5 rounded-lg transition-all text-red-400 hover:bg-red-500/10"
                        title="Delete user"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
