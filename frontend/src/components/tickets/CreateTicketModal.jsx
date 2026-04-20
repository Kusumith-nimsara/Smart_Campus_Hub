import { useState } from 'react'
import { ticketAPI } from '../../services/ticketAPI'
import { showError, showSuccess } from '../../utils/alerts'
import './CreateTicketModal.css'

const PRESET_CATEGORIES = ['Projector', 'Furniture', 'Electrical', 'Door Lock']
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export default function CreateTicketModal({ isOpen, onClose, onTicketCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    customCategory: '',
    priority: 'MEDIUM',
    resourceLocation: '',
  })
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'category' && value !== 'Other' ? { customCategory: '' } : {})
    }))
  }

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files)
    
    if (images.length + files.length > 3) {
      showError('Error', 'Maximum 3 images allowed')
      return
    }

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        showError('Error', `${file.name} exceeds 5MB limit`)
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        setImages(prev => [...prev, event.target.result])
        setImagePreviews(prev => [...prev, event.target.result])
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const category = formData.category === 'Other' ? formData.customCategory : formData.category
      
      if (!formData.title.trim()) {
        showError('Error', 'Title is required')
        return
      }
      if (!formData.description.trim() || formData.description.length < 10) {
        showError('Error', 'Description must be at least 10 characters')
        return
      }
      if (!category.trim()) {
        showError('Error', 'Category is required')
        return
      }
      if (!formData.resourceLocation.trim()) {
        showError('Error', 'Resource location is required')
        return
      }

      // Create ticket
      const ticketResponse = await ticketAPI.createTicket({
        title: formData.title,
        description: formData.description,
        category,
        priority: formData.priority,
        resourceLocation: formData.resourceLocation,
      })

      // Upload images if any
      for (const image of images) {
        await ticketAPI.uploadImage(ticketResponse.id, image)
      }

      showSuccess('Success', 'Ticket created successfully')
      onTicketCreated()
      resetForm()
      onClose()
    } catch (error) {
      showError('Error', error.message || 'Failed to create ticket')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      customCategory: '',
      priority: 'MEDIUM',
      resourceLocation: '',
    })
    setImages([])
    setImagePreviews([])
  }

  return (
    <div className="ticket-modal-overlay" onClick={onClose}>
      <div className="ticket-modal" onClick={e => e.stopPropagation()}>
        <div className="ticket-modal-header">
          <h2>🎫 Create New Ticket</h2>
          <button type="button" className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="ticket-form">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Brief description of the issue"
              maxLength={255}
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Detailed description of the problem (minimum 10 characters)"
              rows={4}
              maxLength={5000}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Priority *</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                required
              >
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                {PRESET_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="Other">Other (Custom)</option>
              </select>
            </div>
          </div>

          {formData.category === 'Other' && (
            <div className="form-group">
              <label>Specify Category *</label>
              <input
                type="text"
                name="customCategory"
                value={formData.customCategory}
                onChange={handleInputChange}
                placeholder="Enter custom category"
                maxLength={255}
              />
            </div>
          )}

          <div className="form-group">
            <label>Resource Location *</label>
            <input
              type="text"
              name="resourceLocation"
              value={formData.resourceLocation}
              onChange={handleInputChange}
              placeholder="e.g., Room 101, Building A"
              maxLength={255}
              required
            />
          </div>

          <div className="form-group">
            <label>Attach Images (Max 3, 5MB each)</label>
            <div className="image-upload-area">
              <input
                type="file"
                id="image-input"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                disabled={images.length >= 3}
                style={{ display: 'none' }}
              />
              <label htmlFor="image-input" className="upload-label">
                📸 Click to select or drag images here
              </label>
              <p className="upload-hint">
                {images.length}/3 images selected
              </p>
            </div>

            {imagePreviews.length > 0 && (
              <div className="image-previews">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="image-preview">
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => removeImage(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
