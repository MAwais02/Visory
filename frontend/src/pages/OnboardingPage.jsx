import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Music, BookOpen, Activity, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import useAuthStore from '../context/authStore'

const STEPS = ['Learning Goals', 'Interests', 'Experience', 'Style & Time']

const INTEREST_OPTIONS = [
  'Web Development', 'Data Science', 'Machine Learning', 'Mobile Development',
  'Cloud Computing', 'Cybersecurity', 'UI/UX Design', 'DevOps', 'Blockchain',
  'Game Development', 'Python', 'JavaScript', 'SQL & Databases', 'System Design',
]

const LEARNING_STYLES = [
  { value: 'visual', label: 'Visual', icon: Eye, desc: 'Diagrams, charts & videos' },
  { value: 'auditory', label: 'Auditory', icon: Music, desc: 'Podcasts & discussions' },
  { value: 'reading', label: 'Reading', icon: BookOpen, desc: 'Articles & documentation' },
  { value: 'kinesthetic', label: 'Kinesthetic', icon: Activity, desc: 'Projects & hands-on' },
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { updateUser } = useAuthStore()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({
    learningObjectives: '',
    areasOfInterest: [],
    priorKnowledgeLevel: 'beginner',
    learningStyle: 'visual',
    hoursPerWeek: 5,
  })

  const toggleInterest = (item) => {
    setData(d => ({
      ...d,
      areasOfInterest: d.areasOfInterest.includes(item)
        ? d.areasOfInterest.filter(i => i !== item)
        : [...d.areasOfInterest, item],
    }))
  }

  const handleFinish = async () => {
    setLoading(true)
    try {
      const profile = {
        learningObjectives: data.learningObjectives.split('\n').filter(Boolean),
        areasOfInterest: data.areasOfInterest,
        priorKnowledgeLevel: data.priorKnowledgeLevel,
        learningStyle: data.learningStyle,
        hoursPerWeek: data.hoursPerWeek,
      }
      const { data: res } = await api.put('/users/me/profile', { profile })
      updateUser(res.user)
      toast.success('Profile set up! Let\'s build your first course.')
      navigate('/courses/generate')
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center px-4">
      <div className="w-full max-w-lg animate-slide-up">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${i < step ? 'bg-primary-500 text-white' : i === step ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50' : 'bg-white/5 text-[#8888aa]'}`}>
                  {i < step ? <Check size={12} /> : i + 1}
                </div>
                {i < STEPS.length - 1 && <div className={`h-px w-12 md:w-20 ${i < step ? 'bg-primary-500' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>
          <p className="text-center text-sm font-medium text-primary-400">{STEPS[step]}</p>
        </div>

        <div className="card p-6">
          {/* Step 0 — Goals */}
          {step === 0 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-bold text-white">What do you want to achieve?</h2>
              <p className="text-[#8888aa] text-sm">Tell us your learning goals (one per line)</p>
              <textarea
                rows={5}
                value={data.learningObjectives}
                onChange={e => setData({ ...data, learningObjectives: e.target.value })}
                className="input resize-none"
                placeholder="e.g., Get a job as a React developer&#10;Build my own SaaS product&#10;Learn machine learning"
              />
            </div>
          )}

          {/* Step 1 — Interests */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-bold text-white">Areas of interest</h2>
              <p className="text-[#8888aa] text-sm">Select all that apply</p>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map(item => (
                  <button key={item} onClick={() => toggleInterest(item)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all
                      ${data.areasOfInterest.includes(item)
                        ? 'bg-primary-500/20 text-primary-300 border-primary-500/50'
                        : 'bg-white/5 text-[#8888aa] border-white/10 hover:border-white/20'
                      }`}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Experience */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-bold text-white">Your experience level</h2>
              <p className="text-[#8888aa] text-sm">This helps us tailor course difficulty</p>
              {['beginner', 'intermediate', 'advanced'].map(level => (
                <button key={level} onClick={() => setData({ ...data, priorKnowledgeLevel: level })}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left
                    ${data.priorKnowledgeLevel === level
                      ? 'border-primary-500/50 bg-primary-500/10 text-white'
                      : 'border-white/[0.07] bg-white/[0.02] text-[#8888aa] hover:border-white/20'
                    }`}>
                  <div className={`w-3 h-3 rounded-full ${data.priorKnowledgeLevel === level ? 'bg-primary-500' : 'bg-white/20'}`} />
                  <div>
                    <p className="font-semibold capitalize">{level}</p>
                    <p className="text-xs mt-0.5">
                      {level === 'beginner' && 'Just getting started'}
                      {level === 'intermediate' && 'Have some experience'}
                      {level === 'advanced' && 'Deep expertise, want to go further'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 3 — Style & Time */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-xl font-bold text-white">How do you learn best?</h2>
              <div className="grid grid-cols-2 gap-3">
                {LEARNING_STYLES.map(({ value, label, icon: Icon, desc }) => (
                  <button key={value} onClick={() => setData({ ...data, learningStyle: value })}
                    className={`p-4 rounded-xl border text-left transition-all
                      ${data.learningStyle === value
                        ? 'border-primary-500/50 bg-primary-500/10'
                        : 'border-white/[0.07] bg-white/[0.02] hover:border-white/20'
                      }`}>
                    <Icon size={20} className={data.learningStyle === value ? 'text-primary-400' : 'text-[#8888aa]'} />
                    <p className={`font-semibold text-sm mt-2 ${data.learningStyle === value ? 'text-white' : 'text-[#e8e8f0]'}`}>{label}</p>
                    <p className="text-[#8888aa] text-xs mt-0.5">{desc}</p>
                  </button>
                ))}
              </div>

              <div>
                <label className="label">Hours available per week: <span className="text-primary-400 font-bold">{data.hoursPerWeek}h</span></label>
                <input type="range" min={1} max={40} value={data.hoursPerWeek}
                  onChange={e => setData({ ...data, hoursPerWeek: Number(e.target.value) })}
                  className="w-full accent-primary-500 mt-2" />
                <div className="flex justify-between text-xs text-[#8888aa] mt-1">
                  <span>1h</span><span>20h</span><span>40h</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.07]">
            <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
              className="btn-ghost flex items-center gap-2 disabled:opacity-30">
              <ChevronLeft size={16} /> Back
            </button>

            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)} className="btn-primary flex items-center gap-2">
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleFinish} disabled={loading} className="btn-primary flex items-center gap-2">
                {loading ? 'Saving...' : 'Start Learning'} <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
