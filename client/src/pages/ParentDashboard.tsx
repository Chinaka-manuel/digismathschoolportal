import { useQuery } from '@tanstack/react-query'
import { CalendarDays, ClipboardList, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuthStore } from '../stores/authStore'

export default function ParentDashboard() {
  const { user } = useAuthStore()
  const children = useQuery({ queryKey: ['children'], queryFn: async () => (await api.get('/v1/parents/children')).data })
  const notifications = useQuery({ queryKey: ['notifications'], queryFn: async () => (await api.get('/v1/notifications')).data })
  const stats = [
    ['My children', children.data?.data?.length ?? '--', Users],
    ['Notifications', notifications.data?.data?.filter((n: any) => !n.readAt).length ?? '--', ClipboardList],
    ['Upcoming events', '04', CalendarDays],
  ] as const
  return (
    <div>
      <h2 className="font-display text-4xl">Parent portal</h2>
      <p className="mt-2 text-sm text-[#69736c]">Welcome, {user?.name?.split(' ')[0]}.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(([label, value, Icon]) => (
          <article className="border border-[#d8d9d0] bg-white/40 p-5" key={label}>
            <div className="mb-8 flex items-start justify-between"><span className="text-sm text-[#69736c]">{label}</span><Icon size={18} className="text-forest" /></div>
            <strong className="font-display text-4xl">{value}</strong>
          </article>
        ))}
      </div>
      <div className="mt-8">
        <h3 className="font-display text-2xl">Your children</h3>
        <div className="mt-4 space-y-3">
          {children.data?.data?.map((child: any) => (
            <Link to="/parent/children" key={child.studentId} className="flex items-center gap-4 border border-[#d8d9d0] bg-white/40 p-4 hover:border-forest">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-forest text-white text-sm">{child.fullName?.[0] || 'S'}</span>
              <div><p className="text-sm font-medium">{child.fullName}</p><p className="text-xs text-[#69736c]">{child.classRef?.name || '—'} · {child.status}</p></div>
            </Link>
          ))}
          {!children.data?.data?.length && <p className="text-sm text-[#69736c]">No children linked to your account.</p>}
        </div>
      </div>
    </div>
  )
}
