import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Eye, Pencil, Search } from 'lucide-react'
import { api } from '../api/client'
import { useAuthStore } from '../stores/authStore'

const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT']

type Payment = {
  reference: string
  student: string
  amount: number
  method: string
  status: string
  date: string
}

export default function AdminPayments() {
  const { user } = useAuthStore()
  const canAccess = adminRoles.includes(user?.role || '')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [methodFilter, setMethodFilter] = useState('')
  const [page, setPage] = useState(1)

  const query = useQuery({
    queryKey: ['admin-payments', search, statusFilter, methodFilter, page],
    queryFn: async () => (await api.get('/v1/payments', { params: { page, limit: 20, search, status: statusFilter || undefined, method: methodFilter || undefined } })).data,
    enabled: canAccess,
  })

  if (!canAccess) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-red-700">You do not have permission to view this page.</p>
      </div>
    )
  }

  const payments = (query.data?.data?.records as Payment[]) ?? []
  const pagination = query.data?.data?.pagination ?? { page: 1, totalPages: 1 }

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-sm text-[#69736c]">Management</p>
          <h2 className="mt-1 font-display text-4xl">Payments</h2>
        </div>
      </div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#69736c]" />
          <input
            className="border border-[#d8d9d0] bg-transparent pl-9 pr-3 py-2 text-sm outline-none focus:border-forest"
            placeholder="Search payments..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          className="border border-[#d8d9d0] bg-transparent px-3 py-2 text-sm outline-none focus:border-forest"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
        >
          <option value="">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Failed">Failed</option>
        </select>
        <select
          className="border border-[#d8d9d0] bg-transparent px-3 py-2 text-sm outline-none focus:border-forest"
          value={methodFilter}
          onChange={(e) => { setMethodFilter(e.target.value); setPage(1) }}
        >
          <option value="">All methods</option>
          <option value="Card">Card</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Cash">Cash</option>
        </select>
      </div>
      <div className="overflow-x-auto border border-[#d8d9d0] bg-white/40">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#e5e9dd] text-[#69736c]">
            <tr>
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Method</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d8d9d0]">
            {query.isLoading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-[#69736c]">Loading payments...</td></tr>
            ) : query.isError ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-red-700">Unable to load payments.</td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-[#69736c]">No payments found.</td></tr>
            ) : (
              payments.map((item, idx) => (
                <tr key={item.reference ?? idx}>
                  <td className="px-4 py-3">{item.reference}</td>
                  <td className="px-4 py-3">{item.student}</td>
                  <td className="px-4 py-3">{item.amount}</td>
                  <td className="px-4 py-3">{item.method}</td>
                  <td className="px-4 py-3">
                    <span className="bg-[#e5e9dd] px-2 py-1 text-[10px] uppercase tracking-wider text-forest">{item.status}</span>
                  </td>
                  <td className="px-4 py-3">{new Date(item.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 hover:text-forest" aria-label="View payment"><Eye size={16} /></button>
                      <button className="p-1.5 hover:text-forest" aria-label="Edit payment"><Pencil size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {!query.isLoading && !query.isError && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <button className="border border-[#d8d9d0] px-3 py-2 text-xs disabled:opacity-50" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span className="text-xs text-[#69736c]">Page {pagination.page} of {pagination.totalPages}</span>
          <button className="border border-[#d8d9d0] px-3 py-2 text-xs disabled:opacity-50" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  )
}
