package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.BookingFilterDTO;
import com.smartcampus.hub.dto.BookingRequestDTO;
import com.smartcampus.hub.dto.BookingResponseDTO;
import com.smartcampus.hub.exception.BookingNotFoundException;
import com.smartcampus.hub.exception.ConflictException;
import com.smartcampus.hub.exception.InvalidBookingException;
import com.smartcampus.hub.model.Booking;
import com.smartcampus.hub.model.BookingStatus;
import com.smartcampus.hub.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for booking management.
 * Handles booking creation, approval, rejection, cancellation, and retrieval.
 * Integrates with ConflictCheckService for conflict detection and NotificationService for notifications.
 */
@Service
@Transactional
public class BookingService {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private ConflictCheckService conflictCheckService;
    
    @Autowired(required = false)
    private NotificationService notificationService;
    
    /**
     * Create a new booking request.
     * 
     * Workflow:
     * 1. Validate booking data
     * 2. Check for conflicts
     * 3. Save booking with PENDING status
     * 4. Send notification to admin
     * 5. Return created booking
     * 
     * @param request the booking request DTO
     * @param userId the user creating the booking
     * @return the created booking DTO
     * @throws InvalidBookingException if booking data is invalid
     * @throws ConflictException if there's a time conflict
     */
    public BookingResponseDTO createBooking(BookingRequestDTO request, Long userId) {
        // Step 1: Validate booking request
        validateBooking(request);
        
        // Step 2: Check for conflicts
        if (conflictCheckService.isConflicting(request.getResourceId(), request.getStartTime(), request.getEndTime())) {
            List<Booking> conflicts = conflictCheckService.getConflictingBookings(
                request.getResourceId(), 
                request.getStartTime(), 
                request.getEndTime()
            );
            throw new ConflictException(
                "Time slot is not available for this resource. Found " + conflicts.size() + " conflicting booking(s).",
                request.getResourceId()
            );
        }
        
        // Step 3: Create and save booking
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
        
        // Step 4: Trigger notification to admin
        if (notificationService != null) {
            try {
                notificationService.sendBookingCreatedNotification(savedBooking);
            } catch (Exception e) {
                // Log but don't fail if notification fails
                System.err.println("Failed to send notification: " + e.getMessage());
            }
        }
        
        // Step 5: Return response
        return convertToResponseDTO(savedBooking);
    }
    
    /**
     * Validate booking request data.
     * Checks:
     * - Resource ID is not null
     * - Time range is valid
     * - Attendees count is valid
     * - Purpose is not blank
     * - Contact details is valid email
     * 
     * @param request the booking request to validate
     * @throws InvalidBookingException if validation fails
     */
    public void validateBooking(BookingRequestDTO request) {
        if (request == null) {
            throw new InvalidBookingException("Booking request cannot be null");
        }
        
        if (request.getResourceId() == null || request.getResourceId() <= 0) {
            throw new InvalidBookingException("Invalid resource ID", "resourceId");
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
        
        // Validate purpose
        if (request.getPurpose() == null || request.getPurpose().trim().isEmpty()) {
            throw new InvalidBookingException("Purpose cannot be blank", "purpose");
        }
        if (request.getPurpose().length() < 5) {
            throw new InvalidBookingException("Purpose must be at least 5 characters", "purpose");
        }
        if (request.getPurpose().length() > 500) {
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
    
    /**
     * Get all bookings for a specific user with optional filters.
     * 
     * @param userId the user ID
     * @param filters filter criteria (status, date range, etc.)
     * @return page of bookings matching criteria
     */
    @Transactional(readOnly = true)
    public Page<BookingResponseDTO> getUserBookings(Long userId, BookingFilterDTO filters) {
        if (userId == null || userId <= 0) {
            throw new InvalidBookingException("Invalid user ID", "userId");
        }
        
        // Create pagination request
        Pageable pageable = createPageable(filters);
        
        // Apply filters
        Page<Booking> bookings;
        
        if (filters.getStatus() != null) {
            bookings = bookingRepository.findByUserIdAndStatus(userId, filters.getStatus(), pageable);
        } else {
            bookings = bookingRepository.findByUserId(userId, pageable);
        }
        
        // Convert to DTOs
        return bookings.map(this::convertToResponseDTO);
    }
    
    /**
     * Get all bookings (admin only) with optional filters.
     * 
     * @param filters filter criteria (status, date range, resource, etc.)
     * @return page of all bookings matching criteria
     */
    @Transactional(readOnly = true)
    public Page<BookingResponseDTO> getAllBookings(BookingFilterDTO filters) {
        // Create pagination request
        Pageable pageable = createPageable(filters);
        
        // Apply filters
        Page<Booking> bookings;
        
        if (filters.getStatus() != null) {
            bookings = bookingRepository.findByStatus(filters.getStatus(), pageable);
        } else if (filters.getResourceId() != null) {
            bookings = bookingRepository.findByResourceId(filters.getResourceId(), pageable);
        } else {
            bookings = bookingRepository.findAll(pageable);
        }
        
        // Convert to DTOs
        return bookings.map(this::convertToResponseDTO);
    }
    
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
            .orElseThrow(() -> new BookingNotFoundException("id", Long.parseLong(bookingId)));
        return convertToResponseDTO(booking);
    }
    
    /**
     * Create pageable object from filter parameters.
     * 
     * @param filters the filter DTO
     * @return pageable object
     */
    private Pageable createPageable(BookingFilterDTO filters) {
        int page = filters.getPage() != null ? filters.getPage() : 0;
        int pageSize = filters.getPageSize() != null ? filters.getPageSize() : 20;
        
        // Limit page size to prevent abuse
        if (pageSize > 100) {
            pageSize = 100;
        }
        if (pageSize < 1) {
            pageSize = 20;
        }
        
        return PageRequest.of(page, pageSize, Sort.by("createdAt").descending());
    }
    
    /**
     * Convert Booking entity to ResponseDTO.
     * 
     * @param booking the booking entity
     * @return booking response DTO
     */
    private BookingResponseDTO convertToResponseDTO(Booking booking) {
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
        
        return dto;
    }
    
    /**
     * Approve a booking request (admin only).
     * 
     * Workflow:
     * 1. Find booking by ID
     * 2. Verify booking is in PENDING status
     * 3. Update status to APPROVED
     * 4. Set approval reason and admin ID
     * 5. Save booking
     * 6. Send notification to user
     * 7. Return updated booking
     * 
     * @param bookingId the booking ID to approve
     * @param adminId the admin ID approving the booking
     * @param reason the approval reason
     * @return the approved booking DTO
     * @throws BookingNotFoundException if booking doesn't exist
     * @throws InvalidBookingException if booking is not in PENDING status
     */
    @Transactional
    public BookingResponseDTO approveBooking(String bookingId, Long adminId, String reason) {
        // Step 1: Find booking
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new BookingNotFoundException("id", Long.parseLong(bookingId)));
        
        // Step 2: Verify status
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingException(
                "Only PENDING bookings can be approved. Current status: " + booking.getStatus(),
                "status"
            );
        }
        
        // Step 3-5: Update and save
        booking.setStatus(BookingStatus.APPROVED);
        booking.setApprovalReason(reason != null ? reason : "");
        booking.setApprovedBy(adminId);
        booking.setUpdatedAt(LocalDateTime.now());
        
        Booking savedBooking = bookingRepository.save(booking);
        
        // Step 6: Send notification to user
        if (notificationService != null) {
            try {
                notificationService.sendBookingApprovedNotification(savedBooking);
            } catch (Exception e) {
                System.err.println("Failed to send approval notification: " + e.getMessage());
            }
        }
        
        // Step 7: Return response
        return convertToResponseDTO(savedBooking);
    }
    
    /**
     * Reject a booking request (admin only).
     * 
     * Workflow:
     * 1. Find booking by ID
     * 2. Verify booking is in PENDING status
     * 3. Update status to REJECTED
     * 4. Set rejection reason and admin ID
     * 5. Save booking
     * 6. Send notification to user
     * 7. Return updated booking
     * 
     * @param bookingId the booking ID to reject
     * @param adminId the admin ID rejecting the booking
     * @param reason the rejection reason
     * @return the rejected booking DTO
     * @throws BookingNotFoundException if booking doesn't exist
     * @throws InvalidBookingException if booking is not in PENDING status
     */
    @Transactional
    public BookingResponseDTO rejectBooking(String bookingId, Long adminId, String reason) {
        // Step 1: Find booking
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new BookingNotFoundException("id", Long.parseLong(bookingId)));
        
        // Step 2: Verify status
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingException(
                "Only PENDING bookings can be rejected. Current status: " + booking.getStatus(),
                "status"
            );
        }
        
        // Step 3-5: Update and save
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason != null ? reason : "No reason provided");
        booking.setRejectedBy(adminId);
        booking.setUpdatedAt(LocalDateTime.now());
        
        Booking savedBooking = bookingRepository.save(booking);
        
        // Step 6: Send notification to user
        if (notificationService != null) {
            try {
                notificationService.sendBookingRejectedNotification(savedBooking);
            } catch (Exception e) {
                System.err.println("Failed to send rejection notification: " + e.getMessage());
            }
        }
        
        // Step 7: Return response
        return convertToResponseDTO(savedBooking);
    }
    
    /**
     * Cancel an approved booking (user or admin).
     * 
     * Workflow:
     * 1. Find booking by ID
     * 2. Verify booking is APPROVED (only approved can be cancelled)
     * 3. Verify ownership (user must own booking or be admin)
     * 4. Update status to CANCELLED
     * 5. Save booking
     * 6. Send notification to admin
     * 7. Return updated booking
     * 
     * @param bookingId the booking ID to cancel
     * @param userId the user ID cancelling (for ownership check)
     * @param isAdmin whether the user is admin
     * @return the cancelled booking DTO
     * @throws BookingNotFoundException if booking doesn't exist
     * @throws InvalidBookingException if booking is not APPROVED or user lacks permission
     */
    @Transactional
    public BookingResponseDTO cancelBooking(String bookingId, Long userId, boolean isAdmin) {
        // Step 1: Find booking
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new BookingNotFoundException("id", Long.parseLong(bookingId)));
        
        // Step 2: Verify status
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new InvalidBookingException(
                "Only APPROVED bookings can be cancelled. Current status: " + booking.getStatus(),
                "status"
            );
        }
        
        // Step 3: Verify ownership
        if (!isAdmin && !booking.getUserId().equals(userId)) {
            throw new InvalidBookingException(
                "You don't have permission to cancel this booking",
                "authorization"
            );
        }
        
        // Step 4-5: Update and save
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now());
        
        Booking savedBooking = bookingRepository.save(booking);
        
        // Step 6: Send notification to admin
        if (notificationService != null) {
            try {
                notificationService.sendBookingCancelledNotification(savedBooking);
            } catch (Exception e) {
                System.err.println("Failed to send cancellation notification: " + e.getMessage());
            }
        }
        
        // Step 7: Return response
        return convertToResponseDTO(savedBooking);
    }
    
    /**
     * Simple email validation.
     * 
     * @param email the email to validate
     * @return true if email format is valid
     */
    private boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        return email != null && email.matches(emailRegex);
    }
}
