import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, BookOpen, Target, Clock, Brain, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import useAuthStore from '../context/authStore'

const POPULAR_SUBJECTS = [
  'React & Next.js', 'Python for Data Science', 'Machine Learning', 'Node.js',
  'AWS Cloud', 'System Design', 'TypeScript', 'SQL & PostgreSQL', 'Docker & K8s',
  'Vue.js', 'Flutter', 'Rust', 'GraphQL', 'Solidity & Web3',
]

export default function GenerateCoursePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    subject: '',
    difficulty: user?.profile?.priorKnowledgeLevel || 'beginner',
    specificGoals: '',
    targetWeeks: 12,
  })

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!form.subject.trim()) return toast.error('Please enter a subject')
    setLoading(true)
    try {
      const { data } = await api.post('/courses/generate', form)
      toast.success('Course generated!')
      navigate(`/courses/${data.course._id}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Generation failed. Check your API key.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/30">
          <Sparkles size={26} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Generate a Course</h1>
        <p className="text-[#8888aa]">Tell our AI what you want to learn — it'll build a full course for you</p>
      </div>

      <form onSubmit={handleGenerate} className="card p-6 space-y-5">
        {/* Subject */}
        <div>
          <label className="label flex items-center gap-1.5"><BookOpen size={13} /> What do you want to learn?</label>
          <input
            type="text" required value={form.subject}
            onChange={e => setForm({ ...form, subject: e.target.value })}
            className="input" placeholder="e.g., React, Machine Learning, AWS..."
          />
          {/* Quick picks */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {POPULAR_SUBJECTS.slice(0, 7).map(s => (
              <button key={s} type="button"
                onClick={() => setForm({ ...form, subject: s })}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all
                  ${form.subject === s
                    ? 'bg-primary-500/20 text-primary-300 border-primary-500/40'
                    : 'bg-white/5 text-[#8888aa] border-white/10 hover:border-white/20'
                  }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="label flex items-center gap-1.5"><Brain size={13} /> Difficulty level</label>
          <div className="grid grid-cols-3 gap-2">
            {['beginner', 'intermediate', 'advanced'].map(level => (
              <button key={level} type="button"
                onClick={() => setForm({ ...form, difficulty: level })}
                className={`py-2.5 rounded-xl border text-sm font-medium capitalize transition-all
                  ${form.difficulty === level
                    ? 'border-primary-500/50 bg-primary-500/10 text-white'
                    : 'border-white/[0.07] bg-white/[0.02] text-[#8888aa] hover:border-white/20'
                  }`}>
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Target Duration */}
        <div>
          <label className="label flex items-center gap-1.5">
            <Clock size={13} /> Target duration: <span className="text-primary-400 font-bold">{form.targetWeeks} weeks</span>
          </label>
          <input type="range" min={4} max={52} value={form.targetWeeks}
            onChange={e => setForm({ ...form, targetWeeks: Number(e.target.value) })}
            className="w-full accent-primary-500" />
          <div className="flex justify-between text-xs text-[#8888aa] mt-1">
            <span>4 weeks</span><span>3 months</span><span>1 year</span>
          </div>
        </div>

        {/* Goals */}
        <div>
          <label className="label flex items-center gap-1.5"><Target size={13} /> Specific goals (optional)</label>
          <textarea
            rows={3} value={form.specificGoals}
            onChange={e => setForm({ ...form, specificGoals: e.target.value })}
            className="input resize-none"
            placeholder="e.g., Build a full-stack e-commerce app, prepare for AWS certification..."
          />
        </div>

        {/* User profile hint */}
        {user?.profile?.learningStyle && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-primary-500/5 border border-primary-500/20 text-xs text-primary-300">
            <Sparkles size={12} />
            Course will be tailored for your <strong>{user.profile.learningStyle}</strong> learning style
            with <strong>{user.profile.hoursPerWeek}h/week</strong> schedule.
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3">
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating your course...
            </>
          ) : (
            <><Sparkles size={18} /> Generate Course <ChevronRight size={16} /></>
          )}
        </button>

        {loading && (
          <p className="text-center text-xs text-[#8888aa] animate-pulse">
            This may take 30-60 seconds. AI is building your personalized curriculum...
          </p>
        )}
      </form>
    </div>
  )
}
