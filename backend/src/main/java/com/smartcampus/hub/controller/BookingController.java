package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.BookingFilterDTO;
import com.smartcampus.hub.dto.BookingRequestDTO;
import com.smartcampus.hub.dto.BookingResponseDTO;
import com.smartcampus.hub.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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
