import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

export default function ParentFees() {
  const { data } = useQuery({ queryKey: ['fees', 'mine'], queryFn: async () => (await api.get('/v1/payments/me')).data })
  return (
    <div>
      <h2 className="font-display text-4xl">Fees</h2>
      <p className="mt-2 text-sm text-[#69736c]">Track fee payments and outstanding balances.</p>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[500px] border border-[#d8d9d0] bg-white/40 text-left text-sm">
          <thead className="border-b border-[#d8d9d0] text-[10px] uppercase tracking-wider text-[#69736c]">
            <tr><th className="px-4 py-3">Description</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Due date</th></tr>
          </thead>
          <tbody>
            {data?.data?.map((p: any) => (
              <tr key={p.id} className="border-b border-[#d8d9d0] last:border-0">
                <td className="px-4 py-3">{p.description || 'Fee payment'}</td>
                <td className="px-4 py-3 font-medium">₦{p.amount?.toLocaleString()}</td>
                <td className="px-4 py-3"><span className={`rounded px-2 py-1 text-[10px] uppercase tracking-wider ${p.status === 'PAID' ? 'bg-[#e5e9dd] text-forest' : 'bg-sun/20 text-ink'}`}>{p.status}</span></td>
                <td className="px-4 py-3 text-xs text-[#69736c]">{p.dueDate ? new Date(p.dueDate).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
            {!data?.data?.length && <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-[#69736c]">No fee records found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
