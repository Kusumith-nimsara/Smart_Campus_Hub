/**
 * Validation Utility Functions for the Booking Feature
 *
 * Provides form validation, field-level checks, and error message generation
 * for the booking creation form.
 */

import { isValidTimeRange, isPastDate } from './dateUtils'

/**
 * Validate a complete booking form and return all errors.
 *
 * @param {Object} formData
 * @param {string} formData.resourceId     - Resource ID
 * @param {string} formData.startTime      - Start datetime string
 * @param {string} formData.endTime        - End datetime string
 * @param {string} formData.purpose        - Booking purpose
 * @param {number} formData.attendees      - Number of attendees
 * @param {string} formData.contactDetails - Contact email
 * @returns {Object} errors object — empty if valid, keyed by field name
 */
export function validateBookingForm(formData) {
  const errors = {}

  // Resource ID
  if (!formData.resourceId || !formData.resourceId.trim()) {
    errors.resourceId = 'Please select a resource'
  }

  // Start Time
  if (!formData.startTime) {
    errors.startTime = 'Start time is required'
  } else if (isPastDate(formData.startTime)) {
    errors.startTime = 'Start time cannot be in the past'
  }

  // End Time
  if (!formData.endTime) {
    errors.endTime = 'End time is required'
  }

  // Time range
  const timeRangeError = validateTimeRange(formData.startTime, formData.endTime)
  if (timeRangeError) {
    errors.endTime = timeRangeError
  }

  // Purpose
  const purposeError = validatePurpose(formData.purpose)
  if (purposeError) {
    errors.purpose = purposeError
  }

  // Attendees
  const attendeesError = validateAttendees(formData.attendees)
  if (attendeesError) {
    errors.attendees = attendeesError
  }

  // Contact Details
  const emailError = validateEmail(formData.contactDetails)
  if (emailError) {
    errors.contactDetails = emailError
  }

  return errors
}

/**
 * Validate that start time is before end time.
 *
 * @param {string} start - Start datetime string
 * @param {string} end   - End datetime string
 * @returns {string|null} Error message or null if valid
 */
export function validateTimeRange(start, end) {
  if (!start || !end) return null

  if (!isValidTimeRange(start, end)) {
    return 'End time must be after start time'
  }

  // Check minimum duration (15 minutes)
  const s = new Date(start)
  const e = new Date(end)
  const diffMinutes = (e.getTime() - s.getTime()) / (1000 * 60)
  if (diffMinutes < 15) {
    return 'Booking must be at least 15 minutes'
  }

  // Check maximum duration (24 hours)
  const diffHours = diffMinutes / 60
  if (diffHours > 24) {
    return 'Booking cannot exceed 24 hours'
  }

  return null
}

/**
 * Validate the number of attendees.
 *
 * @param {number|string} count - Number of attendees
 * @returns {string|null} Error message or null if valid
 */
export function validateAttendees(count) {
  const num = Number(count)

  if (!count && count !== 0) {
    return 'Number of attendees is required'
  }

  if (isNaN(num) || !Number.isInteger(num)) {
    return 'Attendees must be a whole number'
  }

  if (num < 1) {
    return 'At least 1 attendee is required'
  }

  if (num > 500) {
    return 'Attendees cannot exceed 500'
  }

  return null
}

/**
 * Validate an email address.
 *
 * @param {string} email - Email string to validate
 * @returns {string|null} Error message or null if valid
 */
export function validateEmail(email) {
  if (!email || !email.trim()) {
    return 'Contact email is required'
  }

  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address'
  }

  return null
}

/**
 * Validate the booking purpose.
 *
 * @param {string} purpose - Purpose text
 * @returns {string|null} Error message or null if valid
 */
export function validatePurpose(purpose) {
  if (!purpose || !purpose.trim()) {
    return 'Purpose is required'
  }

  const trimmed = purpose.trim()

  if (trimmed.length < 5) {
    return 'Purpose must be at least 5 characters'
  }

  if (trimmed.length > 500) {
    return 'Purpose cannot exceed 500 characters'
  }

  return null
}

/**
 * Check if a form has any errors.
 *
 * @param {Object} errors - Errors object from validateBookingForm()
 * @returns {boolean} True if there are errors
 */
export function hasErrors(errors) {
  return Object.keys(errors).length > 0
}

/**
 * Validate the approval/rejection reason.
 *
 * @param {string} reason - Reason text
 * @returns {string|null} Error message or null if valid
 */
export function validateReason(reason) {
  if (!reason || !reason.trim()) {
    return null // reason is optional
  }

  if (reason.trim().length > 500) {
    return 'Reason cannot exceed 500 characters'
  }

  return null
}
