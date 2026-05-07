import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { BookOpen, Plus, Clock, Trash2, RefreshCw, MoreVertical } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../utils/api'

const difficultyColor = { beginner: 'badge-green', intermediate: 'badge-yellow', advanced: 'badge-red' }

export default function CoursesPage() {
  const qc = useQueryClient()
  const [menuOpen, setMenuOpen] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get('/courses').then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/courses/${id}`),
    onSuccess: () => { qc.invalidateQueries(['courses']); toast.success('Course archived') },
  })

  const courses = data?.courses || []

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Courses</h1>
          <p className="text-[#8888aa] text-sm mt-0.5">{courses.length} course{courses.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/courses/generate" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> New Course
        </Link>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-44 shimmer rounded-2xl" />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="card p-16 text-center">
          <BookOpen size={48} className="text-[#8888aa] mx-auto mb-4" />
          <h2 className="text-white font-semibold text-lg">No courses yet</h2>
          <p className="text-[#8888aa] text-sm mt-2 mb-6">Generate your first AI-powered course</p>
          <Link to="/courses/generate" className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> Generate Course
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map(course => (
            <div key={course._id} className="card p-5 hover:border-white/[0.14] transition-all group flex flex-col relative">
              {/* Menu */}
              <div className="absolute top-4 right-4">
                <button onClick={() => setMenuOpen(menuOpen === course._id ? null : course._id)}
                  className="text-[#8888aa] hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all">
                  <MoreVertical size={16} />
                </button>
                {menuOpen === course._id && (
                  <div className="absolute right-0 top-8 bg-[#1c1c2a] border border-white/[0.07] rounded-xl shadow-xl z-10 w-36 overflow-hidden"
                    onMouseLeave={() => setMenuOpen(null)}>
                    <Link to={`/courses/${course._id}`}
                      className="flex items-center gap-2 px-3 py-2.5 text-xs text-[#e8e8f0] hover:bg-white/5 transition-all">
                      <BookOpen size={13} /> Open
                    </Link>
                    <button onClick={() => deleteMutation.mutate(course._id)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 size={13} /> Archive
                    </button>
                  </div>
                )}
              </div>

              <Link to={`/courses/${course._id}`} className="flex-1">
                <div className="flex items-start gap-2 mb-3 pr-6">
                  <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors line-clamp-2 leading-snug">
                    {course.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className={`badge ${difficultyColor[course.difficulty] || 'badge-primary'}`}>{course.difficulty}</span>
                  <span className={`badge ${course.status === 'completed' ? 'badge-green' : 'badge-primary'}`}>{course.status}</span>
                </div>

                <p className="text-xs text-[#8888aa] flex items-center gap-1 mb-3">
                  <Clock size={11} /> {course.estimatedTotalHours}h
                </p>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#8888aa]">Progress</span>
                    <span className="text-white font-medium">{course.completionPercentage || 0}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all"
                      style={{ width: `${course.completionPercentage || 0}%` }} />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
