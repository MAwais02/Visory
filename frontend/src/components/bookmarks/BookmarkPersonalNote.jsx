import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { StickyNote } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../utils/api'

/**
 * Personal note for an existing bookmark (PUT only — does not create/delete bookmarks).
 */
export default function BookmarkPersonalNote({ bookmark }) {
  const qc = useQueryClient()
  const [note, setNote] = useState(bookmark?.personalNote ?? '')

  useEffect(() => {
    setNote(bookmark?.personalNote ?? '')
  }, [bookmark?._id, bookmark?.personalNote])

  const saveMutation = useMutation({
    mutationFn: () => api.put(`/bookmarks/${bookmark._id}`, { personalNote: note }),
    onSuccess: async () => {
      await qc.invalidateQueries(['bookmarks'])
      toast.success('Note saved')
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Could not save note'),
  })

  if (!bookmark?._id) return null

  const unchanged = note === (bookmark.personalNote ?? '')

  return (
    <div className="mt-3 pt-3 border-t border-white/[0.08] space-y-1.5">
      <label className="text-[10px] font-medium uppercase tracking-wide text-[#8e8eb0] flex items-center gap-1">
        <StickyNote size={11} className="text-primary-400" aria-hidden />
        Your note
      </label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder="Private note (e.g. timestamp to revisit, key idea)…"
        className="input text-xs w-full resize-y min-h-[72px] py-2"
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-[#6e6e8a]">{note.length}/2000</span>
        <button
          type="button"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || unchanged}
          className="btn-primary text-xs py-1.5 px-3 disabled:opacity-40"
        >
          {saveMutation.isPending ? 'Saving…' : 'Save note'}
        </button>
      </div>
    </div>
  )
}
