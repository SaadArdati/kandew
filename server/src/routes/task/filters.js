export const VALID_PRIORITIES = new Set(['low', 'medium', 'high'])
export const VALID_COLUMNS = new Set(['todo', 'in-progress', 'review', 'done'])

const SORT_COLUMNS = {
  created_at: 't.created_at',
  due_date: 't.due_date',
  title: 't.title',
  sort_order: 't.sort_order',
  // ascending = least → most important, so asc gives low first.
  priority: "FIELD(t.priority, 'low', 'medium', 'high')",
  column_id: "FIELD(t.column_id, 'todo', 'in-progress', 'review', 'done')",
}

const DEFAULT_LIMIT = 200
const MAX_LIMIT = 500

export const TASK_SELECT = `
    t.id,
    t.title,
    t.description,
    t.priority,
    t.column_id,
    t.team_id,
    t.assignee_user_id,
    u.username AS assignee_name,
    u.avatar AS assignee_avatar,
    t.creator_user_id,
    t.max_petals,
    t.earned_petals,
    t.review_entered_at,
    t.frozen_petals_at_review,
    t.due_date,
    t.completed_at,
    t.created_at,
    t.sort_order`

export const DEFAULT_ORDER_BY =
  "FIELD(t.column_id, 'todo', 'in-progress', 'review', 'done'), t.sort_order ASC, t.created_at ASC"

/**
 * Normalize a query-string value that may be a single scalar, an array of
 * scalars, or missing, into a non-empty string array (or null when empty).
 *
 * Express's default 'simple' query parser (Node's `querystring.parse`) already
 * collects repeated keys into arrays — e.g. `?priority=high&priority=medium`
 * arrives as `['high', 'medium']`, while `?priority=high` arrives as `'high'`.
 * This matches the OpenAPI 3 default of `style: form, explode: true` for array
 * query params.
 *   https://nodejs.org/api/querystring.html#querystringparsestr-sep-eq-options
 *   https://swagger.io/docs/specification/serialization/#query
 */
function toArrayParam(value) {
  if (value == null) return null
  const items = Array.isArray(value) ? value : [value]
  const trimmed = items.map((item) => String(item).trim()).filter(Boolean)
  return trimmed.length > 0 ? trimmed : null
}

/**
 * Translate query-string filters into WHERE clauses, params, ORDER BY and
 * LIMIT/OFFSET. Returns `{ error }` on validation failure so the caller can
 * emit a 400.
 *
 * @param {Record<string, any>} query - req.query from Express
 * @param {number} userId - id of the authenticated caller, used for `assigneeUserId=me`
 * @returns {{ where: string[], params: any[], orderBy: string, limit: number, offset: number } | { error: string }}
 */
export function buildTaskFilters(query, userId) {
  const where = []
  const params = []

  const search = query.q?.trim()
  if (search) {
    // LIKE treats `%` and `_` as wildcards and `\` as the default escape
    // character. Without escaping, a search for "100%" matches any string
    // containing "100" followed by anything; "foo_bar" matches "fooXbar".
    // We prefix each metacharacter with `\` and pin the escape character
    // explicitly via ESCAPE '\\' so the behavior is stable regardless of the
    // server's sql_mode.
    //   LIKE / ESCAPE: https://dev.mysql.com/doc/refman/8.0/en/string-comparison-functions.html#operator_like
    //   NO_BACKSLASH_ESCAPES (why we pin the escape char): https://dev.mysql.com/doc/refman/8.0/en/sql-mode.html#sqlmode_no_backslash_escapes
    // The SQL literal `'\\'` becomes the one-byte string `\` after MySQL's
    // string-literal lexer collapses the escape — that's the escape character
    // for LIKE. The wrapped `%...%` pattern is bound as a `?` parameter
    // (mysql2's pool.query handles SQL-literal escaping of the value).
    const escaped = search.replace(/[\\%_]/g, '\\$&')
    const like = `%${escaped}%`
    where.push(
      "(t.title LIKE ? ESCAPE '\\\\' OR t.description LIKE ? ESCAPE '\\\\' OR u.username LIKE ? ESCAPE '\\\\')"
    )
    params.push(like, like, like)
  }

  const priorities = toArrayParam(query.priority)
  if (priorities) {
    const invalid = priorities.find((p) => !VALID_PRIORITIES.has(p))
    if (invalid) {
      return { error: `Invalid priority: ${invalid}` }
    }
    where.push(`t.priority IN (${priorities.map(() => '?').join(', ')})`)
    params.push(...priorities)
  }

  const columnIds = toArrayParam(query.columnId)
  if (columnIds) {
    const invalid = columnIds.find((c) => !VALID_COLUMNS.has(c))
    if (invalid) {
      return { error: `Invalid column: ${invalid}` }
    }
    where.push(`t.column_id IN (${columnIds.map(() => '?').join(', ')})`)
    params.push(...columnIds)
  }

  if (query.assigneeUserId != null && query.assigneeUserId !== '') {
    if (query.assigneeUserId === 'me') {
      where.push('t.assignee_user_id = ?')
      params.push(userId)
    } else if (query.assigneeUserId === 'unassigned') {
      where.push('t.assignee_user_id IS NULL')
    } else {
      const assigneeId = Number(query.assigneeUserId)
      if (!Number.isInteger(assigneeId) || assigneeId <= 0) {
        return { error: 'Invalid assigneeUserId' }
      }
      where.push('t.assignee_user_id = ?')
      params.push(assigneeId)
    }
  }

  if (query.dueBefore) {
    where.push('t.due_date <= ?')
    params.push(query.dueBefore)
  }
  if (query.dueAfter) {
    where.push('t.due_date >= ?')
    params.push(query.dueAfter)
  }

  let orderBy = DEFAULT_ORDER_BY
  if (query.sort) {
    const [rawField, rawDir] = String(query.sort).split(':')
    const field = SORT_COLUMNS[rawField]
    if (!field) {
      return { error: `Invalid sort field: ${rawField}` }
    }
    const dir = (rawDir ?? 'asc').toLowerCase()
    if (dir !== 'asc' && dir !== 'desc') {
      return { error: 'Sort direction must be asc or desc' }
    }
    const direction = dir.toUpperCase()
    orderBy =
      rawField === 'sort_order' ? `${field} ${direction}` : `${field} ${direction}, t.sort_order ASC`
  }

  let limit = DEFAULT_LIMIT
  if (query.limit != null && query.limit !== '') {
    const parsed = Number(query.limit)
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return { error: 'limit must be a positive integer' }
    }
    limit = Math.min(parsed, MAX_LIMIT)
  }

  let offset = 0
  if (query.offset != null && query.offset !== '') {
    const parsed = Number(query.offset)
    if (!Number.isInteger(parsed) || parsed < 0) {
      return { error: 'offset must be a non-negative integer' }
    }
    offset = parsed
  }

  return { where, params, orderBy, limit, offset }
}
