import { api } from '../api/client'

export type Paginated<T> = {
  data: T[]
  pagination?: { page: number; limit: number; total: number; totalPages: number }
}

export type ListParams = Record<string, string | number | boolean | undefined>

/**
 * Every managed resource on the server exposes the same four operations
 * (GET /, POST /, PATCH /:id, DELETE /:id), so one factory covers them all
 * instead of a hand-written service per resource.
 */
export function createResourceService<T = Record<string, unknown>>(basePath: string) {
  return {
    basePath,
    async list(params: ListParams = {}): Promise<Paginated<T>> {
      const response = await api.get(basePath, { params })
      const body = response.data
      return { data: (body?.data ?? []) as T[], pagination: body?.pagination }
    },
    async create(payload: Partial<T>): Promise<T> {
      return (await api.post(basePath, payload)).data?.data as T
    },
    async update(id: string, payload: Partial<T>): Promise<T> {
      return (await api.patch(`${basePath}/${id}`, payload)).data?.data as T
    },
    async remove(id: string): Promise<void> {
      await api.delete(`${basePath}/${id}`)
    },
  }
}

/** One service per managed resource, mapped to the server routes in app.js. */
export const resourceServices = {
  sessions: createResourceService('/v1/sessions'),
  terms: createResourceService('/v1/terms'),
  subjects: createResourceService('/v1/subjects'),
  departments: createResourceService('/v1/departments'),
  classes: createResourceService('/v1/classes'),
  fees: createResourceService('/v1/fees'),
  invoices: createResourceService('/v1/invoices'),
  downloads: createResourceService('/v1/downloads'),
  gallery: createResourceService('/v1/gallery'),
  assignments: createResourceService('/v1/assignments'),
  news: createResourceService('/v1/cms/news'),
  announcements: createResourceService('/v1/cms/announcements'),
}

export type ResourceKey = keyof typeof resourceServices
