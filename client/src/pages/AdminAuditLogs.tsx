import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { api } from '../api/client'
import { useAuthStore } from '../stores/authStore'

const adminRoles = ['SUPER_ADMIN', 'ADMIN']

type AuditLog = {
  _id: string
  user?: string
  role?: string
  action: string
  resource: string
  resourceId?: string
  ipAddress?: string
  createdAt: string
}

export default function AdminAuditLogs() {
  const { user } = useAuthStore()
  const canAccess = adminRoles.includes(user?.role || '')
  const [search, setSearch] = useState('')
  const [resourceFilter, setResourceFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [page, setPage] = useState(1)

  const query = useQuery({
    queryKey: ['admin-audit-logs', search, resourceFilter, actionFilter, page],
    queryFn: async () => (await api.get('/v1/audit-logs', { params: { page, limit: 20, search, resource: resourceFilter || undefined, action: actionFilter || undefined } })).data,
    enabled: canAccess,
  })

  if (!canAccess) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-red-700">You do not have permission to view this page.</p>
      </div>
    )
  }

  const logs = (query.data?.data as AuditLog[]) ?? []
  const pagination = query.data?.pagination ?? { page: 1, totalPages: 1 }

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-sm text-[#69736c]">Compliance</p>
          <h2 className="mt-1 font-display text-4xl">Audit Logs</h2>
        </div>
      </div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#69736c]" />
          <input
            className="border border-[#d8d9d0] bg-transparent pl-9 pr-3 py-2 text-sm outline-none focus:border-forest"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          className="border border-[#d8d9d0] bg-transparent px-3 py-2 text-sm outline-none focus:border-forest"
          value={resourceFilter}
          onChange={(e) => { setResourceFilter(e.target.value); setPage(1) }}
        >
          <option value="">All resources</option>
          <option value="Student">Student</option>
          <option value="Staff">Staff</option>
          <option value="Admission">Admission</option>
          <option value="Payment">Payment</option>
          <option value="Settings">Settings</option>
        </select>
        <select
          className="border border-[#d8d9d0] bg-transparent px-3 py-2 text-sm outline-none focus:border-forest"
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1) }}
        >
          <option value="">All actions</option>
          <option value="created">Created</option>
          <option value="updated">Updated</option>
          <option value="deleted">Deleted</option>
          <option value="accessed">Accessed</option>
        </select>
      </div>
      <div className="overflow-x-auto border border-[#d8d9d0] bg-white/40">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#e5e9dd] text-[#69736c]">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Resource</th>
              <th className="px-4 py-3 font-medium">Resource ID</th>
              <th className="px-4 py-3 font-medium">IP Address</th>
              <th className="px-4 py-3 font-medium">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d8d9d0]">
            {query.isLoading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-[#69736c]">Loading audit logs...</td></tr>
            ) : query.isError ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-red-700">Unable to load audit logs.</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-[#69736c]">No audit logs found.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id}>
                  <td className="px-4 py-3">{log.user || '--'}</td>
                  <td className="px-4 py-3">{log.role || '--'}</td>
                  <td className="px-4 py-3">{log.action}</td>
                  <td className="px-4 py-3">{log.resource}</td>
                  <td className="px-4 py-3">{log.resourceId || '--'}</td>
                  <td className="px-4 py-3">{log.ipAddress || '--'}</td>
                  <td className="px-4 py-3">{new Date(log.createdAt).toLocaleString()}</td>
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
