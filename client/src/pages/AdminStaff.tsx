import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Eye, Pencil, Search } from 'lucide-react'
import { api } from '../api/client'
import { useAuthStore } from '../stores/authStore'

const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']

type Staff = {
  _id: string
  staffId: string
  fullName: string
  position: string
  department: string
  status: string
}

export default function AdminStaff() {
  const { user } = useAuthStore()
  const canAccess = adminRoles.includes(user?.role || '')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const query = useQuery({
    queryKey: ['admin-staff', search, statusFilter, page],
    queryFn: async () => (await api.get('/v1/staff', { params: { page, limit: 20, search, status: statusFilter || undefined } })).data,
    enabled: canAccess,
  })

  if (!canAccess) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-red-700">You do not have permission to view this page.</p>
      </div>
    )
  }

  const staff = (query.data?.data as Staff[]) ?? []
  const pagination = query.data?.pagination ?? { page: 1, totalPages: 1 }

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-sm text-[#69736c]">Management</p>
          <h2 className="mt-1 font-display text-4xl">Staff</h2>
        </div>
      </div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#69736c]" />
          <input
            className="border border-[#d8d9d0] bg-transparent pl-9 pr-3 py-2 text-sm outline-none focus:border-forest"
            placeholder="Search staff..."
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
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="on_leave">On Leave</option>
        </select>
      </div>
      <div className="overflow-x-auto border border-[#d8d9d0] bg-white/40">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#e5e9dd] text-[#69736c]">
            <tr>
              <th className="px-4 py-3 font-medium">Staff ID</th>
              <th className="px-4 py-3 font-medium">Full Name</th>
              <th className="px-4 py-3 font-medium">Position</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d8d9d0]">
            {query.isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-[#69736c]">Loading staff...</td></tr>
            ) : query.isError ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-red-700">Unable to load staff.</td></tr>
            ) : staff.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-[#69736c]">No staff found.</td></tr>
            ) : (
              staff.map((item) => (
                <tr key={item._id}>
                  <td className="px-4 py-3">{item.staffId}</td>
                  <td className="px-4 py-3">{item.fullName}</td>
                  <td className="px-4 py-3">{item.position}</td>
                  <td className="px-4 py-3">{item.department}</td>
                  <td className="px-4 py-3">
                    <span className="bg-[#e5e9dd] px-2 py-1 text-[10px] uppercase tracking-wider text-forest">{item.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 hover:text-forest" aria-label="View staff"><Eye size={16} /></button>
                      <button className="p-1.5 hover:text-forest" aria-label="Edit staff"><Pencil size={16} /></button>
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
