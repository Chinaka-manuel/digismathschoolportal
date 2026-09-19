import { api } from '../api/client'

export type SessionUser = {
  id: string
  name: string
  email: string
  role: string
  profileImageUrl?: string
  permissions?: string[]
}

type SessionResponse = { data: { data: { accessToken: string; user: SessionUser } } }

export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }) as Promise<SessionResponse>,
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }) as Promise<SessionResponse>,
  refresh: () => api.post('/auth/refresh') as Promise<SessionResponse>,
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }) as Promise<SessionResponse>,
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }) as Promise<SessionResponse>,
}
