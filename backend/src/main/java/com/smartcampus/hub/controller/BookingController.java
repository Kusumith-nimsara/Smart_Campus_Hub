package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.BookingFilterDTO;
import com.smartcampus.hub.dto.BookingRequestDTO;
import com.smartcampus.hub.dto.BookingResponseDTO;
import com.smartcampus.hub.model.Booking;
import com.smartcampus.hub.model.BookingStatus;
import com.smartcampus.hub.exception.InvalidBookingException;
import com.smartcampus.hub.service.BookingService;
import com.smartcampus.hub.service.ConflictCheckService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for booking management.
 * Handles booking creation, retrieval, approval, rejection, and cancellation.
 *
 * All endpoints are under /api/bookings
 * Authentication: JWT Bearer token required
 */
@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private ConflictCheckService conflictCheckService;

    // =====================================================
    // 1. POST /api/bookings — Create Booking
    // =====================================================

    /**
     * Create a new booking request.
     *
     * HTTP: POST /api/bookings
     * Auth: USER role required
     *
     * Request Body:
     * {
     *   "resourceId": "69e66dfbcd0e145a029c851d",
     *   "startTime": "2026-05-01T10:00:00",
     *   "endTime": "2026-05-01T12:00:00",
     *   "purpose": "Team meeting discussion",
     *   "attendees": 5,
     *   "contactDetails": "user@example.com"
     * }
     *
     * Response: 201 Created with BookingResponseDTO
     *
     * @param request        the booking request DTO
     * @param authentication the authenticated user
     * @return created booking with 201 status
     */
    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDTO> createBooking(
            @RequestBody BookingRequestDTO request,
            Authentication authentication) {

        String userId = extractUsername(authentication);
        BookingResponseDTO booking = bookingService.createBooking(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    // =====================================================
    // 2. GET /api/bookings/{id} — Get Single Booking
    // =====================================================

    /**
     * Get a specific booking by ID.
     *
     * HTTP: GET /api/bookings/{id}
     * Auth: USER (own) or ADMIN (any)
     *
     * @param id the booking ID (MongoDB ObjectId)
     * @return the booking with 200 status
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDTO> getBooking(@PathVariable String id) {
        BookingResponseDTO booking = bookingService.getBooking(id);
        return ResponseEntity.ok(booking);
    }

    // =====================================================
    // 3. GET /api/bookings/user/me — Get My Bookings (User)
    // =====================================================

    /**
     * Get all bookings for the current authenticated user with optional filters.
     *
     * HTTP: GET /api/bookings/user/me?status=PENDING&page=0&pageSize=10
     * Auth: USER role required
     *
     * Query Parameters:
     * - status: optional filter (PENDING, APPROVED, REJECTED, CANCELLED)
     * - page: optional, default 0
     * - pageSize: optional, default 20, max 100
     *
     * @param status         optional status filter
     * @param page           page number (default 0)
     * @param pageSize       page size (default 20)
     * @param authentication the authenticated user
     * @return paginated list of user's bookings
     */
    @GetMapping("/user/me")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Page<BookingResponseDTO>> getUserBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer pageSize,
            Authentication authentication) {

        String userId = extractUsername(authentication);

        BookingFilterDTO filter = new BookingFilterDTO();
        if (status != null && !status.isEmpty()) {
            try {
                filter.setStatus(BookingStatus.valueOf(status.toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new InvalidBookingException(
                        "Invalid status value. Use: PENDING, APPROVED, REJECTED, CANCELLED", "status");
            }
        }
        filter.setPage(page);
        filter.setPageSize(pageSize);

        Page<BookingResponseDTO> bookings = bookingService.getUserBookings(userId, filter);
        return ResponseEntity.ok(bookings);
    }

    // =====================================================
    // 4. GET /api/bookings/admin/all — Get All Bookings (Admin)
    // =====================================================

    /**
     * Get all bookings in the system (admin only) with optional filters.
     *
     * HTTP: GET /api/bookings/admin/all?status=PENDING&resourceId=xxx&page=0&pageSize=20
     * Auth: ADMIN role required
     *
     * Query Parameters:
     * - status: optional filter (PENDING, APPROVED, REJECTED, CANCELLED)
     * - resourceId: optional filter by resource MongoDB ID
     * - userId: optional filter by user username
     * - page: optional, default 0
     * - pageSize: optional, default 20, max 100
     *
     * @param status     optional status filter
     * @param resourceId optional resource ID filter
     * @param userId     optional user ID filter
     * @param page       page number
     * @param pageSize   page size
     * @return paginated list of all bookings
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<BookingResponseDTO>> getAllBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String resourceId,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer pageSize) {

        BookingFilterDTO filter = new BookingFilterDTO();
        if (status != null && !status.isEmpty()) {
            try {
                filter.setStatus(BookingStatus.valueOf(status.toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new InvalidBookingException(
                        "Invalid status value. Use: PENDING, APPROVED, REJECTED, CANCELLED", "status");
            }
        }
        filter.setResourceId(resourceId);
        filter.setUserId(userId);
        filter.setPage(page);
        filter.setPageSize(pageSize);

        Page<BookingResponseDTO> bookings = bookingService.getAllBookings(filter);
        return ResponseEntity.ok(bookings);
    }

    // =====================================================
    // 5. PUT /api/bookings/{id}/approve — Approve Booking (Admin)
    // =====================================================

    /**
     * Approve a pending booking (admin only).
     *
     * HTTP: PUT /api/bookings/{id}/approve
     * Auth: ADMIN role required
     *
     * Query Parameter:
     * - reason: optional approval reason
     *
     * Example:
     * PUT /api/bookings/507f1f77bcf86cd799439011/approve?reason=Resource+is+available
     *
     * @param id             the booking ID to approve
     * @param reason         the approval reason (optional)
     * @param authentication the authenticated admin
     * @return the approved booking with 200 status
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDTO> approveBooking(
            @PathVariable String id,
            @RequestParam(required = false) String reason,
            Authentication authentication) {

        String adminId = extractUsername(authentication);
        BookingResponseDTO booking = bookingService.approveBooking(id, adminId, reason);
        return ResponseEntity.ok(booking);
    }

    // =====================================================
    // 6. PUT /api/bookings/{id}/reject — Reject Booking (Admin)
    // =====================================================

    /**
     * Reject a pending booking (admin only).
     *
     * HTTP: PUT /api/bookings/{id}/reject
     * Auth: ADMIN role required
     *
     * Query Parameter:
     * - reason: optional rejection reason
     *
     * @param id             the booking ID to reject
     * @param reason         the rejection reason (optional)
     * @param authentication the authenticated admin
     * @return the rejected booking with 200 status
     */
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDTO> rejectBooking(
            @PathVariable String id,
            @RequestParam(required = false) String reason,
            Authentication authentication) {

        String adminId = extractUsername(authentication);
        BookingResponseDTO booking = bookingService.rejectBooking(id, adminId, reason);
        return ResponseEntity.ok(booking);
    }

    // =====================================================
    // 7. DELETE /api/bookings/{id} — Cancel Booking
    // =====================================================

    /**
     * Cancel a booking (user can cancel own PENDING/APPROVED, admin can cancel any).
     *
     * HTTP: DELETE /api/bookings/{id}
     * Auth: USER (own) or ADMIN (any)
     *
     * Response: 200 OK with cancelled booking DTO
     *
     * @param id             the booking ID to cancel
     * @param authentication the authenticated user
     * @return the cancelled booking with 200 status
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDTO> cancelBooking(
            @PathVariable String id,
            Authentication authentication) {

        String userId = extractUsername(authentication);
        boolean isAdmin = isAdmin(authentication);

        BookingResponseDTO booking = bookingService.cancelBooking(id, userId, isAdmin);
        return ResponseEntity.ok(booking);
    }

    // =====================================================
    // 8. GET /api/bookings/conflicts/check — Check Conflicts
    // =====================================================

    /**
     * Check if a time slot is available for a resource.
     *
     * HTTP: GET /api/bookings/conflicts/check
     * Auth: USER role required
     *
     * Query Parameters (all required):
     * - resourceId: the resource MongoDB ID to check
     * - startTime: ISO format (2026-05-01T10:00:00)
     * - endTime: ISO format (2026-05-01T12:00:00)
     *
     * Response: 200 OK
     * {
     *   "hasConflict": true,
     *   "conflictCount": 1,
     *   "conflicts": [{ "id": "...", "startTime": "...", "endTime": "...", "status": "APPROVED" }]
     * }
     *
     * @param resourceId the resource ID
     * @param startTime  the start time string (ISO format)
     * @param endTime    the end time string (ISO format)
     * @return conflict check response
     */
    @GetMapping("/conflicts/check")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> checkConflicts(
            @RequestParam String resourceId,
            @RequestParam String startTime,
            @RequestParam String endTime,
            Authentication authentication) {

        try {
            DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
            LocalDateTime start = LocalDateTime.parse(startTime, formatter);
            LocalDateTime end = LocalDateTime.parse(endTime, formatter);

            boolean hasConflict = conflictCheckService.isConflicting(resourceId, start, end);
            List<Booking> conflicts = conflictCheckService.getConflictingBookings(resourceId, start, end);

            Map<String, Object> response = new HashMap<>();
            response.put("hasConflict", hasConflict);
            response.put("conflictCount", conflicts.size());
            response.put("conflicts", conflicts.stream()
                .map(booking -> {
                    Map<String, Object> c = new HashMap<>();
                    c.put("id", booking.getId());
                    c.put("userId", booking.getUserId());
                    c.put("resourceId", booking.getResourceId());
                    c.put("startTime", booking.getStartTime());
                    c.put("endTime", booking.getEndTime());
                    c.put("status", booking.getStatus());
                    c.put("purpose", booking.getPurpose());
                    c.put("attendees", booking.getAttendees());
                    return c;
                })
                .toList());

            return ResponseEntity.ok(response);

        } catch (DateTimeParseException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid time format. Use ISO format: 2026-05-01T10:00:00");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to check conflicts");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // =====================================================
    // PRIVATE HELPERS
    // =====================================================

    /**
     * Extract the username (principal name) from the JWT authentication token.
     * The JWT subject is the username, NOT a numeric ID.
     *
     * @param authentication the Spring Security authentication object
     * @return the username string
     * @throws RuntimeException if authentication is missing
     */
    private String extractUsername(Authentication authentication) {
        if (authentication == null) {
            throw new RuntimeException("Authentication required");
        }
        // authentication.getName() returns the UserDetails username (set as JWT subject)
        return authentication.getName();
    }

    /**
     * Check if the authenticated user has ADMIN role.
     *
     * @param authentication the Spring Security authentication object
     * @return true if user has ROLE_ADMIN authority
     */
    private boolean isAdmin(Authentication authentication) {
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(auth ->
                        auth.getAuthority().equals("ADMIN") ||
                        auth.getAuthority().equals("ROLE_ADMIN"));
    }
}
