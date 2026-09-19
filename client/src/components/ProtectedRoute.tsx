import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

type ProtectedRouteProps = {
  children: React.ReactNode
  roles?: string[]
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, initializing } = useAuthStore()
  const location = useLocation()

  // The session is restored from the refresh cookie on boot; redirecting before that resolves
  // would sign the user out on every page reload.
  if (initializing) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-[#69736c]">Restoring your session…</div>
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-ink">
        <div className="max-w-md border border-[#d8d9d0] bg-white p-8 text-center">
          <h1 className="font-display text-4xl">Unauthorized</h1>
          <p className="mt-3 text-sm text-[#69736c]">You do not have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return children
}
