/**
 * Validation Utility Functions for the Booking Feature
 *
 * Provides form validation, field-level checks, and error message generation
 * for the booking creation form.
 */

import { getColomboHourMinute, getColomboNowTimestamp, getDurationMinutes, isValidTimeRange, parseColomboDateTimeToUtcMs } from './dateUtils'

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

  // Resource Type
  if (!formData.resourceType || !formData.resourceType.trim()) {
    errors.resourceType = 'Please select a resource type'
  }

  // Resource Location
  if (!formData.resourceLocation || !formData.resourceLocation.trim()) {
    errors.resourceLocation = 'Please select a location'
  }

  // Resource ID
  if (!formData.resourceId || !formData.resourceId.trim()) {
    errors.resourceId = 'Please select a resource name'
  }

  // Start Time
  if (!formData.startTime) {
    errors.startTime = 'Start time is required'
  } else if (isStrictlyPast(formData.startTime)) {
    errors.startTime = 'Start time cannot be in the past'
  } else if (!isWithinBookingHours(formData.startTime)) {
    errors.startTime = 'Start time must be between 8:00 AM and 10:00 PM'
  }

  // End Time
  if (!formData.endTime) {
    errors.endTime = 'End time is required'
  } else if (!isWithinBookingHours(formData.endTime, true)) {
    errors.endTime = 'End time must be between 8:00 AM and 10:00 PM'
  }

  // Time range
  const timeRangeError = validateTimeRange(formData.startTime, formData.endTime)
  if (timeRangeError) {
    if (!errors.startTime && timeRangeError.toLowerCase().includes('start')) {
      errors.startTime = timeRangeError
    } else {
      errors.endTime = timeRangeError
    }
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

  // Check minimum duration (30 minutes)
  const diffMinutes = getDurationMinutes(start, end)
  if (diffMinutes < 30) {
    return 'Booking must be at least 30 minutes'
  }

  // Check maximum duration (3 hours)
  if (diffMinutes > 180) {
    return 'Booking cannot exceed 3 hours'
  }

  if (!isWithinBookingHours(start)) {
    return 'Start time must be between 8:00 AM and 10:00 PM'
  }

  if (!isWithinBookingHours(end, true)) {
    return 'End time must be between 8:00 AM and 10:00 PM'
  }

  return null
}

function isStrictlyPast(dateValue) {
  if (!dateValue) return false
  const ts = parseColomboDateTimeToUtcMs(dateValue)
  if (Number.isNaN(ts)) return false
  // Allow current minute in Sri Lanka time.
  return ts < getColomboNowTimestamp() - 60 * 1000
}

function isWithinBookingHours(dateValue, isEnd = false) {
  if (!dateValue) return false
  const hm = getColomboHourMinute(dateValue)
  if (!hm) return false
  const { hour, minute } = hm

  if (hour < 8) return false
  if (isEnd) {
    if (hour > 22) return false
    if (hour === 22 && minute > 0) return false
    return true
  }
  // Start time cannot be 10:00 PM or later because booking needs positive duration.
  return hour < 22
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
    return null
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
