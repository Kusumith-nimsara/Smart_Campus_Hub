import { useState, useEffect } from 'react'
import { validateBookingForm, hasErrors } from '../../utils/validationUtils'
import { getDefaultStartTime, getDefaultEndTime } from '../../utils/dateUtils'
import ConflictChecker from './ConflictChecker'
import { resourceAPI } from '../../utils/api'
import './BookingForm.css'

/**
 * BookingForm — Full booking creation form with real-time validation and conflict checking.
 *
 * @param {Object}   props
 * @param {Function} props.onSubmit    - Called with validated form data
 * @param {boolean}  props.isSubmitting - Loading state during submission
 * @param {Array}    props.resources   - Optional list of resources for dropdown
 */
export default function BookingForm({ onSubmit, isSubmitting, resources = [] }) {
  const [formData, setFormData] = useState({
    resourceType: '',
    resourceLocation: '',
    resourceId: '',
    startTime: getDefaultStartTime(),
    endTime: getDefaultEndTime(getDefaultStartTime()),
    purpose: '',
    attendees: 1,
    contactDetails: '',
  })

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [hasConflict, setHasConflict] = useState(false)
  const [resourceOptions, setResourceOptions] = useState([])

  // Pre-fill contact with stored email if available
  useEffect(() => {
    const savedEmail = localStorage.getItem('authEmail') || localStorage.getItem('username') || ''
    if (savedEmail && savedEmail.includes('@')) {
      setFormData(prev => ({ ...prev, contactDetails: savedEmail }))
    }
  }, [])

  useEffect(() => {
    let mounted = true

    async function loadActiveResources() {
      if (resources.length > 0) {
        setResourceOptions(resources.filter((resource) => String(resource?.status || '').toUpperCase() === 'ACTIVE'))
        return
      }

      try {
        const response = await resourceAPI.getAll({ status: 'ACTIVE' })
        if (!response.ok) {
          throw new Error('Failed to load resources')
        }
        const data = await response.json()
        if (mounted) {
          setResourceOptions(Array.isArray(data) ? data : [])
        }
      } catch {
        if (mounted) {
          setResourceOptions([])
        }
      }
    }

    loadActiveResources()
    return () => {
      mounted = false
    }
  }, [resources])

  const resourceTypes = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT']
  const locationOptions = Array.from(
    new Set(
      resourceOptions
        .filter((resource) => String(resource?.type || '') === formData.resourceType)
        .map((resource) => String(resource?.location || '').trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b))

  const resourcesForSelectedType = resourceOptions.filter(
    (resource) =>
      String(resource?.type || '') === formData.resourceType &&
      (!formData.resourceLocation || String(resource?.location || '') === formData.resourceLocation)
  )

  function validateForm(nextFormData = formData) {
    return validateBookingForm(nextFormData)
  }

  function handleInputChange(e) {
    const { name, value, type } = e.target
    const newValue = type === 'number' ? (value === '' ? '' : Number(value)) : value

    setFormData(prev => {
      const updated = { ...prev, [name]: newValue }

      if (name === 'resourceType') {
        updated.resourceLocation = ''
        updated.resourceId = ''
      }
      if (name === 'resourceLocation') {
        updated.resourceId = ''
      }

      // Auto-adjust end time when start time changes
      if (name === 'startTime' && value) {
        const startDate = new Date(value)
        const endDate = new Date(updated.endTime)
        if (isNaN(endDate.getTime()) || endDate <= startDate) {
          updated.endTime = getDefaultEndTime(value)
        }
      }

      // Re-validate time fields immediately whenever either time changes.
      if (name === 'startTime' || name === 'endTime') {
        const nextErrors = validateForm(updated)
        setTouched((prevTouched) => ({ ...prevTouched, startTime: true, endTime: true }))
        setErrors((prevErrors) => ({
          ...prevErrors,
          ...(nextErrors.startTime ? { startTime: nextErrors.startTime } : { startTime: undefined }),
          ...(nextErrors.endTime ? { endTime: nextErrors.endTime } : { endTime: undefined }),
        }))
      }

      return updated
    })

    // Clear field error on change
    if (errors[name]) {
      setErrors(prev => {
        const updated = { ...prev }
        delete updated[name]
        return updated
      })
    }
  }

  function handleBlur(e) {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))

    // Validate on blur
    const allErrors = validateForm(formData)
    if (allErrors[name]) {
      setErrors(prev => ({ ...prev, [name]: allErrors[name] }))
    }
  }

  function handleSubmit(e) {
    e.preventDefault()

    // Mark all as touched
    const allTouched = {}
    Object.keys(formData).forEach(key => { allTouched[key] = true })
    setTouched(allTouched)

    // Validate
    const allErrors = validateForm(formData)
    setErrors(allErrors)

    if (hasErrors(allErrors)) return
    if (hasConflict) return

    const payload = {
      resourceId: formData.resourceId,
      startTime: formData.startTime,
      endTime: formData.endTime,
      purpose: formData.purpose.trim(),
      attendees: formData.attendees,
      contactDetails: formData.contactDetails,
    }

    onSubmit(payload)
  }

  const allValidationErrors = validateForm(formData)
  const canCheckAvailability =
    Boolean(formData.resourceId && formData.startTime && formData.endTime) &&
    !allValidationErrors.startTime &&
    !allValidationErrors.endTime
  const isFormValid = !hasErrors(allValidationErrors) && !hasConflict

  return (
    <form className="booking-form" onSubmit={handleSubmit} noValidate>
      {/* Resource Selector */}
      <div className="booking-form-row">
        <div className="booking-form-group">
          <label htmlFor="bf-resource-type">🏷 Resource Type</label>
          <select
            id="bf-resource-type"
            name="resourceType"
            value={formData.resourceType}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={touched.resourceType && errors.resourceType ? 'input-error' : ''}
          >
            <option value="">Select resource type</option>
            {resourceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {touched.resourceType && errors.resourceType && (
            <p className="booking-field-error">{errors.resourceType}</p>
          )}
        </div>

        <div className="booking-form-group">
          <label htmlFor="bf-resource-location">📍 Location</label>
          <select
            id="bf-resource-location"
            name="resourceLocation"
            value={formData.resourceLocation}
            onChange={handleInputChange}
            onBlur={handleBlur}
            disabled={!formData.resourceType}
            className={touched.resourceLocation && errors.resourceLocation ? 'input-error' : ''}
          >
            <option value="">
              {formData.resourceType ? 'Select location' : 'Select type first'}
            </option>
            {locationOptions.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
          {touched.resourceLocation && errors.resourceLocation && (
            <p className="booking-field-error">{errors.resourceLocation}</p>
          )}
        </div>
      </div>

      <div className="booking-form-row booking-form-row-single-center">
        <div className="booking-form-group">
          <label htmlFor="bf-resource-name">🏢 Resource Name</label>
          <select
            id="bf-resource-name"
            name="resourceId"
            value={formData.resourceId}
            onChange={handleInputChange}
            onBlur={handleBlur}
            disabled={!formData.resourceType || !formData.resourceLocation}
            className={touched.resourceId && errors.resourceId ? 'input-error' : ''}
          >
            <option value="">
              {formData.resourceType && formData.resourceLocation
                ? 'Select resource name'
                : 'Select type and location first'}
            </option>
            {resourcesForSelectedType.map((resource) => (
              <option key={resource.id} value={resource.id}>
                {resource.name}
              </option>
            ))}
          </select>
          {touched.resourceId && errors.resourceId && (
            <p className="booking-field-error">{errors.resourceId}</p>
          )}
        </div>
      </div>

      {/* Date/Time Row */}
      <div className="booking-form-row">
        <div className="booking-form-group">
          <label htmlFor="bf-start">📅 Start Time</label>
          <input
            id="bf-start"
            name="startTime"
            type="datetime-local"
            value={formData.startTime}
            onChange={handleInputChange}
            onBlur={handleBlur}
            min={getDefaultStartTime()}
            className={touched.startTime && errors.startTime ? 'input-error' : ''}
          />
          {touched.startTime && errors.startTime && (
            <p className="booking-field-error">{errors.startTime}</p>
          )}
        </div>

        <div className="booking-form-group">
          <label htmlFor="bf-end">📅 End Time</label>
          <input
            id="bf-end"
            name="endTime"
            type="datetime-local"
            value={formData.endTime}
            onChange={handleInputChange}
            onBlur={handleBlur}
            min={formData.startTime || getDefaultStartTime()}
            className={touched.endTime && errors.endTime ? 'input-error' : ''}
          />
          {touched.endTime && errors.endTime && (
            <p className="booking-field-error">{errors.endTime}</p>
          )}
        </div>
      </div>

      {/* Conflict Checker */}
      <ConflictChecker
        enabled={canCheckAvailability}
        resourceId={formData.resourceId}
        startTime={formData.startTime}
        endTime={formData.endTime}
        onConflictChange={setHasConflict}
      />

      {/* Purpose */}
      <div className="booking-form-group">
        <label htmlFor="bf-purpose">📝 Purpose</label>
        <textarea
          id="bf-purpose"
          name="purpose"
          placeholder="Describe the purpose of your booking (optional)"
          value={formData.purpose}
          onChange={handleInputChange}
          onBlur={handleBlur}
          rows={3}
          maxLength={500}
          className={touched.purpose && errors.purpose ? 'input-error' : ''}
        />
        <div className="booking-form-meta">
          {touched.purpose && errors.purpose && (
            <p className="booking-field-error">{errors.purpose}</p>
          )}
          <span className="booking-char-count">{formData.purpose.length}/500</span>
        </div>
      </div>

      {/* Attendees & Contact Row */}
      <div className="booking-form-row">
        <div className="booking-form-group">
          <label htmlFor="bf-attendees">👥 Number of Attendees</label>
          <input
            id="bf-attendees"
            name="attendees"
            type="number"
            min={1}
            max={500}
            value={formData.attendees}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={touched.attendees && errors.attendees ? 'input-error' : ''}
          />
          {touched.attendees && errors.attendees && (
            <p className="booking-field-error">{errors.attendees}</p>
          )}
        </div>

        <div className="booking-form-group">
          <label htmlFor="bf-contact">📧 Contact Email</label>
          <input
            id="bf-contact"
            name="contactDetails"
            type="email"
            placeholder="your@email.com"
            value={formData.contactDetails}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={touched.contactDetails && errors.contactDetails ? 'input-error' : ''}
          />
          {touched.contactDetails && errors.contactDetails && (
            <p className="booking-field-error">{errors.contactDetails}</p>
          )}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="booking-form-submit"
        disabled={isSubmitting || !isFormValid}
      >
        {isSubmitting ? 'Submitting...' : '📅 Submit Booking Request'}
      </button>
    </form>
  )
}
