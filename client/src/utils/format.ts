/** Formatting helpers shared by tables, cards and printable documents. */

export function formatCurrency(amount?: number | null, currency = 'NGN') {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return '--'
  try {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(amount))
  } catch {
    return `${currency} ${Number(amount).toLocaleString()}`
  }
}

export function formatDate(value?: string | Date | null, style: 'short' | 'long' = 'short') {
  if (!value) return '--'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  return new Intl.DateTimeFormat('en-GB', style === 'long'
    ? { day: 'numeric', month: 'long', year: 'numeric' }
    : { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

export function formatDateTime(value?: string | Date | null) {
  if (!value) return '--'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
}

/** "3 days ago" style label for activity feeds. */
export function relativeTime(value?: string | Date | null) {
  if (!value) return '--'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  const seconds = Math.round((date.getTime() - Date.now()) / 1000)
  const units: [Intl.RelativeTimeFormatUnit, number][] = [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60]]
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  for (const [unit, secondsInUnit] of units) {
    if (Math.abs(seconds) >= secondsInUnit) return formatter.format(Math.round(seconds / secondsInUnit), unit)
  }
  return formatter.format(seconds, 'second')
}

export function initials(name?: string) {
  if (!name) return 'U'
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || 'U'
}

/** Joins class names, dropping falsy entries. */
export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

export function toInputDate(value?: string | Date | null) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}
