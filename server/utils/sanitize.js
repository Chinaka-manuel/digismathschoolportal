/**
 * Strips the operator keys Mongo treats as query syntax ($gt, $where, dotted paths).
 * Without this, a body like { email: { $ne: null } } turns a lookup into a match-all.
 */
export function sanitizeMongo(value, depth = 0) {
  if (depth > 8 || value === null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map((item) => sanitizeMongo(item, depth + 1))
  const clean = {}
  for (const [key, item] of Object.entries(value)) {
    if (key.startsWith('$') || key.includes('.')) continue
    clean[key] = sanitizeMongo(item, depth + 1)
  }
  return clean
}

/** Removes fields a client must never be able to set on a document. */
export function stripProtected(payload, extra = []) {
  const blocked = new Set(['_id', '__v', 'passwordHash', 'refreshTokenHash', 'role', 'permissions', 'createdAt', 'updatedAt', ...extra])
  return Object.fromEntries(Object.entries(payload || {}).filter(([key]) => !blocked.has(key)))
}
