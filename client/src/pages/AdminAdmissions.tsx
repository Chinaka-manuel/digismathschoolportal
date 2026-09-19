import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Eye, Pencil, Search, X } from 'lucide-react'
import { api } from '../api/client'
import { useAuthStore } from '../stores/authStore'

const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'ADMISSION_OFFICER']

type Admission = {
  _id: string
  applicationNumber: string
  applicantName: string
  email: string
  requestedClass: string
  status: string
}

export default function AdminAdmissions() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const canAccess = adminRoles.includes(user?.role || '')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const query = useQuery({
    queryKey: ['admin-admissions', search, statusFilter, page],
    queryFn: async () => (await api.get('/v1/admissions', { params: { page, limit: 20, search, status: statusFilter || undefined } })).data,
    enabled: canAccess,
  })

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => (await api.patch(`/v1/admissions/${id}/status`, { status })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-admissions'] })
    },
  })

  if (!canAccess) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-red-700">You do not have permission to view this page.</p>
      </div>
    )
  }

  const admissions = (query.data?.data as Admission[]) ?? []
  const pagination = query.data?.pagination ?? { page: 1, totalPages: 1 }

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-sm text-[#69736c]">Management</p>
          <h2 className="mt-1 font-display text-4xl">Admissions</h2>
        </div>
      </div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#69736c]" />
          <input
            className="border border-[#d8d9d0] bg-transparent pl-9 pr-3 py-2 text-sm outline-none focus:border-forest"
            placeholder="Search admissions..."
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
          <option value="Under Review">Under Review</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Waitlisted">Waitlisted</option>
        </select>
      </div>
      <div className="overflow-x-auto border border-[#d8d9d0] bg-white/40">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#e5e9dd] text-[#69736c]">
            <tr>
              <th className="px-4 py-3 font-medium">Application Number</th>
              <th className="px-4 py-3 font-medium">Applicant Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Requested Class</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d8d9d0]">
            {query.isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-[#69736c]">Loading admissions...</td></tr>
            ) : query.isError ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-red-700">Unable to load admissions.</td></tr>
            ) : admissions.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-[#69736c]">No admissions found.</td></tr>
            ) : (
              admissions.map((item) => (
                <tr key={item._id}>
                  <td className="px-4 py-3">{item.applicationNumber}</td>
                  <td className="px-4 py-3">{item.applicantName}</td>
                  <td className="px-4 py-3">{item.email}</td>
                  <td className="px-4 py-3">{item.requestedClass}</td>
                  <td className="px-4 py-3">
                    <span className="bg-[#e5e9dd] px-2 py-1 text-[10px] uppercase tracking-wider text-forest">{item.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.status !== 'Approved' && (
                        <button className="p-1.5 text-forest hover:text-forest/80" aria-label="Approve" onClick={() => updateStatus.mutate({ id: item._id, status: 'Approved' })}>
                          <Check size={16} />
                        </button>
                      )}
                      {item.status !== 'Rejected' && (
                        <button className="p-1.5 text-red-700 hover:text-red-800" aria-label="Reject" onClick={() => updateStatus.mutate({ id: item._id, status: 'Rejected' })}>
                          <X size={16} />
                        </button>
                      )}
                      <button className="p-1.5 hover:text-forest" aria-label="View admission"><Eye size={16} /></button>
                      <button className="p-1.5 hover:text-forest" aria-label="Edit admission"><Pencil size={16} /></button>
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
