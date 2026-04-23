import React, { useEffect, useState } from 'react'
import { resourceAPI } from '../../utils/api'

export default function ResourceFormModal({ open, onClose, initialData = null, onSaved = () => {} }) {
	const [form, setForm] = useState({
		name: '',
		type: 'LECTURE_HALL',
		capacity: '',
		location: '',
		description: '',
		status: 'ACTIVE',
		imageUrl: '',
	})
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState(null)

	useEffect(() => {
		if (initialData) {
			setForm({
				name: initialData.name || '',
				type: initialData.type || 'LECTURE_HALL',
				capacity: initialData.capacity ?? '',
				location: initialData.location || '',
				description: initialData.description || '',
				status: initialData.status || 'ACTIVE',
				imageUrl: initialData.imageUrl || '',
			})
		} else {
			setForm({ name: '', type: 'LECTURE_HALL', capacity: '', location: '', description: '', status: 'ACTIVE', imageUrl: '' })
		}
		setError(null)
	}, [initialData, open])

	if (!open) return null

	function update(field, value) {
		setForm((f) => ({ ...f, [field]: value }))
	}

	async function handleSubmit(e) {
		e.preventDefault()
		setError(null)

		if (!form.name || !form.location || !form.type || !form.status) {
			setError('Please fill required fields (name, type, location, status).')
			return
		}

		const payload = {
			name: form.name,
			type: form.type,
			capacity: form.capacity ? Number(form.capacity) : null,
			location: form.location,
			description: form.description,
			status: form.status,
			imageUrl: form.imageUrl,
		}

		try {
			setSaving(true)
			let resp
			if (initialData && initialData.id) {
				resp = await resourceAPI.update(initialData.id, payload)
			} else {
				resp = await resourceAPI.create(payload)
			}

			if (!resp.ok) {
				const body = await resp.json().catch(() => ({}))
				throw new Error(body.message || `Request failed (${resp.status})`)
			}

			const saved = await resp.json()
			onSaved(saved)
			onClose()
		} catch (err) {
			setError(err.message || String(err))
		} finally {
			setSaving(false)
		}
	}

	return (
		<div className="modal-overlay">
			<div className="modal-box">
				<div className="modal-header">
					<h3>{initialData ? 'Edit Resource' : 'Create Resource'}</h3>
					<button onClick={onClose}>✕</button>
				</div>
				<form className="modal-body" onSubmit={handleSubmit}>
					{error && <div className="form-error">{error}</div>}

					<div style={{ display: 'grid', gap: '0.5rem' }}>
						<input placeholder="Name" value={form.name} onChange={(e) => update('name', e.target.value)} />
						<select value={form.type} onChange={(e) => update('type', e.target.value)}>
							<option value="LECTURE_HALL">Lecture Hall</option>
							<option value="LAB">Lab</option>
							<option value="MEETING_ROOM">Meeting Room</option>
							<option value="EQUIPMENT">Equipment</option>
						</select>
						<input placeholder="Capacity" type="number" value={form.capacity} onChange={(e) => update('capacity', e.target.value)} />
						<input placeholder="Location" value={form.location} onChange={(e) => update('location', e.target.value)} />
						<input placeholder="Image URL" value={form.imageUrl} onChange={(e) => update('imageUrl', e.target.value)} />
						<textarea placeholder="Description" value={form.description} onChange={(e) => update('description', e.target.value)} />

						<select value={form.status} onChange={(e) => update('status', e.target.value)}>
							<option value="ACTIVE">Active</option>
							<option value="OUT_OF_SERVICE">Out Of Service</option>
							<option value="UNDER_MAINTENANCE">Under Maintenance</option>
						</select>
					</div>

					<div className="modal-footer">
						<button type="button" onClick={onClose} disabled={saving}>
							Cancel
						</button>
						<button type="submit" disabled={saving} className="btn-primary">
							{saving ? 'Saving...' : 'Save'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}
