import React from 'react'

const STATUS_CLASS = {
	ACTIVE: 'status-active',
	OUT_OF_SERVICE: 'status-out',
	UNDER_MAINTENANCE: 'status-maint',
}

export default function ResourceCard({ resource, isAdmin = false, onEdit = () => {}, onDelete = () => {} }) {
	return (
		<article className="resource-card">
			<div className="resource-card-body">
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<strong className="resource-name">{resource.name}</strong>
					<span className={`resource-status ${STATUS_CLASS[resource.status] || ''}`}>{resource.status}</span>
				</div>

				<div className="resource-description-clamp">{resource.description || '—'}</div>

				<div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#374151' }}>
					<div>Type: {resource.type}</div>
					<div>Capacity: {resource.capacity ?? '—'}</div>
					<div>Location: {resource.location || '—'}</div>
				</div>

				<div className="resource-bottom">
					<small>Created by: {resource.createdBy || '—'}</small>
					<div style={{ display: 'flex', gap: '0.5rem' }}>
						{isAdmin && (
							<button type="button" onClick={() => onEdit(resource)} className="btn-primary">
								Edit
							</button>
						)}
						{isAdmin && (
							<button type="button" onClick={() => onDelete(resource)} className="btn-danger">
								Delete
							</button>
						)}
					</div>
				</div>
			</div>
		</article>
	)
}
