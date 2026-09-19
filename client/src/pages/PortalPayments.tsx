import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

type Payment = { id: string; amount: number; status: string; method?: string; paidAt?: string; description?: string }

export default function PortalPayments() {
  const { data } = useQuery({ queryKey: ['payments', 'mine'], queryFn: async () => (await api.get('/v1/payments/me')).data })
  return (
    <div>
      <h2 className="font-display text-4xl">Payments</h2>
      <p className="mt-2 text-sm text-[#69736c]">View your payment history and outstanding balances.</p>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[600px] border border-[#d8d9d0] bg-white/40 text-left text-sm">
          <thead className="border-b border-[#d8d9d0] text-[10px] uppercase tracking-wider text-[#69736c]">
            <tr><th className="px-4 py-3">Description</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th></tr>
          </thead>
          <tbody>
            {data?.data?.map((p: Payment) => (
              <tr key={p.id} className="border-b border-[#d8d9d0] last:border-0">
                <td className="px-4 py-3">{p.description || 'Fee payment'}</td>
                <td className="px-4 py-3 font-medium">₦{p.amount?.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-[#69736c]">{p.method || '—'}</td>
                <td className="px-4 py-3 text-xs text-[#69736c]">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3"><span className={`rounded px-2 py-1 text-[10px] uppercase tracking-wider ${p.status === 'PAID' ? 'bg-[#e5e9dd] text-forest' : 'bg-sun/20 text-ink'}`}>{p.status}</span></td>
              </tr>
            ))}
            {!data?.data?.length && (<tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-[#69736c]">No payment records yet.</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  )
}
