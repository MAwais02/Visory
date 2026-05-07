import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ExternalLink, BookOpen, Video, Clock3 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'

const platformColors = {
  YouTube: 'text-red-400',
  Coursera: 'text-blue-400',
  Udemy: 'text-purple-400',
  Medium: 'text-green-400',
  GitHub: 'text-[#e8e8f0]',
  Other: 'text-[#8888aa]',
}

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null

  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace('www.', '')

    let videoId = null
    if (host === 'youtu.be') {
      videoId = parsed.pathname.replace('/', '')
    } else if (host.includes('youtube.com')) {
      if (parsed.searchParams.get('v')) {
        videoId = parsed.searchParams.get('v')
      } else if (parsed.pathname.startsWith('/shorts/')) {
        videoId = parsed.pathname.split('/shorts/')[1]?.split('/')[0]
      } else if (parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.split('/embed/')[1]?.split('/')[0]
      }
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  } catch {
    return null
  }
}

export default function CourseResourcesPage() {
  const { id, topicIndex } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const selectedTopicIndex = Number(topicIndex)
  const [activeSubtopicIndex, setActiveSubtopicIndex] = useState(0)
  const [generatingSubtopicIndex, setGeneratingSubtopicIndex] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => api.get(`/courses/${id}`).then((r) => r.data),
  })

  const loadResourcesMutation = useMutation({
    mutationFn: (subtopicIdx) => api.post(`/courses/${id}/topics/${selectedTopicIndex}/resources`, {
      subtopicIndex: subtopicIdx,
    }),
    onMutate: (subtopicIdx) => {
      setGeneratingSubtopicIndex(subtopicIdx)
    },
    onSuccess: async () => {
      await qc.invalidateQueries(['course', id])
      toast.success('Resources loaded for selected subtopic')
    },
    onError: () => {
      toast.error('Failed to load resources')
    },
    onSettled: () => {
      setGeneratingSubtopicIndex(null)
    },
  })

  const course = data?.course
  const topic = course?.topics?.[selectedTopicIndex]
  const selectedSubtopic = topic?.subtopics?.[activeSubtopicIndex]
  const selectedSubtopicResources = selectedSubtopic?.resources || []
  const selectedVideo = selectedSubtopicResources.find((resource) => resource.platform === 'YouTube')
  const selectedCourseLinks = selectedSubtopicResources.filter((resource) => resource.platform === 'Udemy' || resource.platform === 'Coursera')
  const selectedVideoEmbedUrl = getYouTubeEmbedUrl(selectedVideo?.url)

  useEffect(() => {
    if (!topic?.subtopics?.length) return
    if (activeSubtopicIndex > topic.subtopics.length - 1) {
      setActiveSubtopicIndex(0)
    }
  }, [course, topic, selectedTopicIndex, activeSubtopicIndex])

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse max-w-5xl">
        <div className="h-8 w-56 bg-white/5 rounded-xl" />
        <div className="h-40 bg-white/5 rounded-2xl" />
        <div className="h-40 bg-white/5 rounded-2xl" />
      </div>
    )
  }

  if (!course || !topic) {
    return <div className="text-center py-20 text-[#8888aa]">Topic not found.</div>
  }

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      <div>
        <div>
          <Link to={`/courses/${id}`} className="inline-flex items-center gap-1 text-sm text-[#8888aa] hover:text-white">
            <ArrowLeft size={14} />
            Back to course
          </Link>
          <h1 className="text-2xl font-bold text-white mt-2">{topic.title}</h1>
          <p className="text-sm text-[#8888aa] mt-1">
            Topic detail page with subtopics, simple explanations, and focused learning resources.
          </p>
        </div>
      </div>

      {course.topics?.length > 1 && (
        <section className="space-y-2">
          <h2 className="text-white font-semibold text-sm">Select Topic</h2>
          <div className="flex flex-wrap gap-2">
            {course.topics.map((topicItem, idx) => (
              <button
                key={topicItem._id || idx}
                onClick={() => navigate(`/courses/${id}/topics/${idx}`)}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                  idx === selectedTopicIndex
                    ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                    : 'bg-white/5 text-[#b9b9d2] border border-white/10 hover:text-white'
                }`}
              >
                {idx + 1}. {topicItem.title}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="card p-4 space-y-2">
        <h2 className="text-white font-semibold text-sm">Simple Explanation</h2>
        <p className="text-sm text-[#c7c7dd]">
          {topic.description || `This topic helps you understand ${topic.title} step by step in a practical way.`}
        </p>
        {topic.subtopics?.length > 0 && (
          <p className="text-xs text-[#8888aa]">
            You will mainly cover: {topic.subtopics.slice(0, 3).map((sub) => sub.title).join(', ')}.
          </p>
        )}
      </section>

      <section className="grid lg:grid-cols-[280px,1fr] gap-4 items-start">
        <aside className="card p-3 space-y-1 sticky top-4">
          <h2 className="text-sm font-semibold text-white px-2 pb-1">Subtopics</h2>
          {topic.subtopics?.map((subtopic, idx) => (
            <button
              key={subtopic._id || idx}
              onClick={() => setActiveSubtopicIndex(idx)}
              className={`w-full text-left rounded-xl p-3 transition-colors border ${
                idx === activeSubtopicIndex
                  ? 'bg-primary-500/15 border-primary-500/30'
                  : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
              }`}
            >
              <p className="text-sm font-medium text-white">{idx + 1}. {subtopic.title}</p>
              <p className="text-xs text-[#9393b3] mt-1 line-clamp-2">{subtopic.description}</p>
              <p className="text-[11px] text-[#7e7e9f] mt-1 flex items-center gap-1">
                <Clock3 size={11} /> ~{subtopic.estimatedHours || 1}h
              </p>
              <div className="mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveSubtopicIndex(idx)
                    loadResourcesMutation.mutate(idx)
                  }}
                  disabled={loadResourcesMutation.isPending}
                  className="btn-ghost text-[11px] py-1 px-2 inline-flex items-center gap-1"
                >
                  {(loadResourcesMutation.isPending && generatingSubtopicIndex === idx)
                    ? <><div className="w-2.5 h-2.5 border border-white/30 border-t-white rounded-full animate-spin" /> Loading...</>
                    : <><BookOpen size={11} /> Generate</>
                  }
                </button>
              </div>
            </button>
          ))}
        </aside>

        <div className="space-y-4">
          <div className="card p-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-white font-semibold">What is {selectedSubtopic?.title}?</h2>
                <p className="text-sm text-[#c7c7dd] mt-1">
                  {selectedSubtopic?.description || `This part teaches ${selectedSubtopic?.title} in simple language with practical examples.`}
                </p>
              </div>
              <button
                onClick={() => loadResourcesMutation.mutate(activeSubtopicIndex)}
                disabled={loadResourcesMutation.isPending}
                className="btn-primary text-xs inline-flex items-center gap-1.5 py-2 flex-shrink-0"
              >
                {(loadResourcesMutation.isPending && generatingSubtopicIndex === activeSubtopicIndex)
                  ? <><div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> Loading...</>
                  : <><BookOpen size={13} /> Load Resources</>
                }
              </button>
            </div>
          </div>

          {!selectedSubtopicResources.length && (
            <div className="card p-6 text-sm text-[#8888aa]">
              No resources loaded for this subtopic yet. Click "Load Resources" above.
            </div>
          )}

          {selectedVideo && selectedVideoEmbedUrl && (
            <article className="card overflow-hidden">
              <div className="p-4 pb-2">
                <p className="text-white font-medium">{selectedVideo.title}</p>
                <p className="text-xs text-[#8888aa] mt-1">
                  {selectedVideo.channelName || 'YouTube'}{selectedVideo.publishedDate ? ` · ${new Date(selectedVideo.publishedDate).toLocaleDateString()}` : ''}
                </p>
              </div>
              <div className="aspect-video bg-black">
                <iframe
                  src={selectedVideoEmbedUrl}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </article>
          )}

          {selectedCourseLinks.length > 0 && (
            <article className="card p-4 space-y-2">
              <h3 className="text-sm font-semibold text-white">Course Links</h3>
              {selectedCourseLinks.map((resource, ri) => (
                <a
                  key={`${resource.url}-${ri}`}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary-300 hover:text-primary-200"
                >
                  <span className={`${platformColors[resource.platform] || 'text-[#8888aa]'} font-medium`}>
                    [{resource.platform}]
                  </span>
                  <span className="truncate">{resource.title}</span>
                  <ExternalLink size={12} />
                </a>
              ))}
            </article>
          )}
        </div>
      </section>
    </div>
  )
}
