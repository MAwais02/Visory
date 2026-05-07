import { useEffect, useMemo, useRef, useState } from 'react'
import { matchPath, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MessageCircle, X, Send, Sparkles } from 'lucide-react'
import api from '../../utils/api'

const buildCourseMatch = (pathname) =>
  matchPath({ path: '/courses/:id/*' }, pathname) || matchPath({ path: '/courses/:id' }, pathname)

export default function CourseChatWidget() {
  const location = useLocation()
  const match = useMemo(() => buildCourseMatch(location.pathname), [location.pathname])
  const courseId = match?.params?.id

  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I’m here to help — ask me anything.',
    },
  ])
  const [isSending, setIsSending] = useState(false)

  const { data: courseData } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => api.get(`/courses/${courseId}`).then((r) => r.data),
    enabled: Boolean(courseId) && isOpen,
  })

  const courseTitle = courseData?.course?.title

  const listRef = useRef(null)
  useEffect(() => {
    if (!isOpen) return
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [isOpen, messages.length])

  const prevCourseIdRef = useRef(courseId)
  useEffect(() => {
    if (prevCourseIdRef.current === courseId) return
    prevCourseIdRef.current = courseId

    if (!courseId) return

    setIsOpen(false)
    setInput('')
    setMessages([
      {
        role: 'assistant',
        content: 'Hi! Ask me anything about this course — I’ll help you clear your doubts.',
      },
    ])
  }, [courseId])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isSending) return

    const nextMessages = [...messages, { role: 'user', content: text }]
    setMessages(nextMessages)
    setInput('')
    setIsSending(true)

    try {
      const endpoint = courseId ? `/courses/${courseId}/chat` : '/chat'
      const { data } = await api.post(endpoint, {
        message: text,
        messages: nextMessages.slice(-12),
      })
      setMessages((prev) => [...prev, { role: 'assistant', content: data?.answer || 'Sorry — I could not answer that.' }])
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: e?.response?.data?.error || 'Chat failed. Please try again.' },
      ])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/30 text-white flex items-center justify-center hover:opacity-95 transition-opacity"
          aria-label="Open chatbot"
          title="Ask a doubt"
        >
          <MessageCircle size={22} />
        </button>
      ) : (
        <div className="w-[340px] max-w-[calc(100vw-3rem)] h-[460px] max-h-[calc(100vh-6rem)] rounded-2xl border border-white/[0.08] bg-[#131320] shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/[0.07] flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-white font-semibold flex items-center gap-2">
                <Sparkles size={14} className="text-primary-400" /> {courseId ? 'Course Chat' : 'Visory Chat'}
              </p>
              <p className="text-[11px] text-[#8e8eb0] mt-0.5 truncate">
                {courseId ? (courseTitle || 'Ask your doubt') : 'Ask a question'}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#8888aa] hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all"
              aria-label="Close chatbot"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed border ${
                    m.role === 'user'
                      ? 'bg-primary-500/15 border-primary-500/25 text-white'
                      : 'bg-white/[0.03] border-white/[0.07] text-[#e8e8f0]'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl px-3 py-2 text-sm border bg-white/[0.03] border-white/[0.07] text-[#cfcfe6]">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="p-3 border-t border-white/[0.07]">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendMessage()
                }}
                placeholder={courseId ? 'Type your doubt...' : 'Type a message...'}
                className="input flex-1"
                disabled={isSending}
              />
              <button
                onClick={sendMessage}
                disabled={isSending || !input.trim()}
                className="btn-primary px-3 py-2 flex items-center gap-2"
                aria-label="Send message"
              >
                <Send size={14} />
              </button>
            </div>
            <p className="text-[10px] text-[#7f7fa1] mt-2">
              Tip: Ask “Explain simply” or “Give an example”.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

