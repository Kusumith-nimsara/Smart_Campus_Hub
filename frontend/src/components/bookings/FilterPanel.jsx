import { useState } from 'react'
import './FilterPanel.css'

/**
 * FilterPanel — Filter controls for booking lists.
 *
 * @param {Object}   props
 * @param {Function} props.onFilter   - Called with filter object
 * @param {boolean}  props.isAdmin    - Show admin-specific filters
 * @param {Function} props.onClear    - Clear filters handler
 */
export default function FilterPanel({ onFilter, isAdmin, onClear }) {
  const [status, setStatus] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [resourceId, setResourceId] = useState('')
  const [userId, setUserId] = useState('')

  function handleApply() {
    const filters = {}
    if (status) filters.status = status
    if (fromDate) filters.fromDate = fromDate
    if (toDate) filters.toDate = toDate
    if (resourceId) filters.resourceId = resourceId
    if (isAdmin && userId) filters.userId = userId
    onFilter(filters)
  }

  function handleClear() {
    setStatus('')
    setFromDate('')
    setToDate('')
    setResourceId('')
    setUserId('')
    if (onClear) onClear()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleApply()
  }

  return (
    <div className="filter-panel">
      <div className="filter-row">
        <div className="filter-group">
          <label htmlFor="filter-status">Status</label>
          <select
            id="filter-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-from">From Date</label>
          <input
            id="filter-from"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="filter-to">To Date</label>
          <input
            id="filter-to"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="filter-resource">Resource ID</label>
          <input
            id="filter-resource"
            type="text"
            placeholder="Resource ID"
            value={resourceId}
            onChange={(e) => setResourceId(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {isAdmin && (
          <div className="filter-group">
            <label htmlFor="filter-user">User</label>
            <input
              id="filter-user"
              type="text"
              placeholder="Username"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        )}

        <div className="filter-actions">
          <button type="button" className="filter-btn-apply" onClick={handleApply}>
            Apply
          </button>
          <button type="button" className="filter-btn-clear" onClick={handleClear}>
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}
