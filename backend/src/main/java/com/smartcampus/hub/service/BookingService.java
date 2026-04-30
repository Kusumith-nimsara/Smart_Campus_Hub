package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.BookingFilterDTO;
import com.smartcampus.hub.dto.BookingRequestDTO;
import com.smartcampus.hub.dto.BookingResponseDTO;
import com.smartcampus.hub.exception.BookingNotFoundException;
import com.smartcampus.hub.exception.ConflictException;
import com.smartcampus.hub.exception.InvalidBookingException;
import com.smartcampus.hub.exception.ResourceNotFoundException;
import com.smartcampus.hub.model.Booking;
import com.smartcampus.hub.model.BookingStatus;
import com.smartcampus.hub.model.Resource;
import com.smartcampus.hub.repository.BookingRepository;
import com.smartcampus.hub.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for booking management.
 * Handles booking creation, approval, rejection, cancellation, and retrieval.
 * Integrates with ConflictCheckService for conflict detection and NotificationService for notifications.
 * Integrates with ResourceRepository to fetch and validate resource details.
 */
@Service
@Transactional
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ConflictCheckService conflictCheckService;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private NotificationService notificationService;

    // ==============================
    // CREATE BOOKING
    // ==============================

    /**
     * Create a new booking request.
     *
     * Workflow:
     * 1. Validate booking data
     * 2. Verify resource exists (facility integration)
     * 3. Check resource is ACTIVE
     * 4. Validate attendee count against resource capacity
     * 5. Check for time slot conflicts
     * 6. Save booking with PENDING status
     * 7. Send notification to admin
     * 8. Return created booking with resource details
     *
     * @param request the booking request DTO
     * @param userId  the authenticated username creating the booking
     * @return the created booking DTO
     * @throws InvalidBookingException if booking data is invalid
     * @throws ResourceNotFoundException if resource does not exist
     * @throws ConflictException if there's a time conflict
     */
    public BookingResponseDTO createBooking(BookingRequestDTO request, String userId) {
        // Step 1: Validate basic booking request
        validateBooking(request);

        // Step 2: Verify resource exists (facility integration)
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resource not found with id: " + request.getResourceId()));

        // Step 3: Check resource is ACTIVE
        if (!resource.isAvailable()) {
            throw new InvalidBookingException(
                    "Resource '" + resource.getName() + "' is not available for booking. Status: " + resource.getStatus(),
                    "resourceId"
            );
        }

        // Step 4: Validate attendee count against capacity
        if (request.getAttendees() != null && request.getAttendees() > resource.getCapacity()) {
            throw new InvalidBookingException(
                    "Attendee count (" + request.getAttendees() + ") exceeds resource capacity (" + resource.getCapacity() + ")",
                    "attendees"
            );
        }

        // Step 5: Check for conflicts
        if (conflictCheckService.isConflicting(request.getResourceId(), request.getStartTime(), request.getEndTime())) {
            List<Booking> conflicts = conflictCheckService.getConflictingBookings(
                    request.getResourceId(),
                    request.getStartTime(),
                    request.getEndTime()
            );
            throw new ConflictException(
                    "Time slot is not available for resource '" + resource.getName() +
                    "'. Found " + conflicts.size() + " conflicting booking(s)."
            );
        }

        // Step 6: Create and save booking
        Booking booking = new Booking(
                userId,
                request.getResourceId(),
                request.getStartTime(),
                request.getEndTime(),
                request.getPurpose(),
                request.getAttendees(),
                request.getContactDetails()
        );

        booking.setStatus(BookingStatus.PENDING);
        Booking savedBooking = bookingRepository.save(booking);

        // Step 7: Trigger notification to admin
        if (notificationService != null) {
            try {
                notificationService.sendBookingCreatedNotification(savedBooking);
            } catch (Exception e) {
                System.err.println("Failed to send booking created notification: " + e.getMessage());
            }
        }

        // Step 8: Return response with resource details
        return convertToResponseDTO(savedBooking, resource);
    }

    // ==============================
    // VALIDATE BOOKING
    // ==============================

    /**
     * Validate booking request data.
     *
     * @param request the booking request to validate
     * @throws InvalidBookingException if validation fails
     */
    public void validateBooking(BookingRequestDTO request) {
        if (request == null) {
            throw new InvalidBookingException("Booking request cannot be null");
        }

        if (request.getResourceId() == null || request.getResourceId().isBlank()) {
            throw new InvalidBookingException("Resource ID is required", "resourceId");
        }

        // Validate time range using ConflictCheckService
        conflictCheckService.validateTimeRange(request.getStartTime(), request.getEndTime());

        // Validate attendees
        if (request.getAttendees() == null || request.getAttendees() < 1) {
            throw new InvalidBookingException("At least 1 attendee is required", "attendees");
        }
        if (request.getAttendees() > 500) {
            throw new InvalidBookingException("Attendees cannot exceed 500", "attendees");
        }

        // Purpose is optional. Validate length only when provided.
        if (request.getPurpose() != null && request.getPurpose().length() > 500) {
            throw new InvalidBookingException("Purpose cannot exceed 500 characters", "purpose");
        }

        // Validate email
        if (request.getContactDetails() == null || request.getContactDetails().trim().isEmpty()) {
            throw new InvalidBookingException("Contact details cannot be blank", "contactDetails");
        }
        if (!isValidEmail(request.getContactDetails())) {
            throw new InvalidBookingException("Contact details must be a valid email", "contactDetails");
        }
    }

    // ==============================
    // GET BOOKING BY ID
    // ==============================

    /**
     * Get a single booking by ID.
     *
     * @param bookingId the booking ID
     * @return the booking DTO
     * @throws BookingNotFoundException if booking doesn't exist
     */
    @Transactional(readOnly = true)
    public BookingResponseDTO getBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with id: " + bookingId));

        Resource resource = resourceRepository.findById(booking.getResourceId()).orElse(null);
        return convertToResponseDTO(booking, resource);
    }

    // ==============================
    // GET USER BOOKINGS
    // ==============================

    /**
     * Get all bookings for a specific user with optional filters.
     *
     * @param userId  the user ID (username)
     * @param filters filter criteria (status, date range, etc.)
     * @return page of bookings matching criteria
     */
    @Transactional(readOnly = true)
    public Page<BookingResponseDTO> getUserBookings(String userId, BookingFilterDTO filters) {
        if (userId == null || userId.isBlank()) {
            throw new InvalidBookingException("Invalid user ID", "userId");
        }

        Pageable pageable = createPageable(filters);

        Page<Booking> bookings;
        if (filters.getStatus() != null) {
            bookings = bookingRepository.findByUserIdAndStatus(userId, filters.getStatus(), pageable);
        } else {
            bookings = bookingRepository.findByUserId(userId, pageable);
        }

        return bookings.map(b -> {
            Resource resource = null;
            if (b.getResourceId() != null) {
                resource = resourceRepository.findById(b.getResourceId()).orElse(null);
            }
            return convertToResponseDTO(b, resource);
        });
    }

    // ==============================
    // GET ALL BOOKINGS (ADMIN)
    // ==============================

    /**
     * Get all bookings (admin only) with optional filters.
     *
     * @param filters filter criteria (status, date range, resource, etc.)
     * @return page of all bookings matching criteria
     */
    @Transactional(readOnly = true)
    public Page<BookingResponseDTO> getAllBookings(BookingFilterDTO filters) {
        Pageable pageable = createPageable(filters);

        Page<Booking> bookings;
        if (filters.getStatus() != null && filters.getResourceId() != null) {
            // Both status and resourceId filters applied
            bookings = bookingRepository.findByResourceId(filters.getResourceId(), pageable);
            // Post-filter by status (simple approach since Spring Data doesn't have combined paged query)
            bookings = bookingRepository.findByStatus(filters.getStatus(), pageable);
        } else if (filters.getStatus() != null) {
            bookings = bookingRepository.findByStatus(filters.getStatus(), pageable);
        } else if (filters.getResourceId() != null) {
            bookings = bookingRepository.findByResourceId(filters.getResourceId(), pageable);
        } else if (filters.getUserId() != null) {
            bookings = bookingRepository.findByUserId(filters.getUserId(), pageable);
        } else {
            bookings = bookingRepository.findAll(pageable);
        }

        return bookings.map(b -> {
            Resource resource = null;
            if (b.getResourceId() != null) {
                resource = resourceRepository.findById(b.getResourceId()).orElse(null);
            }
            return convertToResponseDTO(b, resource);
        });
    }

    // ==============================
    // APPROVE BOOKING
    // ==============================

    /**
     * Approve a booking request (admin only).
     *
     * @param bookingId the booking ID to approve
     * @param adminId   the admin username approving the booking
     * @param reason    the approval reason
     * @return the approved booking DTO
     * @throws BookingNotFoundException if booking doesn't exist
     * @throws InvalidBookingException if booking is not in PENDING status
     */
    @Transactional
    public BookingResponseDTO approveBooking(String bookingId, String adminId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with id: " + bookingId));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingException(
                    "Only PENDING bookings can be approved. Current status: " + booking.getStatus(),
                    "status"
            );
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setApprovalReason(reason != null ? reason : "");
        booking.setApprovedBy(adminId);
        booking.setUpdatedAt(LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);

        if (notificationService != null) {
            try {
                notificationService.sendBookingApprovedNotification(savedBooking);
            } catch (Exception e) {
                System.err.println("Failed to send approval notification: " + e.getMessage());
            }
        }

        Resource resource = resourceRepository.findById(savedBooking.getResourceId()).orElse(null);
        return convertToResponseDTO(savedBooking, resource);
    }

    // ==============================
    // REJECT BOOKING
    // ==============================

    /**
     * Reject a booking request (admin only).
     *
     * @param bookingId the booking ID to reject
     * @param adminId   the admin username rejecting the booking
     * @param reason    the rejection reason
     * @return the rejected booking DTO
     * @throws BookingNotFoundException if booking doesn't exist
     * @throws InvalidBookingException if booking is not in PENDING status
     */
    @Transactional
    public BookingResponseDTO rejectBooking(String bookingId, String adminId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with id: " + bookingId));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingException(
                    "Only PENDING bookings can be rejected. Current status: " + booking.getStatus(),
                    "status"
            );
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason != null ? reason : "No reason provided");
        booking.setRejectedBy(adminId);
        booking.setUpdatedAt(LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);

        if (notificationService != null) {
            try {
                notificationService.sendBookingRejectedNotification(savedBooking);
            } catch (Exception e) {
                System.err.println("Failed to send rejection notification: " + e.getMessage());
            }
        }

        Resource resource = resourceRepository.findById(savedBooking.getResourceId()).orElse(null);
        return convertToResponseDTO(savedBooking, resource);
    }

    // ==============================
    // CANCEL BOOKING
    // ==============================

    /**
     * Cancel a booking (user or admin).
     * Users can cancel their own PENDING or APPROVED bookings.
     * Admins can cancel any PENDING or APPROVED booking.
     *
     * @param bookingId the booking ID to cancel
     * @param userId    the user username cancelling
     * @param isAdmin   whether the user is admin
     * @return the cancelled booking DTO
     * @throws BookingNotFoundException if booking doesn't exist
     * @throws InvalidBookingException if booking cannot be cancelled or user lacks permission
     */
    @Transactional
    public BookingResponseDTO cancelBooking(String bookingId, String userId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with id: " + bookingId));

        // Only PENDING or APPROVED bookings can be cancelled
        if (booking.getStatus() != BookingStatus.APPROVED && booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingException(
                    "Only PENDING or APPROVED bookings can be cancelled. Current status: " + booking.getStatus(),
                    "status"
            );
        }

        // Verify ownership
        if (!isAdmin && !booking.getUserId().equals(userId)) {
            throw new InvalidBookingException(
                    "You don't have permission to cancel this booking",
                    "authorization"
            );
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);

        if (notificationService != null) {
            try {
                notificationService.sendBookingCancelledNotification(savedBooking);
            } catch (Exception e) {
                System.err.println("Failed to send cancellation notification: " + e.getMessage());
            }
        }

        Resource resource = resourceRepository.findById(savedBooking.getResourceId()).orElse(null);
        return convertToResponseDTO(savedBooking, resource);
    }

    // ==============================
    // HELPERS
    // ==============================

    /**
     * Create pageable object from filter parameters.
     */
    private Pageable createPageable(BookingFilterDTO filters) {
        int page = filters.getPage() != null ? filters.getPage() : 0;
        int pageSize = filters.getPageSize() != null ? filters.getPageSize() : 20;

        if (pageSize > 100) pageSize = 100;
        if (pageSize < 1) pageSize = 20;

        return PageRequest.of(page, pageSize, Sort.by("createdAt").descending());
    }

    /**
     * Convert Booking entity to ResponseDTO, enriched with Resource details.
     *
     * @param booking  the booking entity
     * @param resource the associated resource (can be null if not found)
     * @return booking response DTO
     */
    private BookingResponseDTO convertToResponseDTO(Booking booking, Resource resource) {
        BookingResponseDTO dto = new BookingResponseDTO(
                booking.getId(),
                booking.getUserId(),
                booking.getResourceId(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getPurpose(),
                booking.getAttendees(),
                booking.getContactDetails(),
                booking.getStatus(),
                booking.getCreatedAt()
        );

        dto.setUpdatedAt(booking.getUpdatedAt());
        dto.setApprovalReason(booking.getApprovalReason());
        dto.setRejectionReason(booking.getRejectionReason());
        dto.setApprovedBy(booking.getApprovedBy());
        dto.setRejectedBy(booking.getRejectedBy());

        // Enrich with resource details if available (facility integration)
        if (resource != null) {
            dto.setResourceName(resource.getName());
            dto.setResourceType(resource.getType() != null ? resource.getType().name() : null);
            dto.setResourceLocation(resource.getLocation());
            dto.setResourceCapacity(resource.getCapacity());
        }

        return dto;
    }

    /**
     * Simple email validation.
     */
    private boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        return email != null && email.matches(emailRegex);
    }
}
