import { useQuery, useMutation } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, Clock, Trophy, RotateCcw, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'

export default function QuizPage() {
  const { courseId, quizId } = useParams()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const [timeLeft, setTimeLeft] = useState(null)
  const [startTime] = useState(Date.now())

  const { data, isLoading } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => api.get(`/quizzes/${quizId}`).then(r => r.data),
  })

  const quiz = data?.quiz

  useEffect(() => {
    if (!quiz?.timeLimit || quiz.timeLimit === 0) return
    setTimeLeft(quiz.timeLimit * 60)
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timer); handleSubmit(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [quiz])

  const submitMutation = useMutation({
    mutationFn: (payload) => api.post(`/quizzes/${quizId}/submit`, payload),
    onSuccess: (data) => { setResult(data.data); setSubmitted(true) },
    onError: () => toast.error('Submission failed'),
  })

  const handleSubmit = () => {
    if (!quiz) return
    const payload = {
      answers: quiz.questions.map(q => ({
        questionId: q._id,
        answer: answers[q._id] || '',
      })),
      timeTaken: Math.round((Date.now() - startTime) / 1000),
    }
    submitMutation.mutate(payload)
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  if (isLoading) return (
    <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-white/5 rounded-xl" />
      {[1,2,3].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl" />)}
    </div>
  )
  if (!quiz) return <div className="text-center py-20 text-[#8888aa]">Quiz not found.</div>

  // Results screen
  if (submitted && result) {
    const { percentage, passed, adaptiveSuggestion } = result
    return (
      <div className="max-w-lg mx-auto space-y-6 animate-slide-up">
        <div className={`card p-8 text-center ${passed ? 'border-green-500/30' : 'border-red-500/20'}`}>
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4
            ${passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {passed ? <Trophy size={32} /> : <XCircle size={32} />}
          </div>
          <h2 className="text-3xl font-bold text-white">{percentage}%</h2>
          <p className={`text-lg font-semibold mt-1 ${passed ? 'text-green-400' : 'text-red-400'}`}>
            {passed ? '🎉 Passed!' : 'Not quite — try again'}
          </p>
          <p className="text-[#8888aa] text-sm mt-2">
            {result.score} / {quiz.totalPoints} points · Passing: {quiz.passingScore}%
          </p>
        </div>

        {/* Per-question review */}
        <div className="space-y-3">
          <h3 className="font-semibold text-white">Review</h3>
          {result.attempt?.gradedAnswers?.map((ga, i) => {
            const q = quiz.questions[i]
            return (
              <div key={i} className={`card p-4 ${ga.isCorrect ? 'border-green-500/20' : 'border-red-500/20'}`}>
                <div className="flex gap-2">
                  {ga.isCorrect
                    ? <CheckCircle2 size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                    : <XCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                  }
                  <div>
                    <p className="text-sm text-white font-medium">{q?.questionText}</p>
                    {!ga.isCorrect && (
                      <>
                        <p className="text-xs text-red-400 mt-1">Your answer: {ga.userAnswer || '(blank)'}</p>
                        <p className="text-xs text-green-400">Correct: {ga.correctAnswer}</p>
                      </>
                    )}
                    {ga.explanation && <p className="text-xs text-[#8888aa] mt-1 italic">{ga.explanation}</p>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {adaptiveSuggestion && (
          <div className="card p-4 border-primary-500/20 bg-primary-500/5">
            <p className="text-xs font-semibold text-primary-400 mb-1">🤖 AI Recommendation</p>
            <p className="text-sm text-[#e8e8f0]">{adaptiveSuggestion.recommendation}</p>
            {adaptiveSuggestion.studyTips?.length > 0 && (
              <ul className="mt-2 space-y-1">
                {adaptiveSuggestion.studyTips.map((tip, i) => (
                  <li key={i} className="text-xs text-[#8888aa] flex items-start gap-1.5">
                    <span className="text-primary-400 mt-0.5">•</span> {tip}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => navigate(`/courses/${courseId}`)} className="btn-ghost flex items-center gap-2 flex-1">
            <ArrowLeft size={14} /> Back to Course
          </button>
          {!passed && (
            <button onClick={() => { setSubmitted(false); setAnswers({}) }} className="btn-primary flex items-center gap-2 flex-1">
              <RotateCcw size={14} /> Retry Quiz
            </button>
          )}
        </div>
      </div>
    )
  }

  const answered = Object.keys(answers).length
  const total = quiz.questions.length

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{quiz.title}</h1>
          <p className="text-sm text-[#8888aa]">{answered}/{total} answered</p>
        </div>
        {timeLeft !== null && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-mono font-bold
            ${timeLeft < 60 ? 'bg-red-500/20 text-red-400' : 'bg-primary-500/20 text-primary-400'}`}>
            <Clock size={14} /> {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all"
          style={{ width: `${(answered / total) * 100}%` }} />
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {quiz.questions.map((q, i) => (
          <div key={q._id} className={`card p-5 transition-all ${answers[q._id] ? 'border-primary-500/30' : ''}`}>
            <p className="text-sm font-medium text-[#8888aa] mb-2">Q{i + 1} · {q.type.replace('_', ' ')} · {q.points} pt</p>
            <p className="text-white font-medium mb-3">{q.questionText}</p>

            {q.type === 'multiple_choice' && (
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <button key={oi} onClick={() => setAnswers(a => ({ ...a, [q._id]: opt }))}
                    className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all
                      ${answers[q._id] === opt
                        ? 'border-primary-500/50 bg-primary-500/10 text-white'
                        : 'border-white/[0.07] text-[#8888aa] hover:border-white/20 hover:text-white'
                      }`}>
                    <span className="text-primary-400 font-bold mr-2">{String.fromCharCode(65 + oi)}.</span>
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {q.type === 'true_false' && (
              <div className="flex gap-3">
                {['True', 'False'].map(opt => (
                  <button key={opt} onClick={() => setAnswers(a => ({ ...a, [q._id]: opt }))}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all
                      ${answers[q._id] === opt
                        ? 'border-primary-500/50 bg-primary-500/10 text-white'
                        : 'border-white/[0.07] text-[#8888aa] hover:border-white/20'
                      }`}>
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {q.type === 'short_answer' && (
              <input type="text" value={answers[q._id] || ''}
                onChange={e => setAnswers(a => ({ ...a, [q._id]: e.target.value }))}
                className="input text-sm" placeholder="Type your answer..." />
            )}
          </div>
        ))}
      </div>

      <button onClick={handleSubmit} disabled={submitMutation.isPending || answered === 0}
        className="btn-primary w-full py-3 text-base">
        {submitMutation.isPending ? 'Submitting...' : `Submit Quiz (${answered}/${total} answered)`}
      </button>
    </div>
  )
}
