import { api } from '../api/client'

/** Endpoints that do not fit the generic CRUD shape. */
export const adminService = {
  users: {
    list: async (params: Record<string, unknown> = {}) => {
      const body = (await api.get('/v1/users', { params })).data
      return { data: body?.data ?? [], pagination: body?.pagination }
    },
    setRole: (id: string, role: string) => api.patch(`/v1/users/${id}/role`, { role }),
    setStatus: (id: string, isActive: boolean) => api.patch(`/v1/users/${id}/status`, { isActive }),
  },
  payments: {
    list: async (params: Record<string, unknown> = {}) => {
      const body = (await api.get('/v1/payments', { params })).data
      return { data: body?.data ?? [], pagination: body?.pagination }
    },
    review: (reference: string, approve: boolean, note?: string) =>
      api.patch(`/v1/payments/${reference}/review`, { approve, note }),
    verify: (reference: string) => api.post(`/v1/payments/${reference}/verify`),
  },
  contact: {
    list: async (params: Record<string, unknown> = {}) => {
      const body = (await api.get('/v1/contact', { params })).data
      return { data: body?.data ?? [], pagination: body?.pagination }
    },
  },
  attendance: {
    summary: async (params: Record<string, unknown> = {}) =>
      (await api.get('/v1/attendance/summary', { params })).data?.data,
    today: async (params: Record<string, unknown> = {}) =>
      (await api.get('/v1/attendance/today', { params })).data?.data,
    forStudent: async (studentId: string) =>
      (await api.get(`/v1/attendance/student/${studentId}`)).data?.data,
    record: (payload: Record<string, unknown>) => api.post('/v1/attendance', payload),
  },
  results: {
    publish: (resultId: string) => api.patch(`/v1/results/${resultId}/publish`),
    forStudent: async (studentId: string) =>
      (await api.get(`/v1/results/student/${studentId}`)).data?.data,
  },
  notifications: {
    markRead: (id: string) => api.patch(`/v1/notifications/${id}/read`),
  },
  parents: {
    linkChild: (childId: string, payload: Record<string, unknown> = {}) =>
      api.post(`/v1/parents/children/${childId}/link`, payload),
    unlinkChild: (childId: string) => api.delete(`/v1/parents/children/${childId}/unlink`),
  },
  uploads: {
    document: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return api.post('/v1/uploads/documents', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
    video: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return api.post('/v1/uploads/video', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
  },
  health: async () => (await api.get('/health')).data,
}
