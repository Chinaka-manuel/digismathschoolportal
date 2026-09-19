import { useQuery } from '@tanstack/react-query'
import { BookOpen } from 'lucide-react'
import { api } from '../api/client'

export default function StaffClasses() {
  const { data, isLoading } = useQuery({ queryKey: ['staff', 'classes'], queryFn: async () => (await api.get('/v1/classes')).data })
  return (
    <div>
      <h2 className="font-display text-4xl">My classes</h2>
      <p className="mt-2 text-sm text-[#69736c]">Classes assigned to you.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {isLoading ? <p className="text-sm text-[#69736c]">Loading…</p> : data?.data?.map((cls: any) => (
          <div key={cls.id} className="border border-[#d8d9d0] bg-white/40 p-6">
            <BookOpen size={20} className="text-forest" />
            <h3 className="mt-3 font-display text-2xl">{cls.name}</h3>
            <p className="mt-1 text-xs text-[#69736c]">{cls.section || ''} · {cls.studentCount ?? '—'} students</p>
          </div>
        ))}
        {!isLoading && !data?.data?.length && <p className="text-sm text-[#69736c]">No classes assigned.</p>}
      </div>
    </div>
  )
}
