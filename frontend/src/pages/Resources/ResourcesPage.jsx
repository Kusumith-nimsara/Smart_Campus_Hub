import React, { useEffect, useState } from 'react'
import '../../styles/resources.css'
import { resourceAPI } from '../../utils/api'
import ResourceCard from './ResourceCard'
import ResourceFormModal from './ResourceFormModal'
import DeleteConfirmModal from './DeleteConfirmModal'
import ResourcesSidebar from './ResourcesSidebar'
import Sidebar from '../../components/common/Sidebar'

export default function ResourcesPage() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const isAdmin = ((localStorage.getItem('authRole') || localStorage.getItem('role') || '')).toUpperCase() === 'ADMIN'

  const [filters, setFilters] = useState({ type: '', status: '', location: '', minCapacity: '', search: '' })

  async function fetchResources(params) {
    setLoading(true)
    try {
      const resp = await resourceAPI.getAll(params)
      if (!resp.ok) throw new Error(`Failed to load resources: ${resp.status}`)
      const data = await resp.json()
      setResources(data || [])
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResources()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleApplyFilters(newFilters) {
    setFilters(newFilters)
    const params = {}
    if (newFilters.type) params.type = newFilters.type
    if (newFilters.status) params.status = newFilters.status
    if (newFilters.location) params.location = newFilters.location
    if (newFilters.minCapacity) params.minCapacity = newFilters.minCapacity
    if (newFilters.search) params.search = newFilters.search
    fetchResources(params)
  }

  function handleClearFilters() {
    const cleared = { type: '', status: '', location: '', minCapacity: '', search: '' }
    setFilters(cleared)
    fetchResources()
  }

  function openCreate() {
    setEditing(null)
    setShowForm(true)
  }

  function handleEdit(resource) {
    setEditing(resource)
    setShowForm(true)
  }

  function handleDelete(resource) {
    setDeleting(resource)
    setShowDelete(true)
  }

  function afterSaved() {
    fetchResources()
  }

  function afterDeleted() {
    fetchResources()
  }

  return (
    <main style={{ padding: '1rem' }}>
      <div className="resources-layout">
        <Sidebar isOpen={isSidebarOpen} />
        <div className="resources-content">
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Open sidebar'}
                className="sidebar-toggle-btn"
                onClick={() => setIsSidebarOpen((s) => !s)}
              >
                ☰
              </button>
              <h1>Resources</h1>
            </div>
            {isAdmin && (
              <button onClick={openCreate} className="btn-primary">
                +   New Resource
              </button>
            )}
          </header>

          <div className="resources-toolbar" style={{ marginTop: '0.75rem' }}>
            <ResourcesSidebar initialFilters={filters} onApply={handleApplyFilters} onClear={handleClearFilters} />
          </div>

          <section style={{ marginTop: '0.75rem' }}>
            {loading && <div>Loading resources…</div>}
            {error && <div style={{ color: 'crimson' }}>Error: {error}</div>}

            {!loading && !error && resources.length === 0 && (
              <div className="empty-state">No resources found.</div>
            )}

            {!loading && !error && resources.length > 0 && (
              <div className="resources-grid">
                {resources.map((r) => (
                  <ResourceCard key={r.id} resource={r} isAdmin={isAdmin} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <ResourceFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        initialData={editing}
        onSaved={afterSaved}
      />

      <DeleteConfirmModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        resourceName={deleting?.name}
        resourceId={deleting?.id}
        onDeleted={afterDeleted}
      />
    </main>
  )
}
