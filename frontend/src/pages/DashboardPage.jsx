import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { BookOpen, Clock, Flame, Trophy, Target, ArrowRight, Plus, TrendingUp } from 'lucide-react'
import api from '../utils/api'
import useAuthStore from '../context/authStore'
import { format } from 'date-fns'

const StatCard = ({ icon: Icon, label, value, sub, color = 'primary' }) => {
  const colors = {
    primary: 'text-primary-400 bg-primary-500/10',
    green: 'text-green-400 bg-green-500/10',
    yellow: 'text-yellow-400 bg-yellow-500/10',
    pink: 'text-pink-400 bg-pink-500/10',
  }
  return (
    <div className="card p-5 flex items-start gap-4 hover:border-white/[0.12] transition-all">
      <div className={`p-2.5 rounded-xl ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-[#e8e8f0] font-medium">{label}</p>
        {sub && <p className="text-xs text-[#8888aa] mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1c1c2a] border border-white/[0.07] rounded-xl p-3 text-xs">
      <p className="text-[#8888aa]">{label}</p>
      <p className="text-white font-bold mt-1">{payload[0].value} min</p>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  // Redirect new users to onboarding if profile not set up yet
  useEffect(() => {
    if (user && !user.profile?.learningStyle) {
      navigate('/onboarding', { replace: true })
    }
  }, [user])

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/progress/dashboard').then(r => r.data),
  })

  const stats = data?.stats || {}
  const weeklyData = data?.weeklyData || []
  const courses = data?.courses?.slice(0, 4) || []

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{greeting}, {user?.name?.split(' ')[0]} </h1>
          <p className="text-[#8888aa] mt-1">Here's your learning overview</p>
        </div>
        <Link to="/courses/generate" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> New Course
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Total Courses" value={stats.totalCourses || 0} color="primary" />
        <StatCard icon={Target} label="Completed" value={stats.completedCourses || 0} sub={`${stats.averageCompletion || 0}% avg`} color="green" />
        <StatCard icon={Flame} label="Day Streak" value={`${stats.currentStreak || 0}d`} sub={`Best: ${stats.longestStreak || 0}d`} color="yellow" />
        <StatCard icon={Trophy} label="Achievements" value={stats.totalAchievements || 0} color="pink" />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Study Chart */}
        <div className="lg:col-span-3 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-primary-400" /> Study Activity
            </h2>
            <span className="text-xs text-[#8888aa]">Last 7 days</span>
          </div>
          {isLoading ? (
            <div className="h-40 shimmer rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={weeklyData} barSize={20}>
                <XAxis dataKey="date" tickFormatter={d => format(new Date(d + 'T00:00:00'), 'EEE')}
                  tick={{ fill: '#8888aa', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                  {weeklyData.map((entry, i) => (
                    <Cell key={i} fill={entry.minutes > 0 ? '#6366f1' : 'rgba(255,255,255,0.05)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick stats */}
        <div className="lg:col-span-2 card p-5 flex flex-col justify-between">
          <h2 className="font-semibold text-white mb-4">Time Invested</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#8888aa]">Total hours</span>
                <span className="text-white font-bold">{Math.round((stats.totalTimeSpent || 0) / 60)}h</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full">
                <div className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
                  style={{ width: `${Math.min(((stats.totalTimeSpent || 0) / 6000) * 100, 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#8888aa]">In-progress courses</span>
                <span className="text-white font-bold">{stats.inProgressCourses || 0}</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full">
                <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full"
                  style={{ width: `${stats.totalCourses ? ((stats.inProgressCourses || 0) / stats.totalCourses) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#8888aa]">Days studied</span>
                <span className="text-white font-bold">{data?.allProgress?.reduce((s, p) => s + p.totalDaysStudied, 0) || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Recent Courses</h2>
          <Link to="/courses" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2].map(i => <div key={i} className="h-28 shimmer rounded-2xl" />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="card p-8 text-center">
            <BookOpen size={40} className="text-[#8888aa] mx-auto mb-3" />
            <p className="text-white font-medium">No courses yet</p>
            <p className="text-[#8888aa] text-sm mt-1">Generate your first AI course to get started</p>
            <Link to="/courses/generate" className="btn-primary inline-flex items-center gap-2 mt-4 text-sm">
              <Plus size={14} /> Generate Course
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {courses.map(course => (
              <Link key={course._id} to={`/courses/${course._id}`}
                className="card p-4 hover:border-white/[0.14] transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-white text-sm group-hover:text-primary-400 transition-colors line-clamp-1">
                    {course.title}
                  </h3>
                  <span className={`badge ml-2 flex-shrink-0 ${course.status === 'completed' ? 'badge-green' : 'badge-primary'}`}>
                    {course.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all"
                      style={{ width: `${course.completionPercentage || 0}%` }} />
                  </div>
                  <span className="text-xs text-[#8888aa] w-8 text-right">{course.completionPercentage || 0}%</span>
                </div>
                <p className="text-xs text-[#8888aa] flex items-center gap-1">
                  <Clock size={11} /> {course.estimatedTotalHours}h estimated
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}