const MAX_LIMIT = 100

/** Normalises ?page/?limit/?sort/?search into safe values (spec section 33). */
export function parseQuery(query = {}, { defaultLimit = 20, defaultSort = '-createdAt' } = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1)
  const requested = Number.parseInt(query.limit, 10) || defaultLimit
  const limit = Math.min(Math.max(1, requested), MAX_LIMIT)
  const search = typeof query.search === 'string' ? query.search.trim().slice(0, 120) : ''
  const sort = typeof query.sort === 'string' && query.sort ? query.sort.slice(0, 60) : defaultSort
  return { page, limit, skip: (page - 1) * limit, search, sort }
}

export function buildPagination({ page, limit, total }) {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) }
}

/** Escapes user input before it is used inside a RegExp, so search cannot inject patterns. */
export function safeRegex(term) {
  return new RegExp(String(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
}
