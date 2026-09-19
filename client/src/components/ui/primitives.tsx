import { forwardRef, useState } from 'react'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { cn } from '../../utils/format'

/* -------------------------------------------------------------------------- */
/* Button                                                                     */
/* -------------------------------------------------------------------------- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'sun'
type ButtonSize = 'sm' | 'md' | 'lg'

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-forest text-white hover:brightness-110',
  secondary: 'border border-[#d8d9d0] bg-white text-ink hover:border-forest',
  ghost: 'text-ink hover:bg-[#e5e9dd]',
  danger: 'bg-[#a3231c] text-white hover:brightness-110',
  sun: 'bg-sun text-ink hover:brightness-105',
}

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3.5 text-sm',
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, icon, className, children, disabled, ...rest }, ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium tracking-[.02em]',
        'disabled:cursor-not-allowed disabled:opacity-60',
        buttonVariants[variant], buttonSizes[size], className,
      )}
      {...rest}
    >
      {loading ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : icon}
      {children}
    </button>
  )
})

/* -------------------------------------------------------------------------- */
/* Form controls                                                              */
/* -------------------------------------------------------------------------- */

const controlBase = 'w-full rounded-xl border border-[#d8d9d0] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-forest'

/**
 * Wraps a control with its label, hint and error. The error is tied to the
 * control through aria-describedby so screen readers announce it.
 */
export function Field({ label, htmlFor, error, hint, required, children, className }: {
  label?: string
  htmlFor?: string
  error?: string
  hint?: string
  required?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('block', className)}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium" htmlFor={htmlFor}>
          {label}{required && <span className="ml-0.5 text-[#a3231c]" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-[#69736c]" id={htmlFor ? `${htmlFor}-hint` : undefined}>{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-700" id={htmlFor ? `${htmlFor}-error` : undefined} role="alert">{error}</p>}
    </div>
  )
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function Input({ className, invalid, ...rest }, ref) {
    return <input ref={ref} aria-invalid={invalid || undefined} className={cn(controlBase, invalid && 'border-[#a3231c]', className)} {...rest} />
  },
)

export const PasswordInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function PasswordInput({ className, invalid, ...rest }, ref) {
    const [visible, setVisible] = useState(false)
    return (
      <div className="relative">
        <input ref={ref} aria-invalid={invalid || undefined} className={cn(controlBase, 'pr-10', invalid && 'border-[#a3231c]', className)} type={visible ? 'text' : 'password'} {...rest} />
        <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#69736c]" onClick={() => setVisible((v) => !v)} aria-label={visible ? 'Hide password' : 'Show password'}>
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    )
  },
)

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(
  function Textarea({ className, invalid, rows = 4, ...rest }, ref) {
    return <textarea ref={ref} rows={rows} aria-invalid={invalid || undefined} className={cn(controlBase, 'resize-y', invalid && 'border-[#a3231c]', className)} {...rest} />
  },
)

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }>(
  function Select({ className, invalid, children, ...rest }, ref) {
    return <select ref={ref} aria-invalid={invalid || undefined} className={cn(controlBase, invalid && 'border-[#a3231c]', className)} {...rest}>{children}</select>
  },
)

/* -------------------------------------------------------------------------- */
/* Display                                                                    */
/* -------------------------------------------------------------------------- */

export function Card({ children, className, as: Tag = 'section' }: { children: ReactNode; className?: string; as?: 'section' | 'article' | 'div' }) {
  return <Tag className={cn('border border-[#d8d9d0] bg-white p-5', className)}>{children}</Tag>
}

export function CardHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="font-display text-2xl">{title}</h3>
        {description && <p className="mt-1 text-sm text-[#69736c]">{description}</p>}
      </div>
      {action}
    </div>
  )
}

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

const badgeTones: Record<BadgeTone, string> = {
  neutral: 'bg-[#e5e9dd] text-forest',
  success: 'bg-[#d9e6d4] text-forest',
  warning: 'bg-sun text-ink',
  danger: 'bg-[#f6dcda] text-[#a3231c]',
  info: 'bg-[#e5e9dd] text-forest',
}

export function Badge({ children, tone = 'neutral', className }: { children: ReactNode; tone?: BadgeTone; className?: string }) {
  return <span className={cn('inline-block rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider', badgeTones[tone], className)}>{children}</span>
}

/** Maps common server status strings onto badge tones. */
export function statusTone(status?: string): BadgeTone {
  const value = (status || '').toLowerCase()
  if (['active', 'approved', 'successful', 'paid', 'published', 'completed'].includes(value)) return 'success'
  if (['pending', 'under review', 'waitlisted', 'draft', 'overdue'].includes(value)) return 'warning'
  if (['rejected', 'failed', 'inactive', 'cancelled', 'reversed', 'suspended'].includes(value)) return 'danger'
  return 'neutral'
}

export function Avatar({ name, src, size = 36 }: { name?: string; src?: string; size?: number }) {
  const label = (name || 'User').trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'U'
  if (src) return <img src={src} alt={name || 'Profile photo'} width={size} height={size} className="rounded-full object-cover" style={{ width: size, height: size }} loading="lazy" />
  return (
    <span aria-hidden="true" className="grid place-items-center rounded-full bg-forest text-sm text-white" style={{ width: size, height: size }}>
      {label}
    </span>
  )
}

export function Spinner({ label = 'Loading', size = 18 }: { label?: string; size?: number }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-[#69736c]" role="status">
      <Loader2 size={size} className="animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </span>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn('block animate-pulse rounded-lg bg-[#e5e9dd]', className)} />
}

export function SkeletonRows({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <td key={columnIndex} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
          ))}
        </tr>
      ))}
    </>
  )
}
