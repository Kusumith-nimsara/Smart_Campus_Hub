package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.BookingRequestDTO;
import com.smartcampus.hub.dto.BookingResponseDTO;
import com.smartcampus.hub.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
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
