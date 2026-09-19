import { useQuery } from '@tanstack/react-query'
import { Users } from 'lucide-react'
import { api } from '../api/client'
import { StudentIdCard } from '../components/StudentDocuments'

export default function ParentChildren() {
  const { data } = useQuery({ queryKey: ['children'], queryFn: async () => (await api.get('/v1/parents/children')).data })
  return (
    <div>
      <h2 className="font-display text-4xl">My children</h2>
      <p className="mt-2 text-sm text-[#69736c]">Overview of your children's profiles.</p>
      <div className="mt-8 space-y-6">
        {data?.data?.map((child: any) => (
          <StudentIdCard key={child.studentId} student={child} />
        ))}
        {!data?.data?.length && (
          <div className="flex flex-col items-center gap-3 border border-dashed border-[#d8d9d0] p-10 text-center text-[#69736c]">
            <Users size={28} />
            <p className="text-sm">No children linked to your account yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
