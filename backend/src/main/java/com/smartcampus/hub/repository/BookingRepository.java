package com.smartcampus.hub.repository;

import com.smartcampus.hub.model.Booking;
import com.smartcampus.hub.model.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Booking entity.
 * Provides database operations for booking management including conflict detection.
 * Uses Spring Data MongoDB for document-based queries.
 */
@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    
    /**
     * Find all bookings for a specific user.
     * 
     * @param userId the user ID
     * @return list of bookings belonging to the user
     */
    List<Booking> findByUserId(Long userId);
    
    /**
     * Find all bookings for a specific user with pagination.
     * 
     * @param userId the user ID
     * @param pageable pagination info
     * @return page of bookings belonging to the user
     */
    Page<Booking> findByUserId(Long userId, Pageable pageable);
    
    /**
     * Find all bookings with a specific status.
     * 
     * @param status the booking status (PENDING, APPROVED, REJECTED, CANCELLED)
     * @return list of bookings with the specified status
     */
    List<Booking> findByStatus(BookingStatus status);
    
    /**
     * Find all bookings with a specific status with pagination.
     * 
     * @param status the booking status
     * @param pageable pagination info
     * @return page of bookings with the specified status
     */
    Page<Booking> findByStatus(BookingStatus status, Pageable pageable);
    
    /**
     * Find all bookings for a specific user with a specific status.
     * 
     * @param userId the user ID
     * @param status the booking status
     * @return list of bookings for user with specified status
     */
    List<Booking> findByUserIdAndStatus(Long userId, BookingStatus status);
    
    /**
     * Find all bookings for a specific user with a specific status with pagination.
     * 
     * @param userId the user ID
     * @param status the booking status
     * @param pageable pagination info
     * @return page of bookings for user with specified status
     */
    Page<Booking> findByUserIdAndStatus(Long userId, BookingStatus status, Pageable pageable);
    
    /**
     * Find conflicting bookings for a resource in a given time range.
     * Returns all non-cancelled bookings that overlap with the specified time slot.
     * 
     * Conflict detection logic:
     * A booking conflicts if:
     * - It's for the same resource
     * - It's not cancelled
     * - Its time range overlaps: (existingStart < requestEnd) AND (existingEnd > requestStart)
     * 
     * @param resourceId the resource ID
     * @param startTime the requested start time
     * @param endTime the requested end time
     * @return list of conflicting bookings
     */
    @Query("{ " +
           "'resourceId': ?0, " +
           "'status': { $ne: 'CANCELLED' }, " +
           "'startTime': { $lt: ?2 }, " +
           "'endTime': { $gt: ?1 } " +
           "}")
    List<Booking> findConflictingBookings(Long resourceId, LocalDateTime startTime, LocalDateTime endTime);
    
    /**
     * Find all bookings for a specific resource.
     * 
     * @param resourceId the resource ID
     * @return list of bookings for the resource
     */
    List<Booking> findByResourceId(Long resourceId);
    
    /**
     * Find all bookings for a specific resource with pagination.
     * 
     * @param resourceId the resource ID
     * @param pageable pagination info
     * @return page of bookings for the resource
     */
    Page<Booking> findByResourceId(Long resourceId, Pageable pageable);
    
    /**
     * Find all approved bookings for a specific resource.
     * Used for availability checking and resource schedule display.
     * 
     * @param resourceId the resource ID
     * @return list of approved bookings for the resource
     */
    List<Booking> findByResourceIdAndStatus(Long resourceId, BookingStatus status);
    
    /**
     * Find all approved bookings for a specific resource in a date range.
     * Used for availability checking for a specific period.
     * 
     * @param resourceId the resource ID
     * @param status the booking status
     * @param startDate the start of the date range
     * @param endDate the end of the date range
     * @return list of bookings matching criteria
     */
    @Query("{ " +
           "'resourceId': ?0, " +
           "'status': ?1, " +
           "'startTime': { $gte: ?2, $lte: ?3 } " +
           "}")
    List<Booking> findByResourceIdAndStatusInDateRange(
            Long resourceId, 
            BookingStatus status, 
            LocalDateTime startDate, 
            LocalDateTime endDate
    );
    
    /**
     * Find all pending bookings (for admin review).
     * 
     * @return list of all pending bookings
     */
    List<Booking> findByStatus(BookingStatus status, org.springframework.data.domain.Sort sort);
    
    /**
     * Check if there are any approved bookings for a resource in a time slot.
     * Used for quick availability check.
     * 
     * @param resourceId the resource ID
     * @param startTime the start time
     * @param endTime the end time
     * @return true if any approved booking exists in the time slot
     */
    @Query("{ " +
           "'resourceId': ?0, " +
           "'status': 'APPROVED', " +
           "'startTime': { $lt: ?2 }, " +
           "'endTime': { $gt: ?1 } " +
           "}")
    boolean existsConflictingApprovedBooking(Long resourceId, LocalDateTime startTime, LocalDateTime endTime);
    
    /**
     * Find bookings created after a specific date (for recent bookings).
     * 
     * @param startDate the start date
     * @param pageable pagination info
     * @return page of recent bookings
     */
    @Query("{ 'createdAt': { $gte: ?0 } }")
    Page<Booking> findRecentBookings(LocalDateTime startDate, Pageable pageable);
    
    /**
     * Find all bookings for a user in a status that is not cancelled or rejected.
     * Useful for showing active bookings.
     * 
     * @param userId the user ID
     * @return list of active bookings
     */
    @Query("{ " +
           "'userId': ?0, " +
           "'status': { $in: ['PENDING', 'APPROVED'] } " +
           "}")
    List<Booking> findActiveBookingsByUserId(Long userId);
    
    /**
     * Count bookings for a resource with non-cancelled status.
     * 
     * @param resourceId the resource ID
     * @return count of active bookings
     */
    @Query("{ " +
           "'resourceId': ?0, " +
           "'status': { $ne: 'CANCELLED' } " +
           "}")
    long countActiveBookingsByResourceId(Long resourceId);
}
