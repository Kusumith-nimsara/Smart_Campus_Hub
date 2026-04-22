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
     * A conflict exists if another non-cancelled, non-rejected booking overlaps with the requested time.
     *
     * @param resourceId the resource ID (MongoDB ObjectId string)
     * @param startTime  the requested start time
     * @param endTime    the requested end time
     * @return true if a conflict exists, false if the slot is available
     * @throws InvalidBookingException if time range is invalid
     */
    public boolean isConflicting(String resourceId, LocalDateTime startTime, LocalDateTime endTime) {
        validateTimeRange(startTime, endTime);
        List<Booking> conflicts = bookingRepository.findConflictingBookings(resourceId, startTime, endTime);
        return !conflicts.isEmpty();
    }

    /**
     * Get all bookings that conflict with the requested time slot.
     *
     * @param resourceId the resource ID (MongoDB ObjectId string)
     * @param startTime  the requested start time
     * @param endTime    the requested end time
     * @return list of conflicting bookings
     * @throws InvalidBookingException if time range is invalid
     */
    public List<Booking> getConflictingBookings(String resourceId, LocalDateTime startTime, LocalDateTime endTime) {
        validateTimeRange(startTime, endTime);
        return bookingRepository.findConflictingBookings(resourceId, startTime, endTime);
    }

    /**
     * Validate that the time range is valid for booking.
     * Checks:
     * - Neither start nor end time is null
     * - Both times are in the future
     * - End time is after start time
     * - Duration is at most 7 days
     * - Duration is at least 30 minutes
     *
     * @param startTime the start time to validate
     * @param endTime   the end time to validate
     * @throws InvalidBookingException if validation fails
     */
    public void validateTimeRange(LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime == null) {
            throw new InvalidBookingException("Start time cannot be null", "startTime");
        }
        if (endTime == null) {
            throw new InvalidBookingException("End time cannot be null", "endTime");
        }

        LocalDateTime now = LocalDateTime.now();

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

        if (endTime.isBefore(startTime) || endTime.isEqual(startTime)) {
            throw new InvalidBookingException(
                    "End time must be after start time. Start: " + startTime + ", End: " + endTime,
                    "endTime"
            );
        }

        long hours = java.time.temporal.ChronoUnit.HOURS.between(startTime, endTime);
        long maxHours = 7 * 24;
        if (hours > maxHours) {
            throw new InvalidBookingException(
                    "Booking duration cannot exceed " + maxHours + " hours (7 days). Requested: " + hours + " hours",
                    "endTime"
            );
        }

        long minutes = java.time.temporal.ChronoUnit.MINUTES.between(startTime, endTime);
        if (minutes < 30) {
            throw new InvalidBookingException(
                    "Booking duration must be at least 30 minutes. Requested: " + minutes + " minutes",
                    "endTime"
            );
        }
    }

    /**
     * Check if a specific time slot is available for a resource (approved bookings only).
     * Uses findConflictingApprovedBookings which returns a List (boolean @Query not supported in MongoDB).
     *
     * @param resourceId the resource ID (MongoDB ObjectId string)
     * @param startTime  the start time
     * @param endTime    the end time
     * @return true if the slot is available (no approved bookings), false if occupied
     */
    public boolean isSlotAvailable(String resourceId, LocalDateTime startTime, LocalDateTime endTime) {
        validateTimeRange(startTime, endTime);
        return bookingRepository.findConflictingApprovedBookings(resourceId, startTime, endTime).isEmpty();
    }

    /**
     * Get the count of conflicts for a given time range.
     */
    public long getConflictCount(String resourceId, LocalDateTime startTime, LocalDateTime endTime) {
        validateTimeRange(startTime, endTime);
        return getConflictingBookings(resourceId, startTime, endTime).size();
    }

    /**
     * Get duration of the booking in minutes.
     */
    public long getDurationMinutes(LocalDateTime startTime, LocalDateTime endTime) {
        return java.time.temporal.ChronoUnit.MINUTES.between(startTime, endTime);
    }

    /**
     * Get duration of the booking in hours.
     */
    public long getDurationHours(LocalDateTime startTime, LocalDateTime endTime) {
        return java.time.temporal.ChronoUnit.HOURS.between(startTime, endTime);
    }
}
