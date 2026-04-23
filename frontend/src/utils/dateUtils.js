/**
 * Date Utility Functions for the Booking Feature
 *
 * Provides formatting, validation, and duration helpers
 * for date/time operations across booking components.
 */
const COLOMBO_OFFSET_MINUTES = 5 * 60 + 30

function parseDateTimeLocalParts(value) {
  if (!value || typeof value !== 'string') return null
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/)
  if (!match) return null
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
  }
}

export function getColomboNowTimestamp() {
  return Date.now()
}

export function parseColomboDateTimeToUtcMs(value) {
  const parts = parseDateTimeLocalParts(value)
  if (!parts) return NaN
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute) - COLOMBO_OFFSET_MINUTES * 60 * 1000
}

export function getColomboHourMinute(value) {
  const parts = parseDateTimeLocalParts(value)
  if (!parts) return null
  return { hour: parts.hour, minute: parts.minute }
}

function toDateTimeLocalFromUtcMsAsColombo(utcMs) {
  const colomboMs = utcMs + COLOMBO_OFFSET_MINUTES * 60 * 1000
  const d = new Date(colomboMs)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}

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
  const s = typeof start === 'string' ? parseColomboDateTimeToUtcMs(start) : NaN
  const e = typeof end === 'string' ? parseColomboDateTimeToUtcMs(end) : NaN
  if (Number.isNaN(s) || Number.isNaN(e)) return false
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
  const ts = typeof date === 'string' ? parseColomboDateTimeToUtcMs(date) : NaN
  if (Number.isNaN(ts)) return false
  return ts < getColomboNowTimestamp()
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
  const s = typeof start === 'string' ? parseColomboDateTimeToUtcMs(start) : NaN
  const e = typeof end === 'string' ? parseColomboDateTimeToUtcMs(end) : NaN
  if (Number.isNaN(s) || Number.isNaN(e)) return 0
  const diffMs = e - s
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
  const s = typeof start === 'string' ? parseColomboDateTimeToUtcMs(start) : NaN
  const e = typeof end === 'string' ? parseColomboDateTimeToUtcMs(end) : NaN
  if (Number.isNaN(s) || Number.isNaN(e)) return 0
  return Math.round((e - s) / (1000 * 60))
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
  const nowUtcMs = Date.now()
  let nextColombo = toDateTimeLocalFromUtcMsAsColombo(nowUtcMs)
  const parsed = parseDateTimeLocalParts(nextColombo)
  if (!parsed) return ''

  let minute = parsed.minute
  let hour = parsed.hour
  let day = parsed.day
  let month = parsed.month
  let year = parsed.year

  const minuteRemainder = minute % 30
  if (minuteRemainder !== 0) {
    minute += 30 - minuteRemainder
    if (minute >= 60) {
      minute -= 60
      hour += 1
    }
  }

  if (hour < 8) {
    hour = 8
    minute = 0
  } else if (hour >= 22) {
    const nextDayUtcMs = parseColomboDateTimeToUtcMs(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T23:00`) + 60 * 60 * 1000
    const nextDay = toDateTimeLocalFromUtcMsAsColombo(nextDayUtcMs)
    const nextParsed = parseDateTimeLocalParts(nextDay)
    if (!nextParsed) return ''
    year = nextParsed.year
    month = nextParsed.month
    day = nextParsed.day
    hour = 8
    minute = 0
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

/**
 * Get a default end time (1 hour after the given start).
 *
 * @param {string} startTime - datetime-local string
 * @returns {string} datetime-local compatible string
 */
export function getDefaultEndTime(startTime) {
  if (!startTime) {
    const start = getDefaultStartTime()
    const startMs = parseColomboDateTimeToUtcMs(start)
    return toDateTimeLocalFromUtcMsAsColombo(startMs + 60 * 60 * 1000)
  }
  const startMs = parseColomboDateTimeToUtcMs(startTime)
  if (Number.isNaN(startMs)) return ''
  const plusHour = toDateTimeLocalFromUtcMsAsColombo(startMs + 60 * 60 * 1000)
  const hm = getColomboHourMinute(plusHour)
  if (!hm) return plusHour
  if (hm.hour > 22 || (hm.hour === 22 && hm.minute > 0)) {
    const parts = parseDateTimeLocalParts(plusHour)
    if (!parts) return plusHour
    return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}T22:00`
  }
  return plusHour
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
