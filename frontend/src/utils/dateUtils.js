/**
 * Date Utility Functions for the Booking Feature
 *
 * Provides formatting, validation, and duration helpers
 * for date/time operations across booking components.
 */

/**
 * Format a date-time string or Date object to a human-readable format.
 * Example: "May 1, 2026, 10:00 AM"
 *
 * @param {string|Date} date - ISO string or Date object
 * @returns {string} Formatted date-time string
 */
export function formatDateTime(date) {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '-'

  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format a date to show only the date part.
 * Example: "May 1, 2026"
 *
 * @param {string|Date} date - ISO string or Date object
 * @returns {string} Formatted date string
 */
export function formatDateOnly(date) {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '-'

  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format a time range for display.
 * Example: "10:00 AM – 12:00 PM"
 *
 * @param {string|Date} startTime - Start time
 * @param {string|Date} endTime   - End time
 * @returns {string} Formatted time range
 */
export function formatTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return '-'
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return '-'

  const timeOpts = { hour: '2-digit', minute: '2-digit', hour12: true }
  return `${start.toLocaleTimeString('en-US', timeOpts)} – ${end.toLocaleTimeString('en-US', timeOpts)}`
}

/**
 * Check if a time range is valid (start before end).
 *
 * @param {string|Date} start - Start time
 * @param {string|Date} end   - End time
 * @returns {boolean} True if start < end
 */
export function isValidTimeRange(start, end) {
  if (!start || !end) return false
  const s = typeof start === 'string' ? new Date(start) : start
  const e = typeof end === 'string' ? new Date(end) : end
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return false
  return s < e
}

/**
 * Check if a given date is in the past.
 *
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is before now
 */
export function isPastDate(date) {
  if (!date) return false
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return false
  return d < new Date()
}

/**
 * Calculate duration in hours between two dates.
 *
 * @param {string|Date} start - Start time
 * @param {string|Date} end   - End time
 * @returns {number} Duration in hours (rounded to 1 decimal)
 */
export function getDurationHours(start, end) {
  if (!start || !end) return 0
  const s = typeof start === 'string' ? new Date(start) : start
  const e = typeof end === 'string' ? new Date(end) : end
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0

  const diffMs = e.getTime() - s.getTime()
  return Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10
}

/**
 * Calculate duration in minutes between two dates.
 *
 * @param {string|Date} start - Start time
 * @param {string|Date} end   - End time
 * @returns {number} Duration in minutes (rounded)
 */
export function getDurationMinutes(start, end) {
  if (!start || !end) return 0
  const s = typeof start === 'string' ? new Date(start) : start
  const e = typeof end === 'string' ? new Date(end) : end
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0

  return Math.round((e.getTime() - s.getTime()) / (1000 * 60))
}

/**
 * Convert a Date or ISO string to the datetime-local input format.
 * Example: "2026-05-01T10:00"
 *
 * @param {string|Date} date - Date to convert
 * @returns {string} datetime-local compatible string
 */
export function toDateTimeLocal(date) {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''

  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/**
 * Get a default start time (next nearest 30-min slot).
 *
 * @returns {string} datetime-local compatible string
 */
export function getDefaultStartTime() {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 30 - (now.getMinutes() % 30))
  now.setSeconds(0, 0)
  return toDateTimeLocal(now)
}

/**
 * Get a default end time (1 hour after the given start).
 *
 * @param {string} startTime - datetime-local string
 * @returns {string} datetime-local compatible string
 */
export function getDefaultEndTime(startTime) {
  if (!startTime) {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 90 - (now.getMinutes() % 30))
    now.setSeconds(0, 0)
    return toDateTimeLocal(now)
  }
  const d = new Date(startTime)
  d.setHours(d.getHours() + 1)
  return toDateTimeLocal(d)
}

/**
 * Format relative time from now (e.g., "2 hours ago", "in 3 days").
 *
 * @param {string|Date} date - Date to compare
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '-'

  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const absDiff = Math.abs(diffMs)
  const isFuture = diffMs > 0

  const minutes = Math.floor(absDiff / (1000 * 60))
  const hours = Math.floor(absDiff / (1000 * 60 * 60))
  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'just now'
  if (minutes < 60) return isFuture ? `in ${minutes}m` : `${minutes}m ago`
  if (hours < 24) return isFuture ? `in ${hours}h` : `${hours}h ago`
  if (days < 30) return isFuture ? `in ${days}d` : `${days}d ago`

  return formatDateOnly(d)
}
