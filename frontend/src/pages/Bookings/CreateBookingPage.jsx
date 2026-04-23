import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBooking } from '../../utils/bookingAPI'
import { showSuccess, showError } from '../../utils/alerts'
import BookingForm from '../../components/bookings/BookingForm'
import './CreateBookingPage.css'

/**
 * CreateBookingPage — Page for users to create a new booking request.
 */
export default function CreateBookingPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(formData) {
    setIsSubmitting(true)

    try {
      await createBooking(formData)
      await showSuccess('Booking Submitted!', 'Your booking request has been sent for admin approval.')
      navigate('/bookings')
    } catch (err) {
      showError('Booking Failed', err.message || 'Failed to create booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="create-booking-page">
      <div className="create-booking-container">
        <div className="create-booking-header">
          <button
            type="button"
            className="create-booking-back"
            onClick={() => navigate('/bookings')}
          >
            ← Back to Bookings
          </button>
          <h1>📅 Create New Booking</h1>
          <p className="create-booking-subtitle">
            Fill in the details below to request a resource booking. Your request will be sent to an admin for approval.
          </p>
        </div>

        <div className="create-booking-card">
          <BookingForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </div>
    </div>
  )
}
