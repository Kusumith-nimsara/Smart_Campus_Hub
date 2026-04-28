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
     * @param userId the user ID (MongoDB ObjectId string)
     * @return list of bookings belonging to the user
     */
    List<Booking> findByUserId(String userId);

    /**
     * Find all bookings for a specific user with pagination.
     *
     * @param userId   the user ID
     * @param pageable pagination info
     * @return page of bookings belonging to the user
     */
    Page<Booking> findByUserId(String userId, Pageable pageable);

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
     * @param status   the booking status
     * @param pageable pagination info
     * @return page of bookings with the specified status
     */
    Page<Booking> findByStatus(BookingStatus status, Pageable pageable);

    /**
     * Find all bookings with a specific status sorted.
     *
     * @param status the booking status
     * @param sort   the sort order
     * @return list of bookings with the specified status
     */
    List<Booking> findByStatus(BookingStatus status, org.springframework.data.domain.Sort sort);

    /**
     * Find all bookings for a specific user with a specific status.
     *
     * @param userId the user ID
     * @param status the booking status
     * @return list of bookings for user with specified status
     */
    List<Booking> findByUserIdAndStatus(String userId, BookingStatus status);

    /**
     * Find all bookings for a specific user with a specific status with pagination.
     *
     * @param userId   the user ID
     * @param status   the booking status
     * @param pageable pagination info
     * @return page of bookings for user with specified status
     */
    Page<Booking> findByUserIdAndStatus(String userId, BookingStatus status, Pageable pageable);

    /**
     * Find conflicting bookings for a resource in a given time range.
     * Returns all non-cancelled bookings that overlap with the specified time slot.
     *
     * Conflict detection logic:
     * A booking conflicts if:
     * - It's for the same resource
     * - It's not cancelled or rejected
     * - Its time range overlaps: (existingStart < requestEnd) AND (existingEnd > requestStart)
     *
     * @param resourceId the resource ID (MongoDB ObjectId string)
     * @param startTime  the requested start time
     * @param endTime    the requested end time
     * @return list of conflicting bookings
     */
    @Query("{ " +
           "'resourceId': ?0, " +
           "'status': { $nin: ['CANCELLED', 'REJECTED'] }, " +
           "'startTime': { $lt: ?2 }, " +
           "'endTime': { $gt: ?1 } " +
           "}")
    List<Booking> findConflictingBookings(String resourceId, LocalDateTime startTime, LocalDateTime endTime);

    /**
     * Find all bookings for a specific resource.
     *
     * @param resourceId the resource ID
     * @return list of bookings for the resource
     */
    List<Booking> findByResourceId(String resourceId);

    /**
     * Find all bookings for a specific resource with pagination.
     *
     * @param resourceId the resource ID
     * @param pageable   pagination info
     * @return page of bookings for the resource
     */
    Page<Booking> findByResourceId(String resourceId, Pageable pageable);

    /**
     * Find all bookings for a specific resource with a specific status.
     *
     * @param resourceId the resource ID
     * @param status     the booking status
     * @return list of bookings for the resource with the specified status
     */
    List<Booking> findByResourceIdAndStatus(String resourceId, BookingStatus status);

    /**
     * Find all bookings for a specific resource in a date range with a specific status.
     *
     * @param resourceId the resource ID
     * @param status     the booking status
     * @param startDate  the start of the date range
     * @param endDate    the end of the date range
     * @return list of bookings matching criteria
     */
    @Query("{ " +
           "'resourceId': ?0, " +
           "'status': ?1, " +
           "'startTime': { $gte: ?2, $lte: ?3 } " +
           "}")
    List<Booking> findByResourceIdAndStatusInDateRange(
            String resourceId,
            BookingStatus status,
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    /**
     * Find approved bookings overlapping a given time slot for a resource.
     * Returns a list instead of boolean because Spring Data MongoDB @Query
     * cannot directly return boolean.
     * Use .isEmpty() to check if slot is free.
     *
     * @param resourceId the resource ID
     * @param startTime  the start time
     * @param endTime    the end time
     * @return list of conflicting APPROVED bookings (empty = slot is free)
     */
    @Query("{ " +
           "'resourceId': ?0, " +
           "'status': 'APPROVED', " +
           "'startTime': { $lt: ?2 }, " +
           "'endTime': { $gt: ?1 } " +
           "}")
    List<Booking> findConflictingApprovedBookings(String resourceId, LocalDateTime startTime, LocalDateTime endTime);

    /**
     * Find bookings created after a specific date (for recent bookings).
     *
     * @param startDate the start date
     * @param pageable  pagination info
     * @return page of recent bookings
     */
    @Query("{ 'createdAt': { $gte: ?0 } }")
    Page<Booking> findRecentBookings(LocalDateTime startDate, Pageable pageable);

    /**
     * Find all bookings for a user in PENDING or APPROVED status (active bookings).
     *
     * @param userId the user ID
     * @return list of active bookings
     */
    @Query("{ " +
           "'userId': ?0, " +
           "'status': { $in: ['PENDING', 'APPROVED'] } " +
           "}")
    List<Booking> findActiveBookingsByUserId(String userId);

    /**
     * Count bookings for a resource with non-cancelled status.
     *
     * @param resourceId the resource ID
     * @return count of active bookings
     */
    @Query(value = "{ " +
           "'resourceId': ?0, " +
           "'status': { $ne: 'CANCELLED' } " +
           "}", count = true)
    long countActiveBookingsByResourceId(String resourceId);
}
