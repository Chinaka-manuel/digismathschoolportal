import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

export default function StaffStudents() {
  const { data, isLoading } = useQuery({ queryKey: ['staff', 'students'], queryFn: async () => (await api.get('/v1/students?limit=50')).data })
  return (
    <div>
      <h2 className="font-display text-4xl">Students</h2>
      <p className="mt-2 text-sm text-[#69736c]">View students in your classes.</p>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[500px] border border-[#d8d9d0] bg-white/40 text-left text-sm">
          <thead className="border-b border-[#d8d9d0] text-[10px] uppercase tracking-wider text-[#69736c]">
            <tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Class</th><th className="px-4 py-3">Status</th></tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={4} className="px-4 py-8 text-center text-[#69736c]">Loading…</td></tr> : data?.data?.map((s: any) => (
              <tr key={s.studentId} className="border-b border-[#d8d9d0] last:border-0">
                <td className="px-4 py-3 text-xs">{s.studentId}</td>
                <td className="px-4 py-3 font-medium">{s.fullName}</td>
                <td className="px-4 py-3 text-xs">{s.classRef?.name || '—'}</td>
                <td className="px-4 py-3"><span className="bg-[#e5e9dd] px-2 py-1 text-[10px] uppercase tracking-wider text-forest">{s.status}</span></td>
              </tr>
            ))}
            {!isLoading && !data?.data?.length && <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-[#69736c]">No students found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
