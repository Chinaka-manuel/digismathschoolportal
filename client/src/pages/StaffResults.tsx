import { useQuery } from '@tanstack/react-query'
import { ClipboardList } from 'lucide-react'
import { api } from '../api/client'
import { ResultSheet } from '../components/StudentDocuments'

export default function StaffResults() {
  const { data } = useQuery({ queryKey: ['staff', 'results'], queryFn: async () => (await api.get('/v1/results')).data })
  return (
    <div>
      <h2 className="font-display text-4xl">Results</h2>
      <p className="mt-2 text-sm text-[#69736c]">Enter and review student results.</p>
      <div className="mt-8 grid gap-6">
        {data?.data?.map((r: any) => (
          <ResultSheet key={r.id} student={r.student} result={r} />
        ))}
        {!data?.data?.length && (
          <div className="flex flex-col items-center gap-3 border border-dashed border-[#d8d9d0] p-10 text-center text-[#69736c]">
            <ClipboardList size={28} />
            <p className="text-sm">No results entered yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
