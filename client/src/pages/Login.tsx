import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { getApiErrorMessage, roleHome } from '../api/errors'
import { Seo } from '../components/Seo'
import { PasswordInput } from '../components/ui'

type Values = { email: string; password: string }

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading, user, initializing } = useAuthStore()
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors } } = useForm<Values>()

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname
  if (!initializing && user) return <Navigate to={from || roleHome(user.role)} replace />

  const submit = async (values: Values) => {
    setError('')
    try {
      const signedIn = await login(values.email.trim(), values.password)
      navigate(from || roleHome(signedIn.role), { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'We could not sign you in. Please try again.'))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#cbd8c8] px-5">
      <Seo title="Login" path="/login" />
      <div className="w-full max-w-md bg-paper p-8 text-ink shadow-2xl">
        <p className="text-[10px] uppercase tracking-[.15em] text-forest">Secure portal</p>
        <h1 className="mt-2 font-display text-4xl">Welcome back.</h1>
        <p className="mt-2 text-sm text-[#69736c]">Sign in to access your dashboard, assignments, and results.</p>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit(submit)}>
          <label className="block text-sm">Email<input className="mt-2 w-full border border-[#d8d9d0] bg-transparent px-3 py-3 outline-none focus:border-forest" type="email" autoComplete="email" {...register('email', { required: 'Email is required' })} />{errors.email && <span className="mt-1 block text-xs text-red-700">{errors.email.message}</span>}</label>
          <label className="block text-sm">Password<PasswordInput autoComplete="current-password" {...register('password', { required: 'Password is required' })} />{errors.password && <span className="mt-1 block text-xs text-red-700">{errors.password.message}</span>}</label>
          {error && <p role="alert" className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button className="flex w-full items-center justify-between bg-forest px-4 py-4 text-xs uppercase tracking-[.08em] text-white disabled:opacity-60" disabled={loading} type="submit">{loading ? 'Signing in...' : 'Sign in'} <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>
        </form>
        <p className="mt-6 text-sm text-[#69736c]">New parent? <Link className="text-forest underline" to="/signup">Create an account</Link></p>
      </div>
    </div>
  )
}
