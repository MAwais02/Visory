// ============================================================
// BookmarksPage.jsx — 4.2.11
// ============================================================
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bookmark, Trash2, ExternalLink, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'

export default function BookmarksPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => api.get('/bookmarks').then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/bookmarks/${id}`),
    onSuccess: () => { qc.invalidateQueries(['bookmarks']); toast.success('Bookmark removed') },
  })

  const bookmarks = data?.bookmarks || []

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bookmark size={22} className="text-primary-400" /> Bookmarks
        </h1>
        <p className="text-[#8888aa] text-sm mt-0.5">{bookmarks.length} saved resource{bookmarks.length !== 1 ? 's' : ''}</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 shimmer rounded-2xl" />)}
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="card p-16 text-center">
          <Bookmark size={40} className="text-[#8888aa] mx-auto mb-3" />
          <p className="text-white font-medium">No bookmarks yet</p>
          <p className="text-[#8888aa] text-sm mt-1">Bookmark resources from course pages</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {bookmarks.map(bm => (
            <div key={bm._id} className="card p-4 hover:border-white/[0.14] transition-all group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <a href={bm.resource?.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-white font-medium text-sm group-hover:text-primary-400 transition-colors">
                    {bm.resource?.title} <ExternalLink size={11} className="flex-shrink-0" />
                  </a>
                  <p className="text-xs text-[#8888aa] mt-0.5">{bm.resource?.platform} · {bm.resource?.type}</p>
                  {bm.personalNote && (
                    <p className="text-xs text-[#8888aa] mt-2 italic border-l-2 border-primary-500/30 pl-2">{bm.personalNote}</p>
                  )}
                  {bm.tags?.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <Tag size={10} className="text-[#8888aa]" />
                      {bm.tags.map(t => (
                        <span key={t} className="px-2 py-0.5 bg-primary-500/10 text-primary-300 rounded-full text-[10px]">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => deleteMutation.mutate(bm._id)}
                  className="text-[#8888aa] hover:text-red-400 transition-colors p-1 flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
