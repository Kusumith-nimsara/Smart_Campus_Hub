package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.BookingFilterDTO;
import com.smartcampus.hub.dto.BookingRequestDTO;
import com.smartcampus.hub.dto.BookingResponseDTO;
import com.smartcampus.hub.model.Booking;
import com.smartcampus.hub.service.BookingService;
import com.smartcampus.hub.service.ConflictCheckService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for booking management.
 * Handles booking creation, retrieval, approval, and cancellation.
 */
@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private ConflictCheckService conflictCheckService;

    /**
     * Create a new booking request.
     * 
     * HTTP: POST /api/bookings
     * Auth: Required (any authenticated user)
     * 
     * Request Body:
     * {
     *   "resourceId": 123,
     *   "startTime": "2026-04-25T10:00:00",
     *   "endTime": "2026-04-25T11:00:00",
     *   "purpose": "Team meeting discussion",
     *   "attendees": 5,
     *   "contactDetails": "user@example.com"
     * }
     * 
     * Response: 201 Created with BookingResponseDTO
     * {
     *   "id": "...mongodb_id...",
     *   "userId": 1,
     *   "resourceId": 123,
     *   "status": "PENDING",
     *   "createdAt": "2026-04-22T10:00:00",
     *   "...other fields..."
     * }
     * 
     * @param request the booking request DTO
     * @param authentication the authenticated user
     * @return the created booking DTO with status 201
     */
    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(
            @RequestBody BookingRequestDTO request,
            Authentication authentication) {
        
        Long userId = extractUserId(authentication);
        BookingResponseDTO booking = bookingService.createBooking(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    /**
     * Get a specific booking by ID.
     * 
     * HTTP: GET /api/bookings/{id}
     * Auth: Required (any authenticated user - can view any booking)
     * 
     * Example:
     * GET /api/bookings/507f1f77bcf86cd799439011
     * 
     * Response: 200 OK with BookingResponseDTO
     * {
     *   "id": "507f1f77bcf86cd799439011",
     *   "userId": 1,
     *   "resourceId": 123,
     *   "startTime": "2026-04-25T10:00:00",
     *   "endTime": "2026-04-25T11:00:00",
     *   "status": "PENDING",
     *   "purpose": "Team meeting",
     *   "attendees": 5,
     *   "contactDetails": "user@example.com",
     *   "createdAt": "2026-04-22T10:00:00",
     *   "updatedAt": "2026-04-22T10:00:00"
     * }
     * 
     * @param id the booking ID
     * @return the booking DTO with status 200
     */
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> getBooking(@PathVariable String id) {
        BookingResponseDTO booking = bookingService.getBooking(id);
        return ResponseEntity.ok(booking);
    }

    /**
     * Get all bookings for the current authenticated user with optional filters.
     * 
     * HTTP: GET /api/bookings/user/me?status=PENDING&page=0&pageSize=10
     * Auth: Required (any authenticated user)
     * 
     * Query Parameters:
     * - status: optional, filter by booking status (PENDING, APPROVED, REJECTED, CANCELLED)
     * - page: optional, page number (default: 0)
     * - pageSize: optional, page size (default: 20, max: 100)
     * 
     * Examples:
     * GET /api/bookings/user/me
     * GET /api/bookings/user/me?status=APPROVED
     * GET /api/bookings/user/me?status=PENDING&page=1&pageSize=5
     * 
     * Response: 200 OK with paginated results
     * {
     *   "content": [
     *     {
     *       "id": "...",
     *       "userId": 1,
     *       "resourceId": 123,
     *       "status": "PENDING",
     *       ...
     *     }
     *   ],
     *   "totalElements": 25,
     *   "totalPages": 3,
     *   "number": 0,
     *   "size": 10
     * }
     * 
     * @param status optional status filter
     * @param page the page number (default: 0)
     * @param pageSize the page size (default: 20, max: 100)
     * @param authentication the authenticated user
     * @return paginated list of user's bookings with status 200
     */
    @GetMapping("/user/me")
    public ResponseEntity<Page<BookingResponseDTO>> getUserBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer pageSize,
            Authentication authentication) {
        
        Long userId = extractUserId(authentication);
        
        // Create filter DTO
        BookingFilterDTO filter = new BookingFilterDTO();
        filter.setStatus(status);
        filter.setPage(page);
        filter.setPageSize(pageSize);
        
        Page<BookingResponseDTO> bookings = bookingService.getUserBookings(userId, filter);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Approve a pending booking (admin only).
     * 
     * HTTP: PUT /api/bookings/{id}/approve
     * Auth: Required (admin only)
     * 
     * Query Parameter:
     * - reason: optional, approval reason
     * 
     * Examples:
     * PUT /api/bookings/507f1f77bcf86cd799439011/approve
     * PUT /api/bookings/507f1f77bcf86cd799439011/approve?reason=Resource%20is%20available
     * 
     * Response: 200 OK with updated BookingResponseDTO
     * {
     *   "id": "507f1f77bcf86cd799439011",
     *   "status": "APPROVED",
     *   "approvalReason": "Resource is available",
     *   "approvedBy": 2,
     *   "updatedAt": "2026-04-22T11:00:00",
     *   ...other fields...
     * }
     * 
     * @param id the booking ID to approve
     * @param reason the approval reason (optional)
     * @param authentication the authenticated user (must be admin)
     * @return the approved booking DTO with status 200
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<BookingResponseDTO> approveBooking(
            @PathVariable String id,
            @RequestParam(required = false) String reason,
            Authentication authentication) {
        
        // Verify admin access
        verifyAdminAccess(authentication);
        
        Long adminId = extractUserId(authentication);
        BookingResponseDTO booking = bookingService.approveBooking(id, adminId, reason);
        return ResponseEntity.ok(booking);
    }

    /**
     * Reject a pending booking (admin only).
     * 
     * HTTP: PUT /api/bookings/{id}/reject
     * Auth: Required (admin only)
     * 
     * Query Parameter:
     * - reason: optional, rejection reason
     * 
     * Examples:
     * PUT /api/bookings/507f1f77bcf86cd799439011/reject
     * PUT /api/bookings/507f1f77bcf86cd799439011/reject?reason=Resource%20is%20unavailable
     * 
     * Response: 200 OK with updated BookingResponseDTO
     * {
     *   "id": "507f1f77bcf86cd799439011",
     *   "status": "REJECTED",
     *   "rejectionReason": "Resource is unavailable",
     *   "rejectedBy": 2,
     *   "updatedAt": "2026-04-22T11:00:00",
     *   ...other fields...
     * }
     * 
     * @param id the booking ID to reject
     * @param reason the rejection reason (optional)
     * @param authentication the authenticated user (must be admin)
     * @return the rejected booking DTO with status 200
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<BookingResponseDTO> rejectBooking(
            @PathVariable String id,
            @RequestParam(required = false) String reason,
            Authentication authentication) {
        
        // Verify admin access
        verifyAdminAccess(authentication);
        
        Long adminId = extractUserId(authentication);
        BookingResponseDTO booking = bookingService.rejectBooking(id, adminId, reason);
        return ResponseEntity.ok(booking);
    }

    /**
     * Cancel an approved booking (user can cancel own, admin can cancel any).
     * 
     * HTTP: DELETE /api/bookings/{id}
     * Auth: Required (owner or admin)
     * 
     * Examples:
     * DELETE /api/bookings/507f1f77bcf86cd799439011
     * 
     * Response: 200 OK with updated BookingResponseDTO
     * {
     *   "id": "507f1f77bcf86cd799439011",
     *   "status": "CANCELLED",
     *   "updatedAt": "2026-04-22T11:30:00",
     *   ...other fields...
     * }
     * 
     * Authorization:
     * - User can only cancel their own approved bookings
     * - Admin can cancel any approved booking
     * 
     * Errors:
     * - 403 Forbidden: If user is not the owner and not admin
     * - 400 Bad Request: If booking is not in APPROVED status
     * - 404 Not Found: If booking doesn't exist
     * 
     * @param id the booking ID to cancel
     * @param authentication the authenticated user
     * @return the cancelled booking DTO with status 200
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> cancelBooking(
            @PathVariable String id,
            Authentication authentication) {
        
        Long userId = extractUserId(authentication);
        boolean isAdmin = isAdmin(authentication);
        
        BookingResponseDTO booking = bookingService.cancelBooking(id, userId, isAdmin);
        return ResponseEntity.ok(booking);
    }

    /**
     * Check if a time slot is available for a resource (conflict checking).
     * 
     * HTTP: GET /api/bookings/conflicts
     * Auth: Required (any authenticated user)
     * 
     * Query Parameters (all required):
     * - resourceId: the resource ID to check
     * - startTime: the start time (ISO format: 2026-04-25T10:00:00)
     * - endTime: the end time (ISO format: 2026-04-25T11:00:00)
     * 
     * Examples:
     * GET /api/bookings/conflicts?resourceId=123&startTime=2026-04-25T10:00:00&endTime=2026-04-25T11:00:00
     * 
     * Response: 200 OK
     * {
     *   "hasConflict": true,
     *   "conflictCount": 2,
     *   "conflicts": [
     *     {
     *       "id": "...",
     *       "userId": 1,
     *       "startTime": "2026-04-25T09:00:00",
     *       "endTime": "2026-04-25T10:30:00",
     *       "status": "APPROVED",
     *       ...
     *     },
     *     {...}
     *   ]
     * }
     * 
     * Response (no conflicts): 200 OK
     * {
     *   "hasConflict": false,
     *   "conflictCount": 0,
     *   "conflicts": []
     * }
     * 
     * @param resourceId the resource ID to check
     * @param startTime the start time (ISO format)
     * @param endTime the end time (ISO format)
     * @param authentication the authenticated user
     * @return conflict check response with status 200
     */
    @GetMapping("/conflicts")
    public ResponseEntity<Map<String, Object>> checkConflicts(
            @RequestParam Long resourceId,
            @RequestParam String startTime,
            @RequestParam String endTime,
            Authentication authentication) {
        
        try {
            // Parse the time strings to LocalDateTime
            DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
            LocalDateTime start = LocalDateTime.parse(startTime, formatter);
            LocalDateTime end = LocalDateTime.parse(endTime, formatter);
            
            // Check for conflicts
            boolean hasConflict = conflictCheckService.isConflicting(resourceId, start, end);
            List<Booking> conflicts = conflictCheckService.getConflictingBookings(resourceId, start, end);
            
            // Build response
            Map<String, Object> response = new HashMap<>();
            response.put("hasConflict", hasConflict);
            response.put("conflictCount", conflicts.size());
            response.put("conflicts", conflicts.stream()
                .map(booking -> new HashMap<String, Object>() {{
                    put("id", booking.getId());
                    put("userId", booking.getUserId());
                    put("resourceId", booking.getResourceId());
                    put("startTime", booking.getStartTime());
                    put("endTime", booking.getEndTime());
                    put("status", booking.getStatus());
                    put("purpose", booking.getPurpose());
                    put("attendees", booking.getAttendees());
                }})
                .toList());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            // Return error response
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid time format. Use ISO format: 2026-04-25T10:00:00");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Check if user has admin role.
     * 
     * @param authentication the Spring Security authentication object
     * @return true if user has ADMIN or ROLE_ADMIN authority
     */
    private boolean isAdmin(Authentication authentication) {
        if (authentication == null) {
            return false;
        }
        
        // Check for both ADMIN and ROLE_ADMIN roles
        try {
            return authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ADMIN") || 
                               auth.getAuthority().equals("ROLE_ADMIN"));
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Verify that user has admin access.
     * Throws RuntimeException if user is not admin.
     * 
     * @param authentication the Spring Security authentication object
     * @throws RuntimeException if user is not admin
     */
    private void verifyAdminAccess(Authentication authentication) {
        if (!isAdmin(authentication)) {
            throw new RuntimeException("Admin access required");
        }
    }

    /**
     * Extract user ID from authentication token.
     * 
     * @param authentication the Spring Security authentication object
     * @return the user ID
     * @throws RuntimeException if authentication is invalid
     */
    private Long extractUserId(Authentication authentication) {
        if (authentication == null) {
            throw new RuntimeException("Authentication required");
        }
        
        try {
            String principal = authentication.getName();
            return Long.parseLong(principal);
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid user ID in token");
        }
    }
}
