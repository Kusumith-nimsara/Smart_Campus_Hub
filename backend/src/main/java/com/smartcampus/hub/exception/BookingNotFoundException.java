package com.smartcampus.hub.exception;

/**
 * Exception thrown when a booking with a given ID is not found.
 */
public class BookingNotFoundException extends RuntimeException {
    
    public BookingNotFoundException(String message) {
        super(message);
    }
    
    public BookingNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public BookingNotFoundException(String bookingId, Long id) {
        super("Booking not found with " + bookingId + ": " + id);
    }
}
