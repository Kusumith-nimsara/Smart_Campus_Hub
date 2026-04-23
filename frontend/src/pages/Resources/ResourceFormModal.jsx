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
					<div className="modal-header-content">
						<h3 className="modal-title">{initialData ? 'Edit Resource' : 'Create Resource'}</h3>
					</div>
					<button className="modal-close-btn" onClick={onClose} type="button" aria-label="Close modal">
						✕
					</button>
				</div>
				<form className="modal-body modal-form" onSubmit={handleSubmit}>
					{error && <div className="form-error">{error}</div>}

					{/* Name - Full Width */}
					<div className="form-group form-group-full">
						<label htmlFor="name">Name *</label>
						<input 
							id="name"
							type="text"
							placeholder="Enter resource name"
							value={form.name} 
							onChange={(e) => update('name', e.target.value)} 
						/>
					</div>

					{/* Type & Status - 2 Columns */}
					<div className="form-row">
						<div className="form-group">
							<label htmlFor="type">Type *</label>
							<select id="type" value={form.type} onChange={(e) => update('type', e.target.value)}>
								<option value="LECTURE_HALL">Lecture Hall</option>
								<option value="LAB">Lab</option>
								<option value="MEETING_ROOM">Meeting Room</option>
								<option value="EQUIPMENT">Equipment</option>
							</select>
						</div>
						<div className="form-group">
							<label htmlFor="status">Status *</label>
							<select id="status" value={form.status} onChange={(e) => update('status', e.target.value)}>
								<option value="ACTIVE">Active</option>
								<option value="OUT_OF_SERVICE">Out of Service</option>
								<option value="UNDER_MAINTENANCE">Under Maintenance</option>
							</select>
						</div>
					</div>

					{/* Capacity & Location - 2 Columns */}
					<div className="form-row">
						<div className="form-group">
							<label htmlFor="capacity">Capacity</label>
							<input 
								id="capacity"
								type="number"
								placeholder="Enter capacity"
								min="0"
								value={form.capacity} 
								onChange={(e) => update('capacity', e.target.value)} 
							/>
						</div>
						<div className="form-group">
							<label htmlFor="location">Location *</label>
							<input 
								id="location"
								type="text"
								placeholder="Enter location"
								value={form.location} 
								onChange={(e) => update('location', e.target.value)} 
							/>
						</div>
					</div>

					{/* Image URL - Full Width */}
					<div className="form-group form-group-full">
						<label htmlFor="imageUrl">Image URL</label>
						<input 
							id="imageUrl"
							type="url"
							placeholder="https://example.com/image.jpg"
							value={form.imageUrl} 
							onChange={(e) => update('imageUrl', e.target.value)} 
						/>
					</div>

					{/* Description - Full Width */}
					<div className="form-group form-group-full">
						<label htmlFor="description">Description</label>
						<textarea 
							id="description"
							placeholder="Enter resource description"
							rows="4"
							value={form.description} 
							onChange={(e) => update('description', e.target.value)} 
						/>
					</div>

					<div className="modal-footer">
						<button type="button" className="btn-cancel" onClick={onClose} disabled={saving}>
							Cancel
						</button>
						<button type="submit" className="btn-save" disabled={saving}>
							{saving ? 'Saving...' : 'Save'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}
