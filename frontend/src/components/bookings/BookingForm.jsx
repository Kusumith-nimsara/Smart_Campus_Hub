import { useState, useEffect } from 'react'
import { validateBookingForm, hasErrors } from '../../utils/validationUtils'
import { getDefaultStartTime, getDefaultEndTime } from '../../utils/dateUtils'
import ConflictChecker from './ConflictChecker'
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

  // Pre-fill contact with stored email if available
  useEffect(() => {
    const savedEmail = localStorage.getItem('authEmail') || localStorage.getItem('username') || ''
    if (savedEmail && savedEmail.includes('@')) {
      setFormData(prev => ({ ...prev, contactDetails: savedEmail }))
    }
  }, [])

  function handleChange(e) {
    const { name, value, type } = e.target
    const newValue = type === 'number' ? (value === '' ? '' : Number(value)) : value

    setFormData(prev => {
      const updated = { ...prev, [name]: newValue }

      // Auto-adjust end time when start time changes
      if (name === 'startTime' && value) {
        const startDate = new Date(value)
        const endDate = new Date(updated.endTime)
        if (isNaN(endDate.getTime()) || endDate <= startDate) {
          updated.endTime = getDefaultEndTime(value)
        }
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
    const allErrors = validateBookingForm(formData)
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
    const allErrors = validateBookingForm(formData)
    setErrors(allErrors)

    if (hasErrors(allErrors)) return
    if (hasConflict) return

    onSubmit(formData)
  }

  const isFormValid = !hasErrors(validateBookingForm(formData)) && !hasConflict

  return (
    <form className="booking-form" onSubmit={handleSubmit} noValidate>
      {/* Resource Selector */}
      <div className="booking-form-group">
        <label htmlFor="bf-resource">🏢 Resource</label>
        {resources.length > 0 ? (
          <select
            id="bf-resource"
            name="resourceId"
            value={formData.resourceId}
            onChange={handleChange}
            onBlur={handleBlur}
            className={touched.resourceId && errors.resourceId ? 'input-error' : ''}
          >
            <option value="">Select a resource...</option>
            {resources.map(r => (
              <option key={r.id} value={r.id}>
                {r.name} — {r.type} ({r.location || 'N/A'})
              </option>
            ))}
          </select>
        ) : (
          <input
            id="bf-resource"
            name="resourceId"
            type="text"
            placeholder="Enter Resource ID"
            value={formData.resourceId}
            onChange={handleChange}
            onBlur={handleBlur}
            className={touched.resourceId && errors.resourceId ? 'input-error' : ''}
          />
        )}
        {touched.resourceId && errors.resourceId && (
          <p className="booking-field-error">{errors.resourceId}</p>
        )}
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
            onChange={handleChange}
            onBlur={handleBlur}
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
            onChange={handleChange}
            onBlur={handleBlur}
            className={touched.endTime && errors.endTime ? 'input-error' : ''}
          />
          {touched.endTime && errors.endTime && (
            <p className="booking-field-error">{errors.endTime}</p>
          )}
        </div>
      </div>

      {/* Conflict Checker */}
      <ConflictChecker
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
          placeholder="Describe the purpose of your booking (min 5 characters)..."
          value={formData.purpose}
          onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
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
