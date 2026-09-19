import { useQuery } from '@tanstack/react-query'
import { Users, UserCheck, ClipboardList, IndianRupee, Receipt } from 'lucide-react'
import { api } from '../api/client'
import { useAuthStore } from '../stores/authStore'

const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const canAccess = adminRoles.includes(user?.role || '')

  const students = useQuery({ queryKey: ['admin-students-count'], queryFn: async () => (await api.get('/v1/students?limit=1')).data, enabled: canAccess })
  const staff = useQuery({ queryKey: ['admin-staff-count'], queryFn: async () => (await api.get('/v1/staff?limit=1')).data, enabled: canAccess })
  const admissions = useQuery({ queryKey: ['admin-admissions-count'], queryFn: async () => (await api.get('/v1/admissions?limit=1')).data, enabled: canAccess })
  const payments = useQuery({ queryKey: ['admin-payments-revenue'], queryFn: async () => (await api.get('/v1/payments')).data, enabled: canAccess })
  const events = useQuery({ queryKey: ['admin-events'], queryFn: async () => (await api.get('/v1/content/events?limit=5')).data, enabled: canAccess })

  if (!canAccess) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-red-700">You do not have permission to view this page.</p>
      </div>
    )
  }

  const stats = [
    { label: 'Total Students', value: students.data?.pagination?.total ?? '--', Icon: Users },
    { label: 'Total Staff', value: staff.data?.pagination?.total ?? '--', Icon: UserCheck },
    { label: 'Pending Admissions', value: admissions.data?.pagination?.total ?? '--', Icon: ClipboardList },
    { label: 'Total Revenue', value: '--', Icon: IndianRupee },
    { label: 'Upcoming Events', value: events.data?.data?.length ?? '--', Icon: Receipt },
    { label: 'Recent Payments', value: payments.data?.data?.records?.length ?? '--', Icon: Receipt },
  ]

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-sm text-[#69736c]">Overview</p>
          <h2 className="mt-1 font-display text-4xl">Dashboard</h2>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(({ label, value, Icon }) => (
          <article key={label} className="border border-[#d8d9d0] bg-white/40 p-5">
            <div className="mb-8 flex items-start justify-between">
              <span className="text-sm text-[#69736c]">{label}</span>
              <Icon size={18} className="text-forest" />
            </div>
            <strong className="font-display text-4xl">{value}</strong>
            <p className="mt-2 text-xs text-[#69736c]">Updated just now</p>
          </article>
        ))}
      </div>
    </div>
  )
}
