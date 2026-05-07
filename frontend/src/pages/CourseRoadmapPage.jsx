import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle2, Circle, GitBranchPlus, ArrowUpRight } from 'lucide-react'
import api from '../utils/api'

export default function CourseRoadmapPage() {
  const { id } = useParams()

  const { data, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => api.get(`/courses/${id}`).then((r) => r.data),
  })

  const course = data?.course

  const roadmapNodes = useMemo(() => {
    if (!course?.topics) return []
    return course.topics.map((topic, idx) => ({
      id: topic._id || `topic-${idx}`,
      index: idx,
      title: topic.title,
      description: topic.description,
      difficulty: topic.difficultyLevel,
      subtopics: topic.subtopics || [],
      completed: Boolean(topic.isCompleted),
    }))
  }, [course])

  const activeTopicIndex = useMemo(() => {
    if (!roadmapNodes.length) return 0
    const firstPending = roadmapNodes.findIndex((node) => !node.completed)
    return firstPending === -1 ? roadmapNodes.length - 1 : firstPending
  }, [roadmapNodes])

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse max-w-6xl">
        <div className="h-8 w-64 bg-white/5 rounded-xl" />
        <div className="h-40 bg-white/5 rounded-2xl" />
        <div className="h-40 bg-white/5 rounded-2xl" />
      </div>
    )
  }

  if (!course) return <div className="text-center py-20 text-[#8888aa]">Course not found.</div>

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to={`/courses/${id}`} className="inline-flex items-center gap-1 text-sm text-[#8888aa] hover:text-white">
            <ArrowLeft size={14} />
            Back to course
          </Link>
          <h1 className="text-2xl font-bold text-white mt-2">{course.title} Roadmap</h1>
          <p className="text-sm text-[#8888aa] mt-1">Visual progression of topics, subtopics, and completion flow.</p>
        </div>
      </div>

      <div className="card p-4 overflow-x-auto">
        <div className="min-w-[1040px] space-y-6">
          {roadmapNodes.map((node, idx) => {
            const isCurrent = idx === activeTopicIndex && !node.completed
            const alignmentClass = idx % 2 === 0 ? 'justify-start' : 'justify-end'

            return (
              <div key={node.id} className="space-y-3">
                <div className={`flex ${alignmentClass}`}>
                  <article className={`w-[520px] rounded-2xl border p-4 ${
                    node.completed
                      ? 'border-green-400/40 bg-green-500/10'
                      : isCurrent
                        ? 'border-primary-400/40 bg-primary-500/10'
                        : 'border-white/10 bg-white/[0.03]'
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {node.completed
                          ? <CheckCircle2 size={18} className="text-green-300" />
                          : <Circle size={18} className={isCurrent ? 'text-primary-300' : 'text-[#8b8bad]'} />
                        }
                        <p className="text-white font-semibold">{idx + 1}. {node.title}</p>
                      </div>
                      <Link
                        to={`/courses/${id}/topics/${idx}`}
                        className="btn-ghost text-[11px] py-1 px-2 inline-flex items-center gap-1"
                      >
                        Open <ArrowUpRight size={11} />
                      </Link>
                    </div>
                    <p className="text-xs text-[#9c9cbe] mt-2">{node.description}</p>
                    <div className="mt-3">
                      <p className="text-[11px] text-[#8a8aac] mb-1.5 flex items-center gap-1">
                        <GitBranchPlus size={11} /> Subtopics
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {node.subtopics.map((sub, subIdx) => (
                          <span
                            key={sub._id || subIdx}
                            className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-[#d3d3ea]"
                          >
                            {subIdx + 1}. {sub.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                </div>

                {idx < roadmapNodes.length - 1 && (
                  <div className="flex justify-center">
                    <div className="h-10 w-0.5 bg-gradient-to-b from-primary-500/60 to-white/20 relative">
                      <div className="absolute -bottom-1.5 -left-[3px] w-0 h-0 border-x-[4px] border-x-transparent border-t-[6px] border-t-white/50" />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
