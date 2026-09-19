import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Eye, Pencil, Search } from 'lucide-react'
import { api } from '../api/client'
import { useAuthStore } from '../stores/authStore'

const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']

type Student = {
  _id: string
  studentId: string
  fullName: string
  classRef?: { name: string }
  session?: string
  status: string
}

export default function AdminStudents() {
  const { user } = useAuthStore()
  const canAccess = adminRoles.includes(user?.role || '')
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const query = useQuery({
    queryKey: ['admin-students', search, classFilter, statusFilter, page],
    queryFn: async () => (await api.get('/v1/students', { params: { page, limit: 20, search, classId: classFilter || undefined, status: statusFilter || undefined } })).data,
    enabled: canAccess,
  })

  if (!canAccess) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-red-700">You do not have permission to view this page.</p>
      </div>
    )
  }

  const students = (query.data?.data as Student[]) ?? []
  const pagination = query.data?.pagination ?? { page: 1, totalPages: 1 }

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-sm text-[#69736c]">Management</p>
          <h2 className="mt-1 font-display text-4xl">Students</h2>
        </div>
      </div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#69736c]" />
          <input
            className="border border-[#d8d9d0] bg-transparent pl-9 pr-3 py-2 text-sm outline-none focus:border-forest"
            placeholder="Search students..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          className="border border-[#d8d9d0] bg-transparent px-3 py-2 text-sm outline-none focus:border-forest"
          value={classFilter}
          onChange={(e) => { setClassFilter(e.target.value); setPage(1) }}
        >
          <option value="">All classes</option>
          <option value="class1">Class 1</option>
          <option value="class2">Class 2</option>
          <option value="class3">Class 3</option>
        </select>
        <select
          className="border border-[#d8d9d0] bg-transparent px-3 py-2 text-sm outline-none focus:border-forest"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
        >
          <option value="">All statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Graduated">Graduated</option>
        </select>
      </div>
      <div className="overflow-x-auto border border-[#d8d9d0] bg-white/40">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#e5e9dd] text-[#69736c]">
            <tr>
              <th className="px-4 py-3 font-medium">Student ID</th>
              <th className="px-4 py-3 font-medium">Full Name</th>
              <th className="px-4 py-3 font-medium">Class</th>
              <th className="px-4 py-3 font-medium">Session</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d8d9d0]">
            {query.isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-[#69736c]">Loading students...</td></tr>
            ) : query.isError ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-red-700">Unable to load students.</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-[#69736c]">No students found.</td></tr>
            ) : (
              students.map((student) => (
                <tr key={student._id}>
                  <td className="px-4 py-3">{student.studentId}</td>
                  <td className="px-4 py-3">{student.fullName}</td>
                  <td className="px-4 py-3">{student.classRef?.name || '--'}</td>
                  <td className="px-4 py-3">{student.session || '--'}</td>
                  <td className="px-4 py-3">
                    <span className="bg-[#e5e9dd] px-2 py-1 text-[10px] uppercase tracking-wider text-forest">{student.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 hover:text-forest" aria-label="View student"><Eye size={16} /></button>
                      <button className="p-1.5 hover:text-forest" aria-label="Edit student"><Pencil size={16} /></button>
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
