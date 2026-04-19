package com.smartcampus.hub.model;

/**
 * Enum representing the status of a booking throughout its lifecycle.
 * 
 * PENDING - Booking request created, awaiting admin approval
 * APPROVED - Admin has approved the booking request
 * REJECTED - Admin has rejected the booking request
 * CANCELLED - User or admin has cancelled an approved booking
 */
public enum BookingStatus {
    PENDING,
    APPROVED,
    REJECTED,
    CANCELLED
}
