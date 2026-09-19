import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

export default function StaffAttendance() {
  const { data, isLoading } = useQuery({ queryKey: ['staff', 'attendance'], queryFn: async () => (await api.get('/v1/attendance/today')).data })
  return (
    <div>
      <h2 className="font-display text-4xl">Attendance</h2>
      <p className="mt-2 text-sm text-[#69736c]">Take and review attendance for your classes.</p>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[500px] border border-[#d8d9d0] bg-white/40 text-left text-sm">
          <thead className="border-b border-[#d8d9d0] text-[10px] uppercase tracking-wider text-[#69736c]">
            <tr><th className="px-4 py-3">Student</th><th className="px-4 py-3">Class</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th></tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={4} className="px-4 py-8 text-center text-[#69736c]">Loading…</td></tr> : data?.data?.map((a: any) => (
              <tr key={a.id} className="border-b border-[#d8d9d0] last:border-0">
                <td className="px-4 py-3 font-medium">{a.student?.fullName || '—'}</td>
                <td className="px-4 py-3 text-xs">{a.classRef?.name || '—'}</td>
                <td className="px-4 py-3"><span className={`rounded px-2 py-1 text-[10px] uppercase tracking-wider ${a.status === 'PRESENT' ? 'bg-[#e5e9dd] text-forest' : 'bg-sun/20 text-ink'}`}>{a.status}</span></td>
                <td className="px-4 py-3 text-xs text-[#69736c]">{new Date(a.date).toLocaleDateString()}</td>
              </tr>
            ))}
            {!isLoading && !data?.data?.length && <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-[#69736c]">No attendance records yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
