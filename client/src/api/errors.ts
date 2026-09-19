import axios from 'axios'

type ApiErrorPayload = { message?: string; errors?: { field?: string; message?: string }[] }

/** Turns any thrown request error into a message that tells the user what actually went wrong. */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  if (!axios.isAxiosError(error)) return fallback
  if (error.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.'
  if (!error.response) return 'Unable to reach the server. Check your connection and confirm the API is running.'

  const { status } = error.response
  const payload = error.response.data as ApiErrorPayload | undefined
  const fieldErrors = payload?.errors?.map((item) => item.message).filter(Boolean).join(' ')

  if (status === 400 || status === 422) return fieldErrors || payload?.message || 'Please check the details you entered.'
  if (status === 401) return 'Invalid email or password.'
  if (status === 403) return payload?.message || 'You do not have permission to do that.'
  if (status === 409) return payload?.message || 'An account with this email already exists.'
  if (status === 423) return payload?.message || 'Account locked after too many failed attempts. Try again in 15 minutes.'
  if (status === 429) return 'Too many attempts. Please wait a minute and try again.'
  if (status >= 500) return 'The server ran into a problem. Please try again shortly.'
  return payload?.message || fallback
}

/** Landing route for a role, so every user lands on a dashboard they can actually open. */
export function roleHome(role?: string) {
  if (['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(role || '')) return '/admin'
  if (['TEACHER', 'STAFF'].includes(role || '')) return '/staff'
  if (['PARENT', 'GUARDIAN'].includes(role || '')) return '/parent'
  return '/portal'
}
