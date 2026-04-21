package com.smartcampus.hub.service;

import com.smartcampus.hub.exception.InvalidBookingException;
import com.smartcampus.hub.model.Booking;
import com.smartcampus.hub.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for detecting and managing booking conflicts.
 * Checks for time slot overlaps when creating or modifying bookings.
 */
@Service
public class ConflictCheckService {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    /**
     * Check if there is a conflict for booking a resource in the given time range.
     * A conflict exists if another non-cancelled booking overlaps with the requested time.
     * 
     * @param resourceId the resource ID to check
     * @param startTime the requested start time
     * @param endTime the requested end time
     * @return true if a conflict exists, false if the slot is available
     * @throws InvalidBookingException if time range is invalid
     */
    public boolean isConflicting(Long resourceId, LocalDateTime startTime, LocalDateTime endTime) {
        // Validate time range first
        validateTimeRange(startTime, endTime);
        
        // Check if any conflicting bookings exist
        List<Booking> conflicts = bookingRepository.findConflictingBookings(resourceId, startTime, endTime);
        return !conflicts.isEmpty();
    }
    
    /**
     * Get all bookings that conflict with the requested time slot.
     * Returns detailed information about conflicting bookings.
     * 
     * @param resourceId the resource ID
     * @param startTime the requested start time
     * @param endTime the requested end time
     * @return list of conflicting bookings
     * @throws InvalidBookingException if time range is invalid
     */
    public List<Booking> getConflictingBookings(Long resourceId, LocalDateTime startTime, LocalDateTime endTime) {
        // Validate time range first
        validateTimeRange(startTime, endTime);
        
        // Fetch and return conflicting bookings
        return bookingRepository.findConflictingBookings(resourceId, startTime, endTime);
    }
    
    /**
     * Validate that the time range is valid for booking.
     * Checks:
     * - Neither start nor end time is null
     * - Both times are in the future
     * - End time is after start time
     * - Duration is reasonable (not too long)
     * 
     * @param startTime the start time to validate
     * @param endTime the end time to validate
     * @throws InvalidBookingException if validation fails
     */
    public void validateTimeRange(LocalDateTime startTime, LocalDateTime endTime) {
        // Check for null values
        if (startTime == null) {
            throw new InvalidBookingException("Start time cannot be null", "startTime");
        }
        if (endTime == null) {
            throw new InvalidBookingException("End time cannot be null", "endTime");
        }
        
        LocalDateTime now = LocalDateTime.now();
        
        // Check if times are in the future
        if (startTime.isBefore(now)) {
            throw new InvalidBookingException(
                "Start time must be in the future. Requested: " + startTime + ", Current: " + now,
                "startTime"
            );
        }
        
        if (endTime.isBefore(now)) {
            throw new InvalidBookingException(
                "End time must be in the future. Requested: " + endTime + ", Current: " + now,
                "endTime"
            );
        }
        
        // Check if end time is after start time
        if (endTime.isBefore(startTime) || endTime.isEqual(startTime)) {
            throw new InvalidBookingException(
                "End time must be after start time. Start: " + startTime + ", End: " + endTime,
                "endTime"
            );
        }
        
        // Check if the duration is not too long (e.g., not more than 7 days)
        long hours = java.time.temporal.ChronoUnit.HOURS.between(startTime, endTime);
        long maxHours = 7 * 24; // 7 days
        
        if (hours > maxHours) {
            throw new InvalidBookingException(
                "Booking duration cannot exceed " + maxHours + " hours (7 days). Requested: " + hours + " hours",
                "endTime"
            );
        }
        
        // Check if minimum booking duration (at least 30 minutes)
        long minutes = java.time.temporal.ChronoUnit.MINUTES.between(startTime, endTime);
        long minMinutes = 30;
        
        if (minutes < minMinutes) {
            throw new InvalidBookingException(
                "Booking duration must be at least " + minMinutes + " minutes. Requested: " + minutes + " minutes",
                "endTime"
            );
        }
    }
    
    /**
     * Check if a specific time slot is available for a resource (quick check).
     * Uses the database's boolean query for efficiency.
     * 
     * @param resourceId the resource ID
     * @param startTime the start time
     * @param endTime the end time
     * @return true if the slot is available (no approved bookings), false if occupied
     * @throws InvalidBookingException if time range is invalid
     */
    public boolean isSlotAvailable(Long resourceId, LocalDateTime startTime, LocalDateTime endTime) {
        validateTimeRange(startTime, endTime);
        return !bookingRepository.existsConflictingApprovedBooking(resourceId, startTime, endTime);
    }
    
    /**
     * Get the count of conflicts for a given time range.
     * Useful for reporting or analytics.
     * 
     * @param resourceId the resource ID
     * @param startTime the start time
     * @param endTime the end time
     * @return number of conflicting bookings
     * @throws InvalidBookingException if time range is invalid
     */
    public long getConflictCount(Long resourceId, LocalDateTime startTime, LocalDateTime endTime) {
        validateTimeRange(startTime, endTime);
        return (long) getConflictingBookings(resourceId, startTime, endTime).size();
    }
    
    /**
     * Get duration of the booking in minutes.
     * 
     * @param startTime the start time
     * @param endTime the end time
     * @return duration in minutes
     */
    public long getDurationMinutes(LocalDateTime startTime, LocalDateTime endTime) {
        return java.time.temporal.ChronoUnit.MINUTES.between(startTime, endTime);
    }
    
    /**
     * Get duration of the booking in hours.
     * 
     * @param startTime the start time
     * @param endTime the end time
     * @return duration in hours
     */
    public long getDurationHours(LocalDateTime startTime, LocalDateTime endTime) {
        return java.time.temporal.ChronoUnit.HOURS.between(startTime, endTime);
    }
}
