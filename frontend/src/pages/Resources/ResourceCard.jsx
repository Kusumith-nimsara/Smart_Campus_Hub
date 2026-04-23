import React from 'react'

const STATUS_CLASS = {
	ACTIVE: 'status-active',
	OUT_OF_SERVICE: 'status-out',
	UNDER_MAINTENANCE: 'status-maint',
}

const TYPE_LABEL = {
	LECTURE_HALL: 'Lecture Hall',
	LAB: 'Lab',
	MEETING_ROOM: 'Meeting Room',
	EQUIPMENT: 'Equipment',
}

export default function ResourceCard({ resource, isAdmin = false, onEdit = () => {}, onDelete = () => {} }) {
	const typeLabel = TYPE_LABEL[resource.type] || resource.type

	return (
		<article className="resource-card">
			<div className="resource-card-top">
				<div className="resource-header-left">
					<strong className="resource-name">{resource.name}</strong>
					<span className="resource-type-badge">{typeLabel}</span>
				</div>
				{isAdmin && (
					<div className="resource-actions">
						<button 
							type="button" 
							onClick={() => onEdit(resource)} 
							className="icon-button icon-edit"
							title="Edit"
							aria-label="Edit resource"
						>
							✎
						</button>
						<button 
							type="button" 
							onClick={() => onDelete(resource)} 
							className="icon-button icon-delete"
							title="Delete"
							aria-label="Delete resource"
						>
							🗑
						</button>
					</div>
				)}
			</div>

			<div className="resource-card-body">
				<div className="resource-description-clamp">{resource.description || '—'}</div>

				<div className="resource-details">
					<div className="detail-item">
						<span className="detail-label">Capacity:</span>
						<span className="detail-value">{resource.capacity ?? '—'}</span>
					</div>
					<div className="detail-item">
						<span className="detail-label">Location:</span>
						<span className="detail-value">{resource.location || '—'}</span>
					</div>
				</div>
			</div>

			<div className="resource-card-footer">
				<span className={`resource-status ${STATUS_CLASS[resource.status] || ''}`}>
					{resource.status}
				</span>
				<small className="created-by">by {resource.createdBy || '—'}</small>
			</div>
		</article>
	)
}
