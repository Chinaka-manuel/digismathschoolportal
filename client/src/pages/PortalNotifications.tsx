import { useQuery } from '@tanstack/react-query'
import { Bell, Clock } from 'lucide-react'
import { api } from '../api/client'

export default function PortalNotifications() {
  const { data } = useQuery({ queryKey: ['notifications', 'mine'], queryFn: async () => (await api.get('/v1/notifications')).data })
  return (
    <div>
      <h2 className="font-display text-4xl">Notifications</h2>
      <p className="mt-2 text-sm text-[#69736c]">Stay up to date with school announcements.</p>
      <div className="mt-8 space-y-3">
        {data?.data?.map((note: { id: string; title: string; message: string; readAt?: string; createdAt: string }) => (
          <div key={note.id} className={`border border-[#d8d9d0] bg-white/40 p-5 ${note.readAt ? 'opacity-60' : 'border-l-4 border-l-forest'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2"><Bell size={16} className="text-forest" /><p className="text-sm font-medium">{note.title}</p></div>
              {!note.readAt && <span className="rounded bg-forest px-2 py-0.5 text-[10px] text-white">New</span>}
            </div>
            <p className="mt-2 text-sm text-[#69736c]">{note.message}</p>
            <p className="mt-2 flex items-center gap-1 text-xs text-[#69736c]"><Clock size={13} />{new Date(note.createdAt).toLocaleString()}</p>
          </div>
        ))}
        {!data?.data?.length && <p className="text-sm text-[#69736c]">No notifications right now.</p>}
      </div>
    </div>
  )
}
