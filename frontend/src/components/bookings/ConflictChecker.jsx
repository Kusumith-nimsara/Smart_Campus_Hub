import { useState, useEffect, useCallback } from 'react'
import { checkConflicts } from '../../utils/bookingAPI'
import { formatTimeRange } from '../../utils/dateUtils'
import './ConflictChecker.css'

/**
 * ConflictChecker — Real-time availability check for a resource + time slot.
 *
 * @param {Object}   props
 * @param {string}   props.resourceId - Resource MongoDB ID
 * @param {string}   props.startTime  - Start datetime-local string
 * @param {string}   props.endTime    - End datetime-local string
 * @param {Function} props.onConflictChange - Callback with conflict status (boolean)
 */
export default function ConflictChecker({ enabled = true, resourceId, startTime, endTime, onConflictChange }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  function toApiLocalDateTime(value) {
    if (!value || typeof value !== 'string') return ''
    return value.length === 16 ? `${value}:00` : value
  }

  function rangesOverlap(rangeStart, rangeEnd, slotStart, slotEnd) {
    const aStart = new Date(rangeStart).getTime()
    const aEnd = new Date(rangeEnd).getTime()
    const bStart = new Date(slotStart).getTime()
    const bEnd = new Date(slotEnd).getTime()
    if ([aStart, aEnd, bStart, bEnd].some((value) => Number.isNaN(value))) return false
    return aStart < bEnd && bStart < aEnd
  }

  const doCheck = useCallback(async () => {
    if (!enabled || !resourceId || !startTime || !endTime) {
      setResult(null)
      setError('')
      if (onConflictChange) {
        onConflictChange(false)
      }
      return
    }

    const apiStart = toApiLocalDateTime(startTime)
    const apiEnd = toApiLocalDateTime(endTime)

    setLoading(true)
    setError('')

    try {
      const data = await checkConflicts(resourceId, apiStart, apiEnd)
      const localOverlap = Array.isArray(data?.conflicts)
        ? data.conflicts.some((conflict) => rangesOverlap(conflict?.startTime, conflict?.endTime, apiStart, apiEnd))
        : false
      const normalizedResult = {
        ...data,
        hasConflict: Boolean(data?.hasConflict || localOverlap),
      }
      setResult(normalizedResult)
      if (onConflictChange) {
        onConflictChange(normalizedResult.hasConflict)
      }
    } catch (err) {
      setError(err.message || 'Failed to check availability')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }, [enabled, resourceId, startTime, endTime, onConflictChange])

  // Debounce the check when inputs change
  useEffect(() => {
    if (!enabled || !resourceId || !startTime || !endTime) {
      setResult(null)
      setError('')
      if (onConflictChange) {
        onConflictChange(false)
      }
      return
    }

    const timer = setTimeout(doCheck, 600)
    return () => clearTimeout(timer)
  }, [enabled, resourceId, startTime, endTime, doCheck, onConflictChange])

  // Don't render anything if inputs are missing
  if (!enabled || !resourceId || !startTime || !endTime) return null

  return (
    <div className="conflict-checker">
      {loading && (
        <div className="conflict-loading">
          <span className="conflict-spinner"></span>
          <span>Checking availability...</span>
        </div>
      )}

      {error && (
        <div className="conflict-error">
          <span className="conflict-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && result && !result.hasConflict && (
        <div className="conflict-available">
          <span className="conflict-icon">✅</span>
          <span>Time slot is available!</span>
        </div>
      )}

      {!loading && !error && result && result.hasConflict && (
        <div className="conflict-found">
          <div className="conflict-header">
            <span className="conflict-icon">❌</span>
            <span className="conflict-title">
              {result.conflictCount} conflicting booking{result.conflictCount !== 1 ? 's' : ''} found
            </span>
          </div>
          {result.conflicts && result.conflicts.length > 0 && (
            <ul className="conflict-list">
              {result.conflicts.map((c, idx) => (
                <li key={c.id || idx} className="conflict-item">
                  <span className="conflict-item-time">
                    {formatTimeRange(c.startTime, c.endTime)}
                  </span>
                  <span className="conflict-item-status">{c.status}</span>
                  {c.purpose && <span className="conflict-item-purpose">{c.purpose}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
