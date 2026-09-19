import axios from 'axios'

// Relative by default so the browser talks to its own origin (the Vite dev proxy in development,
// the same domain in production). A cross-origin absolute URL would drop the SameSite refresh cookie.
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', withCredentials: true, headers: { 'Content-Type': 'application/json' }, timeout: 20000 })
let accessToken: string | null = null
let refreshRequest: Promise<string | null> | null = null

export function setAccessToken(token: string | null) { accessToken = token }
api.interceptors.request.use((config) => { if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`; return config })
api.interceptors.response.use((response) => response, async (error) => {
  const original = error.config
  if (error.response?.status !== 401 || original?._retry || original?.url?.includes('/auth/refresh') || original?.url?.includes('/auth/login') || original?.url?.includes('/auth/register')) throw error
  original._retry = true
  refreshRequest ??= api.post('/auth/refresh').then(({ data }) => { setAccessToken(data.data.accessToken); return data.data.accessToken }).catch(() => null).finally(() => { refreshRequest = null })
  const token = await refreshRequest
  if (!token) throw error
  original.headers.Authorization = `Bearer ${token}`
  return api(original)
})
