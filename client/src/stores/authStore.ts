import { create } from 'zustand'
import { api, setAccessToken } from '../api/client'

type User = { id: string; name: string; email: string; role: string; profileImageUrl?: string; permissions?: string[] }
type Session = { accessToken: string; user: User }
type AuthState = {
  user: User | null
  loading: boolean
  initializing: boolean
  login: (email: string, password: string) => Promise<User>
  register: (name: string, email: string, password: string) => Promise<User>
  bootstrap: () => Promise<void>
  logout: () => Promise<void>
  updateUser: (patch: Partial<User>) => void
}

let bootstrapPromise: Promise<void> | null = null

export const useAuthStore = create<AuthState>((set) => {
  const applySession = (session: Session) => { setAccessToken(session.accessToken); set({ user: session.user }); return session.user }

  return {
    user: null,
    loading: false,
    initializing: true,
    async login(email, password) {
      set({ loading: true })
      try { const { data } = await api.post('/auth/login', { email, password }); return applySession(data.data) } finally { set({ loading: false }) }
    },
    async register(name, email, password) {
      set({ loading: true })
      try { const { data } = await api.post('/auth/register', { name, email, password }); return applySession(data.data) } finally { set({ loading: false }) }
    },
    // Restores the session from the httpOnly refresh cookie so a page reload does not sign the user out.
    bootstrap() {
      bootstrapPromise ??= api.post('/auth/refresh')
        .then(({ data }) => { applySession(data.data) })
        .catch(() => { setAccessToken(null); set({ user: null }) })
        .finally(() => { set({ initializing: false }) })
      return bootstrapPromise
    },
    async logout() {
      try { await api.post('/auth/logout') } finally { setAccessToken(null); set({ user: null }) }
    },
    updateUser(patch) { set((state) => ({ user: state.user ? { ...state.user, ...patch } : null })) },
  }
})
