import { useEffect, useMemo, useState } from 'react'
import { resourceAPI } from '../../utils/api'
import { showError } from '../../utils/alerts'
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
  const [resourceType, setResourceType] = useState('')
  const [resourceId, setResourceId] = useState('')
  const [resourceLocation, setResourceLocation] = useState('')
  const [userId, setUserId] = useState('')
  const [activeResources, setActiveResources] = useState([])

  useEffect(() => {
    let mounted = true

    async function loadActiveResources() {
      try {
        const response = await resourceAPI.getAll({ status: 'ACTIVE' })
        if (!response.ok) {
          throw new Error('Failed to load resources')
        }
        const data = await response.json()
        if (mounted) {
          setActiveResources(Array.isArray(data) ? data : [])
        }
      } catch {
        if (mounted) {
          setActiveResources([])
        }
      }
    }

    loadActiveResources()
    return () => {
      mounted = false
    }
  }, [])

  const resourceTypes = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT']

  const resourcesForSelectedType = useMemo(() => {
    if (!resourceType) return []
    return activeResources.filter((resource) => String(resource?.type || '') === resourceType)
  }, [activeResources, resourceType])

  function handleApply() {
    const hasAnyInput =
      Boolean(status) ||
      Boolean(fromDate) ||
      Boolean(toDate) ||
      Boolean(resourceType) ||
      Boolean(resourceId) ||
      (isAdmin && Boolean(userId))

    if (!hasAnyInput) {
      showError('Invalid inputs', 'Select at least one filter value before applying.')
      return
    }

    if (resourceType && !resourceId) {
      showError('Invalid inputs', 'Select a valid resource name for the selected type.')
      return
    }

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
    setResourceType('')
    setResourceId('')
    setResourceLocation('')
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
          <label htmlFor="filter-resource-type">Type</label>
          <select
            id="filter-resource-type"
            value={resourceType}
            onChange={(e) => {
              setResourceType(e.target.value)
              setResourceId('')
              setResourceLocation('')
            }}
          >
            <option value="">All Types</option>
            {resourceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-resource-name">Resource Name</label>
          <select
            id="filter-resource-name"
            value={resourceId}
            onChange={(e) => {
              const selectedId = e.target.value
              setResourceId(selectedId)
              const selectedResource = resourcesForSelectedType.find((resource) => String(resource?.id) === String(selectedId))
              setResourceLocation(selectedResource?.location || '')
            }}
            disabled={!resourceType}
          >
            <option value="">{resourceType ? 'Select resource name' : 'Select type first'}</option>
            {resourcesForSelectedType.map((resource) => (
              <option key={resource.id} value={resource.id}>
                {resource.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-resource-location">Location</label>
          <input
            id="filter-resource-location"
            type="text"
            value={resourceLocation}
            placeholder="Auto from selected name"
            readOnly
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
