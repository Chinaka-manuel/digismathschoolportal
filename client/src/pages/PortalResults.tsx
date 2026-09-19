import { useQuery } from '@tanstack/react-query'
import { ResultSheet } from '../components/StudentDocuments'
import { api } from '../api/client'
import { useAuthStore } from '../stores/authStore'

export default function PortalResults() {
  const { user } = useAuthStore()
  const { data } = useQuery({ queryKey: ['results', 'owned'], queryFn: async () => (await api.get('/v1/results/me')).data })
  return (
    <div>
      <h2 className="font-display text-4xl">Academic results</h2>
      <p className="mt-2 text-sm text-[#69736c]">Viewing results for {user?.name}</p>
      <div className="mt-8 grid gap-6">
        {data?.data?.map((result: any) => (
          <ResultSheet key={result.id} student={result.student} result={result} />
        ))}
        {!data?.data?.length && <p className="text-sm text-[#69736c]">No results available yet.</p>}
      </div>
    </div>
  )
}
