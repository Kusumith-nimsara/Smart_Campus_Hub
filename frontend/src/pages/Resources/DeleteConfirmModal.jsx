import React, { useState } from 'react'
import { resourceAPI } from '../../utils/api'

export default function DeleteConfirmModal({ open, onClose, resourceName = '', resourceId = null, onDeleted = () => {} }) {
	const [deleting, setDeleting] = useState(false)
	const [error, setError] = useState(null)

	if (!open) return null

	async function confirm() {
		if (!resourceId) return
		setError(null)
		setDeleting(true)
		try {
			const resp = await resourceAPI.delete(resourceId)
			if (!resp.ok) {
				const body = await resp.json().catch(() => ({}))
				throw new Error(body.message || `Delete failed (${resp.status})`)
			}
			onDeleted(resourceId)
			onClose()
		} catch (err) {
			setError(err.message || String(err))
		} finally {
			setDeleting(false)
		}
	}

	return (
		<div className="modal-overlay">
			<div className="modal-box">
				<div className="modal-header">
					<h3>Confirm Deletion</h3>
					<button onClick={onClose}>✕</button>
				</div>
				<div className="modal-body">
					{error && <div className="form-error">{error}</div>}
					<p>Are you sure you want to delete <strong>{resourceName}</strong>?</p>
				</div>
				<div className="modal-footer">
					<button onClick={onClose} disabled={deleting}>Cancel</button>
					<button onClick={confirm} className="btn-danger" disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</button>
				</div>
			</div>
		</div>
	)
}
