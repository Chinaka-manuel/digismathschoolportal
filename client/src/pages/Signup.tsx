import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { getApiErrorMessage, roleHome } from '../api/errors'
import { Seo } from '../components/Seo'
import { PasswordInput } from '../components/ui'

type Values = { name: string; email: string; password: string; confirmPassword: string }

export default function Signup() {
  const navigate = useNavigate()
  const { register: createAccount, loading, user, initializing } = useAuthStore()
  const [error, setError] = useState('')
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Values>()

  if (!initializing && user) return <Navigate to={roleHome(user.role)} replace />

  const submit = async (values: Values) => {
    setError('')
    try {
      const created = await createAccount(values.name.trim(), values.email.trim(), values.password)
      navigate(roleHome(created.role), { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'We could not create your account. Please try again.'))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#cbd8c8] px-5 py-12">
      <Seo title="Create account" path="/signup" />
      <div className="w-full max-w-md bg-paper p-8 text-ink shadow-2xl">
        <p className="text-[10px] uppercase tracking-[.15em] text-forest">Parent access</p>
        <h1 className="mt-2 font-display text-4xl">Create your account.</h1>
        <p className="mt-2 text-sm text-[#69736c]">Track results, fees, and announcements for your children.</p>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit(submit)}>
          <label className="block text-sm">Full name<input className="mt-2 w-full border border-[#d8d9d0] bg-transparent px-3 py-3 outline-none focus:border-forest" type="text" autoComplete="name" {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })} />{errors.name && <span className="mt-1 block text-xs text-red-700">{errors.name.message}</span>}</label>
          <label className="block text-sm">Email<input className="mt-2 w-full border border-[#d8d9d0] bg-transparent px-3 py-3 outline-none focus:border-forest" type="email" autoComplete="email" {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' } })} />{errors.email && <span className="mt-1 block text-xs text-red-700">{errors.email.message}</span>}</label>
          <label className="block text-sm">Password<PasswordInput autoComplete="new-password" {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } })} />{errors.password && <span className="mt-1 block text-xs text-red-700">{errors.password.message}</span>}</label>
          <label className="block text-sm">Confirm password<PasswordInput autoComplete="new-password" {...register('confirmPassword', { required: 'Please confirm your password', validate: (value) => value === watch('password') || 'Passwords do not match' })} />{errors.confirmPassword && <span className="mt-1 block text-xs text-red-700">{errors.confirmPassword.message}</span>}</label>
          {error && <p role="alert" className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button className="flex w-full items-center justify-between bg-forest px-4 py-4 text-xs uppercase tracking-[.08em] text-white disabled:opacity-60" disabled={loading} type="submit">{loading ? 'Creating account...' : 'Create account'} <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>
        </form>
        <p className="mt-6 text-sm text-[#69736c]">Already have an account? <Link className="text-forest underline" to="/login">Sign in</Link></p>
      </div>
    </div>
  )
}
