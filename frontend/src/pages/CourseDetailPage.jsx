import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  CheckCircle2, Circle, Sparkles, RefreshCw, Trophy, FileQuestion, ArrowUpRight, GitBranchPlus, Gauge,
  SlidersHorizontal,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'

export default function CourseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => api.get(`/courses/${id}`).then(r => r.data),
  })

  const { data: progressData } = useQuery({
    queryKey: ['progress', id],
    queryFn: async () => {
      try {
        return (await api.get(`/progress/course/${id}`)).data
      } catch (e) {
        if (e.response?.status === 404) return null
        throw e
      }
    },
    retry: false,
  })

  const completeMutation = useMutation({
    mutationFn: (topicIndex) => api.patch(`/courses/${id}/topics/${topicIndex}/complete`),
    onSuccess: () => { qc.invalidateQueries(['course', id]); toast.success('Topic completed! 🎉') },
  })

  const generateQuizMutation = useMutation({
    mutationFn: (topicIndex) =>
      api.post('/quizzes/generate', { courseId: id, topicIndex }).then(r => r.data),
    onSuccess: (data) => {
      toast.success('Quiz generated!')
      const quizId = data?.quiz?._id
      if (quizId) {
        navigate(`/courses/${id}/quiz/${quizId}`)
      } else {
        toast.error('Could not open quiz — ID missing')
      }
    },
    onError: () => toast.error('Failed to generate quiz'),
  })

  const relevanceMutation = useMutation({
    mutationFn: () =>
      api.post(`/courses/${id}/semantic-relevance`, {}, { timeout: 120000 }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['course', id] })
      toast.success('Relevance score saved')
    },
    onError: () => toast.error('Could not compute relevance (first run may take a minute).'),
  })

  const openTopicPage = (topicIndex) => {
    window.open(`/courses/${id}/topics/${topicIndex}`, '_blank', 'noopener,noreferrer')
  }

  const course = data?.course
  if (isLoading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-64 bg-white/5 rounded-xl" />
      <div className="h-4 w-48 bg-white/5 rounded-xl" />
      {[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl" />)}
    </div>
  )
  if (!course) return <div className="text-center py-20 text-[#8888aa]">Course not found.</div>

  const completedTopics = course.topics.filter(t => t.isCompleted).length
  const adaptive = progressData?.progress?.adaptiveLearning
  const resourceLabel = adaptive?.resourceNuance === 'remedial'
    ? 'Beginner-friendly resources'
    : adaptive?.resourceNuance === 'stretch'
      ? 'Deeper / advanced resources'
      : 'Balanced resources'
  const paceLabel = adaptive?.paceHint === 'slow_down'
    ? 'Take it slower'
    : adaptive?.paceHint === 'speed_up'
      ? 'You can accelerate'
      : 'Standard pace'

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 gap-y-1">
              <h1 className="text-2xl font-bold text-white">{course.title}</h1>
              {course.semanticRelevance?.overallScore != null && (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 text-xs font-semibold border border-emerald-500/30 shrink-0"
                  title={`Outline vs title + description (HF ${course.semanticRelevance.embeddingModel || 'MiniLM'})`}
                >
                  <Gauge size={13} aria-hidden />
                  Relevance score: {course.semanticRelevance.overallScore}%
                </span>
              )}
            </div>
            <p className="text-[#8888aa] text-sm mt-1">{course.description}</p>
            {course.semanticRelevance?.overallScore == null && (
              <button
                type="button"
                onClick={() => relevanceMutation.mutate()}
                disabled={relevanceMutation.isPending}
                className="mt-2 text-xs text-primary-300 hover:text-primary-200 underline disabled:opacity-50"
              >
                {relevanceMutation.isPending ? 'Computing relevance…' : 'Compute & save relevance score'}
              </button>
            )}
            {course.semanticRelevance?.overallScore != null && (
              <button
                type="button"
                onClick={() => relevanceMutation.mutate()}
                disabled={relevanceMutation.isPending}
                className="mt-2 block text-xs text-[#8888aa] hover:text-white underline disabled:opacity-50"
              >
                {relevanceMutation.isPending ? 'Recalculating…' : 'Recalculate relevance'}
              </button>
            )}
          </div>
          <Link to={`/courses/${id}/regenerate`}
            className="btn-ghost text-xs flex items-center gap-1.5 flex-shrink-0">
            <RefreshCw size={13} /> Regenerate
          </Link>
        </div>

        {/* Progress bar */}
        <div className="mt-4 card p-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-[#8888aa]">{completedTopics}/{course.topics.length} topics</span>
              <span className="text-white font-bold">{course.completionPercentage || 0}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-500"
                style={{ width: `${course.completionPercentage || 0}%` }} />
            </div>
          </div>
          {course.completionPercentage === 100 && (
            <Trophy size={24} className="text-yellow-400 flex-shrink-0" />
          )}
        </div>

        {/* 6.1.9 Adaptive learning summary */}
        <div className="mt-3 card p-4 border-violet-500/15 bg-violet-500/[0.04]">
          <div className="flex items-start gap-3">
            <SlidersHorizontal size={18} className="text-violet-400 flex-shrink-0 mt-0.5" aria-hidden />
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white">Adaptive learning</h3>
              <p className="text-xs text-[#9090ae] mt-0.5">
                After each quiz, the system updates difficulty for new quizzes, pace hints, and how resource searches are phrased (based on your score and study activity).
              </p>
              {adaptive?.updatedAt ? (
                <ul className="mt-2 space-y-1 text-xs text-[#c8c8de]">
                  <li><span className="text-[#8888aa]">Resources:</span> {resourceLabel}</li>
                  <li><span className="text-[#8888aa]">Pace:</span> {paceLabel}</li>
                  {adaptive.effectiveQuizDifficulty && (
                    <li><span className="text-[#8888aa]">Next quiz level:</span> {adaptive.effectiveQuizDifficulty}</li>
                  )}
                  {adaptive.lastQuizScorePct != null && (
                    <li><span className="text-[#8888aa]">Last quiz:</span> {adaptive.lastQuizScorePct}% on {adaptive.lastQuizTopicTitle || 'topic'}</li>
                  )}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-[#8888aa]">Complete a topic quiz to activate personalization.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-white flex items-center gap-2">
            <GitBranchPlus size={16} className="text-primary-400" /> Visual Learning Roadmap
          </h2>
          <p className="text-xs text-[#9090ae] mt-1">Open full visual map with topics and subtopics.</p>
        </div>
        <Link to={`/courses/${id}/roadmap`} className="btn-primary text-xs flex items-center gap-1.5 py-2">
          <ArrowUpRight size={13} /> Open Roadmap
        </Link>
      </div>

      {/* Topics */}
      <div className="space-y-3">
        <h2 className="font-semibold text-white">Curriculum</h2>
        {course.topics.map((topic, topicIdx) => (
          <div key={topic._id || topicIdx}
            className={`card p-4 transition-all ${topic.isCompleted ? 'border-green-500/20 bg-green-500/5' : ''}`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {topic.isCompleted
                  ? <CheckCircle2 size={20} className="text-green-400" />
                  : <Circle size={20} className="text-[#8888aa]" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${topic.isCompleted ? 'text-green-400' : 'text-white'}`}>
                  {topicIdx + 1}. {topic.title}
                </p>
                <p className="text-xs text-[#8888aa] mt-0.5">
                  {topic.subtopics?.length || 0} subtopics · ~{topic.estimatedHours}h
                </p>
                <p className="text-xs text-[#9b9bb7] mt-1 line-clamp-2">
                  {topic.description}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-3">
                  <button
                    onClick={() => openTopicPage(topicIdx)}
                    className="btn-ghost text-xs flex items-center gap-1.5 py-2"
                  >
                    <ArrowUpRight size={13} /> Open Topic
                  </button>
                  {!topic.isCompleted && (
                    <button onClick={() => completeMutation.mutate(topicIdx)}
                      disabled={completeMutation.isPending}
                      className="btn-primary text-xs flex items-center gap-1.5 py-2">
                      <CheckCircle2 size={13} /> Mark Complete
                    </button>
                  )}
                  <button
                    onClick={() => generateQuizMutation.mutate(topicIdx)}
                    disabled={generateQuizMutation.isPending}
                    className="btn-ghost text-xs flex items-center gap-1.5 py-2">
                    {generateQuizMutation.isPending
                      ? <><div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
                      : <><FileQuestion size={13} /> Generate Quiz</>
                    }
                  </button>
                </div>
              </div>
              <span className={`badge flex-shrink-0 ${
                topic.difficultyLevel === 'beginner' ? 'badge-green'
                : topic.difficultyLevel === 'intermediate' ? 'badge-yellow'
                : 'badge-red'
              }`}>
                {topic.difficultyLevel}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Projects */}
      {course.suggestedProjects?.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Sparkles size={16} className="text-primary-400" /> Suggested Projects
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {course.suggestedProjects.map((p, i) => (
              <div key={i} className="card p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-white text-sm">{p.title}</h3>
                  <span className={`badge flex-shrink-0 ${
                    p.difficulty === 'beginner' ? 'badge-green'
                    : p.difficulty === 'intermediate' ? 'badge-yellow'
                    : 'badge-red'
                  }`}>
                    {p.difficulty}
                  </span>
                </div>
                <p className="text-xs text-[#8888aa] mb-2">{p.description}</p>
                {p.technologies?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {p.technologies.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-300 text-[10px]">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}