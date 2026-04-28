package com.smartcampus.hub.exception;

/**
 * Exception thrown when a booking time slot conflicts with an existing booking.
 * This occurs when a resource is already booked for the requested time range.
 */
public class ConflictException extends RuntimeException {
    
    private Long resourceId;
    private String conflictDetails;
    
    public ConflictException(String message) {
        super(message);
    }
    
    public ConflictException(String message, Long resourceId) {
        super(message);
        this.resourceId = resourceId;
    }
    
    public ConflictException(String message, Long resourceId, String conflictDetails) {
        super(message);
        this.resourceId = resourceId;
        this.conflictDetails = conflictDetails;
    }
    
    public ConflictException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public Long getResourceId() {
        return resourceId;
    }
    
    public String getConflictDetails() {
        return conflictDetails;
    }
}
