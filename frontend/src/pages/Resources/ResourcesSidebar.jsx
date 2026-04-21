import React, { useEffect, useState } from 'react'

const RESOURCE_TYPES = [
  { value: '', label: 'Any' },
  { value: 'LECTURE_HALL', label: 'Lecture Hall' },
  { value: 'LAB', label: 'Lab' },
  { value: 'MEETING_ROOM', label: 'Meeting Room' },
  { value: 'EQUIPMENT', label: 'Equipment' },
]

const RESOURCE_STATUSES = [
  { value: '', label: 'Any' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'OUT_OF_SERVICE', label: 'Out of service' },
  { value: 'UNDER_MAINTENANCE', label: 'Under maintenance' },
]

export default function ResourcesSidebar({ initialFilters = {}, onApply = () => {}, onClear = () => {} }) {
  const [type, setType] = useState(initialFilters.type || '')
  const [status, setStatus] = useState(initialFilters.status || '')
  const [location, setLocation] = useState(initialFilters.location || '')
  const [minCapacity, setMinCapacity] = useState(initialFilters.minCapacity || '')
  const [search, setSearch] = useState(initialFilters.search || '')

  useEffect(() => {
    setType(initialFilters.type || '')
    setStatus(initialFilters.status || '')
    setLocation(initialFilters.location || '')
    setMinCapacity(initialFilters.minCapacity || '')
    setSearch(initialFilters.search || '')
  }, [initialFilters])

  function apply(e) {
    e?.preventDefault()
    onApply({ type, status, location, minCapacity: minCapacity ? String(minCapacity) : '', search })
  }

  function clearAll(e) {
    e?.preventDefault()
    setType('')
    setStatus('')
    setLocation('')
    setMinCapacity('')
    setSearch('')
    onClear()
  }

  return (
    <div className="resources-sidebar">
      <h3 style={{ marginTop: 0 }}>Filters</h3>
      <form onSubmit={apply}>
        <div className="filter-field">
          <label>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {RESOURCE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {RESOURCE_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label>Location</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />
        </div>

        <div className="filter-field">
          <label>Min capacity</label>
          <input type="number" min="0" value={minCapacity} onChange={(e) => setMinCapacity(e.target.value)} placeholder="0" />
        </div>

        <div className="filter-field">
          <label>Search</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or description" />
        </div>

        <div className="sidebar-actions" style={{ marginTop: '0.75rem' }}>
          <button type="submit" className="btn-primary">Apply</button>
          <button type="button" className="btn-primary btn-primary-white" onClick={clearAll}>Clear</button>
        </div>
      </form>
    </div>
  )
}
