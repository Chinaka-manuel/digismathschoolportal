import { useQuery } from '@tanstack/react-query'
import { ResultSheet } from '../components/StudentDocuments'
import { api } from '../api/client'

export default function ParentResults() {
  const { data } = useQuery({ queryKey: ['children', 'results'], queryFn: async () => (await api.get('/v1/results/me')).data })
  return (
    <div>
      <h2 className="font-display text-4xl">Results</h2>
      <p className="mt-2 text-sm text-[#69736c]">Academic results for your children.</p>
      <div className="mt-8 grid gap-6">
        {data?.data?.map((r: any) => (
          <ResultSheet key={r.id} student={r.student} result={r} />
        ))}
        {!data?.data?.length && <p className="text-sm text-[#69736c]">No results available yet.</p>}
      </div>
    </div>
  )
}
