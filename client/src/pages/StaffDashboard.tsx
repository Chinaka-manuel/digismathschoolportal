import { CalendarDays, ClipboardList, Users } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

export default function StaffDashboard() {
  const classes = useQuery({ queryKey: ['staff', 'classes'], queryFn: async () => (await api.get('/v1/classes')).data })
  const students = useQuery({ queryKey: ['staff', 'students', 'count'], queryFn: async () => (await api.get('/v1/students?limit=1')).data })
  const attendance = useQuery({ queryKey: ['staff', 'attendance', 'today'], queryFn: async () => (await api.get('/v1/attendance/today')).data })
  const stats = [
    ['My classes', classes.data?.data?.length ?? '--', ClipboardList],
    ['My students', students.data?.pagination?.total ?? '--', Users],
    ['Today\'s attendance', attendance.data?.data?.length ?? '--', CalendarDays],
  ] as const
  return (
    <div>
      <h2 className="font-display text-4xl">Staff dashboard</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(([label, value, Icon]) => (
          <article className="border border-[#d8d9d0] bg-white/40 p-5" key={label}>
            <div className="mb-8 flex items-start justify-between"><span className="text-sm text-[#69736c]">{label}</span><Icon size={18} className="text-forest" /></div>
            <strong className="font-display text-4xl">{value}</strong>
          </article>
        ))}
      </div>
    </div>
  )
}
