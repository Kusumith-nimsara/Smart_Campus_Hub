package com.smartcampus.hub.exception;

/**
 * Exception thrown when booking data is invalid.
 * This includes issues like invalid date ranges, past dates, invalid input, etc.
 */
public class InvalidBookingException extends RuntimeException {
    
    private String fieldName;
    
    public InvalidBookingException(String message) {
        super(message);
    }
    
    public InvalidBookingException(String message, String fieldName) {
        super(message);
        this.fieldName = fieldName;
    }
    
    public InvalidBookingException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public String getFieldName() {
        return fieldName;
    }
}
