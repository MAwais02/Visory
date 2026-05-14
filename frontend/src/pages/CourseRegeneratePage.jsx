import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, RefreshCw, BookOpen, Brain, Target, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'

export default function CourseRegeneratePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => api.get(`/courses/${id}`).then((r) => r.data),
  })

  const course = data?.course
  const [form, setForm] = useState({
    subject: '',
    difficulty: 'beginner',
    specificGoals: '',
    targetWeeks: 12,
    hoursPerWeek: 5,
  })
  const hydratedRef = useRef(false)

  useEffect(() => {
    hydratedRef.current = false
  }, [id])

  useEffect(() => {
    if (!course || hydratedRef.current) return
    hydratedRef.current = true
    setForm({
      subject: course.subject || '',
      difficulty: course.difficulty || 'beginner',
      specificGoals: course.generationParams?.specificGoals || '',
      targetWeeks: 12,
      hoursPerWeek: course.hoursPerWeek || 5,
    })
  }, [course])

  const regenerateMutation = useMutation({
    mutationFn: () =>
      api.post(`/courses/${id}/regenerate`, {
        subject: form.subject.trim() || undefined,
        difficulty: form.difficulty,
        specificGoals: form.specificGoals.trim() || undefined,
        targetWeeks: form.targetWeeks,
        hoursPerWeek: form.hoursPerWeek,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['course', id] })
      toast.success('Course outline regenerated')
      navigate(`/courses/${id}`)
    },
    onError: (e) => {
      toast.error(e.response?.data?.error || 'Regeneration failed')
    },
  })

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-white/5 rounded-xl" />
        <div className="h-64 bg-white/5 rounded-2xl" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 text-[#8888aa]">
        Course not found.
        <Link to="/courses" className="block mt-4 text-primary-400 text-sm">Back to courses</Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      <Link to={`/courses/${id}`} className="inline-flex items-center gap-1 text-sm text-[#8888aa] hover:text-white">
        <ArrowLeft size={14} /> Back to course
      </Link>

      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500/80 to-primary-700 shadow-lg shadow-primary-500/20">
          <RefreshCw size={26} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Regenerate outline</h1>
        <p className="text-[#8888aa] text-sm px-2">
          AI will rebuild topics and projects for <span className="text-white font-medium">{course.title}</span>.
          Your course record stays; the curriculum is replaced (version increments).
        </p>
      </div>

      <form
        className="card p-6 space-y-5"
        onSubmit={(e) => {
          e.preventDefault()
          regenerateMutation.mutate()
        }}
      >
        <div>
          <label className="label flex items-center gap-1.5"><BookOpen size={13} /> Subject focus</label>
          <input
            type="text"
            required
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="input"
            placeholder="e.g. Python for Data Science"
          />
        </div>

        <div>
          <label className="label flex items-center gap-1.5"><Brain size={13} /> Difficulty</label>
          <div className="grid grid-cols-3 gap-2">
            {['beginner', 'intermediate', 'advanced'].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setForm({ ...form, difficulty: level })}
                className={`py-2.5 rounded-xl border text-sm font-medium capitalize transition-all
                  ${form.difficulty === level
                    ? 'border-primary-500/50 bg-primary-500/10 text-white'
                    : 'border-white/[0.07] bg-white/[0.02] text-[#8888aa] hover:border-white/20'
                  }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label flex items-center gap-1.5"><Clock size={13} /> Hours per week</label>
          <input
            type="number"
            min={1}
            max={40}
            value={form.hoursPerWeek}
            onChange={(e) => setForm({ ...form, hoursPerWeek: Number(e.target.value) || 5 })}
            className="input"
          />
        </div>

        <div>
          <label className="label flex items-center gap-1.5">
            <Clock size={13} /> Target: <span className="text-primary-400 font-bold">{form.targetWeeks} weeks</span>
          </label>
          <input
            type="range"
            min={4}
            max={52}
            value={form.targetWeeks}
            onChange={(e) => setForm({ ...form, targetWeeks: Number(e.target.value) })}
            className="w-full accent-primary-500"
          />
        </div>

        <div>
          <label className="label flex items-center gap-1.5"><Target size={13} /> Specific goals (optional)</label>
          <textarea
            rows={3}
            value={form.specificGoals}
            onChange={(e) => setForm({ ...form, specificGoals: e.target.value })}
            className="input resize-none"
            placeholder="Adjust what the new outline should emphasize…"
          />
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={regenerateMutation.isPending || !form.subject?.trim()}
            className="btn-primary flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 py-3"
          >
            {regenerateMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Regenerating…
              </>
            ) : (
              <>
                <RefreshCw size={16} /> Regenerate curriculum
              </>
            )}
          </button>
          <Link to={`/courses/${id}`} className="btn-ghost py-3 px-6 text-center">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
