import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck, BookOpen } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import api from '../utils/api'

const typeIcons = {
  study_reminder: '📚',
  milestone: '🏆',
  course_update: '📖',
  quiz_available: '📝',
  streak: '🔥',
  system: '⚙️',
}

export default function NotificationsPage() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data),
  })

  const readAllMutation = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries(['notifications']),
  })

  const readOneMutation = useMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries(['notifications']),
  })

  const notifications = data?.notifications || []
  const unread = data?.unreadCount || 0

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell size={22} className="text-primary-400" /> Notifications
          </h1>
          <p className="text-[#8888aa] text-sm mt-0.5">{unread} unread</p>
        </div>
        {unread > 0 && (
          <button onClick={() => readAllMutation.mutate()}
            className="btn-ghost text-xs flex items-center gap-1.5">
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 shimmer rounded-2xl" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card p-16 text-center">
          <Bell size={40} className="text-[#8888aa] mx-auto mb-3" />
          <p className="text-white font-medium">No notifications yet</p>
          <p className="text-[#8888aa] text-sm mt-1">You'll see study reminders and milestones here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n._id}
              onClick={() => !n.isRead && readOneMutation.mutate(n._id)}
              className={`card p-4 flex items-start gap-3 cursor-pointer transition-all hover:border-white/[0.14]
                ${!n.isRead ? 'border-primary-500/30 bg-primary-500/5' : ''}`}>
              <span className="text-xl flex-shrink-0">{typeIcons[n.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium ${!n.isRead ? 'text-white' : 'text-[#8888aa]'}`}>
                    {n.title}
                  </p>
                  {!n.isRead && (
                    <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-xs text-[#8888aa] mt-0.5">{n.message}</p>
                <p className="text-[10px] text-[#8888aa]/60 mt-1">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}