import { useQuery } from '@tanstack/react-query'
import { Bell, CalendarDays, ClipboardList, Users } from 'lucide-react'
import { api } from '../api/client'
import { useAuthStore } from '../stores/authStore'
import { useTheme } from '../hooks/useTheme'
import { StudentIdCard } from '../components/StudentDocuments'

export default function PortalDashboard() {
  const { user } = useAuthStore()
  const { resolved } = useTheme()
  const isDark = resolved === 'dark'
  const canReview = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'ADMISSION_OFFICER'].includes(user?.role || '')
  const students = useQuery({ queryKey: ['students', 'dashboard'], queryFn: async () => (await api.get('/v1/students?limit=5')).data, enabled: canReview })
  const admissions = useQuery({ queryKey: ['admissions', 'dashboard'], queryFn: async () => (await api.get('/v1/admissions?limit=5')).data, enabled: canReview })
  const notifications = useQuery({ queryKey: ['notifications'], queryFn: async () => (await api.get('/v1/notifications')).data })
  const ownedStudents = useQuery({ queryKey: ['students', 'owned'], queryFn: async () => (await api.get('/v1/students/me')).data })

  const stats = [
    ['Active students', students.data?.pagination?.total ?? '--', Users],
    ['Pending admissions', admissions.data?.pagination?.total ?? '--', ClipboardList],
    ['Upcoming events', '08', CalendarDays],
    ['Notifications', notifications.data?.data?.filter((item: { readAt?: string }) => !item.readAt).length ?? '--', Bell],
  ] as const

  return <div>
    <div className="mb-8 flex items-end justify-between"><div><p className={`text-sm ${isDark ? 'text-[#a3b0a5]' : 'text-[#69736c]'}`}>Friday, 21 August 2026</p><h2 className="mt-1 font-display text-4xl">Your school at a glance.</h2></div><span className={`hidden items-center gap-2 border px-3 py-2 text-xs uppercase tracking-[.08em] sm:flex ${isDark ? 'border-[#3a4b43] text-[#a3b0a5]' : 'border-[#d8d9d0] text-[#69736c]'}`}><span className="text-forest">🔒</span> {user?.role || 'User'}</span></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([label, value, Icon]) => <article className={`border p-5 ${isDark ? 'border-[#3a4b43] bg-[#22322c]' : 'border-[#d8d9d0] bg-white/40'}`} key={label}><div className="mb-8 flex items-start justify-between"><span className={`text-sm ${isDark ? 'text-[#a3b0a5]' : 'text-[#69736c]'}`}>{label}</span><Icon size={18} className="text-forest" /></div><strong className="font-display text-4xl">{value}</strong><p className={`mt-2 text-xs ${isDark ? 'text-[#a3b0a5]' : 'text-[#69736c]'}`}>Updated just now</p></article>)}</div>
    <div className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_1fr]"><section className={`border p-6 ${isDark ? 'border-[#3a4b43] bg-[#22322c]' : 'border-[#d8d9d0] bg-white/40'}`}><div className="mb-6 flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[.15em] text-forest">Recent activity</p><h3 className="mt-1 font-display text-2xl">Students</h3></div></div>{!canReview ? <p className={`py-8 text-sm ${isDark ? 'text-[#a3b0a5]' : 'text-[#69736c]'}`}>Your personal student updates will appear here.</p> : students.isLoading ? <p className={`py-8 text-sm ${isDark ? 'text-[#a3b0a5]' : 'text-[#69736c]'}`}>Loading students...</p> : students.isError ? <p className={`py-8 text-sm text-red-700`}>Unable to load student data.</p> : <div className={`divide-y ${isDark ? 'divide-[#3a4b43]' : 'divide-[#d8d9d0]'}`}>{students.data?.data?.map((student: { studentId: string; fullName: string; status: string }) => <div className="flex items-center justify-between py-3" key={student.studentId}><div><p className="text-sm font-medium">{student.fullName}</p><p className={`text-xs ${isDark ? 'text-[#a3b0a5]' : 'text-[#69736c]'}`}>{student.studentId}</p></div><span className={`px-2 py-1 text-[10px] uppercase tracking-wider ${isDark ? 'bg-[#22322c] text-[#5cb88a]' : 'bg-[#e5e9dd] text-forest'}`}>{student.status}</span></div>)}</div>}</section>
      <section className={`bg-forest p-6 text-white`}><p className="text-[10px] uppercase tracking-[.15em] text-sun">Next on campus</p><h3 className="mt-2 font-display text-3xl">A community that keeps moving.</h3><p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">Stay close to the moments, people, and opportunities that make Northbridge feel like home.</p><div className="mt-10 border-t border-white/20 pt-4 text-xs text-white/70"><span className="flex items-center gap-2"><CalendarDays size={15} className="text-sun" /> Parent community breakfast</span><strong className="mt-2 block text-white">Saturday, 29 August · 09:00</strong></div></section>
    </div>{ownedStudents.data?.data?.map((student: any) => <div className="mt-8 max-w-xl" key={student.studentId}><StudentIdCard student={student} /></div>)}
  </div>
}
