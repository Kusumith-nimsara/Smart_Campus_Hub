package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.*;
import com.smartcampus.hub.service.TicketService;
import com.smartcampus.hub.security.JwtService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/tickets")
public class TicketController {

    private final TicketService ticketService;
    private final JwtService jwtService;

    public TicketController(TicketService ticketService, JwtService jwtService) {
        this.ticketService = ticketService;
        this.jwtService = jwtService;
    }

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            @RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        String userId = jwtService.extractUserId(token);
        String username = jwtService.extractUsername(token);

        TicketResponse response = ticketService.createTicket(request, userId, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<TicketResponse>> getUserTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        String userId = jwtService.extractUserId(token);
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));

        Page<TicketResponse> tickets = ticketService.getUserTickets(userId, pageable);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<TicketResponse> getTicketById(
            @PathVariable String ticketId,
            @RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        String userId = jwtService.extractUserId(token);
        String role = jwtService.extractRole(token);

        TicketResponse response = ticketService.getTicketById(ticketId, userId, "ADMIN".equals(role));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{ticketId}/comments")
    public ResponseEntity<TicketResponse> addComment(
            @PathVariable String ticketId,
            @Valid @RequestBody AddCommentRequest request,
            @RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        String userId = jwtService.extractUserId(token);
        String username = jwtService.extractUsername(token);

        TicketResponse response = ticketService.addComment(ticketId, request, userId, username);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<TicketResponse> deleteComment(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            @RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        String userId = jwtService.extractUserId(token);
        String role = jwtService.extractRole(token);

        TicketResponse response = ticketService.deleteComment(ticketId, commentId, userId, "ADMIN".equals(role));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{ticketId}/images")
    public ResponseEntity<TicketResponse> uploadImage(
            @PathVariable String ticketId,
            @Valid @RequestBody UploadTicketImageRequest request,
            @RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        String userId = jwtService.extractUserId(token);
        String role = jwtService.extractRole(token);

        TicketResponse response = ticketService.uploadImage(ticketId, request.getImageBase64(), userId, "ADMIN".equals(role));
        return ResponseEntity.ok(response);
    }

    // ==================== ADMIN ENDPOINTS ====================

    @GetMapping("/admin/all")
    public ResponseEntity<Page<TicketResponse>> getAllTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        String role = jwtService.extractRole(token);

        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<TicketResponse> tickets = ticketService.getAllTickets(pageable);
        return ResponseEntity.ok(tickets);
    }

    @PutMapping("/{ticketId}/assign")
    public ResponseEntity<TicketResponse> assignTechnician(
            @PathVariable String ticketId,
            @RequestParam String technicianId,
            @RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        String role = jwtService.extractRole(token);

        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        TicketResponse response = ticketService.assignTechnician(ticketId, technicianId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{ticketId}/status")
    public ResponseEntity<TicketResponse> updateStatus(
            @PathVariable String ticketId,
            @RequestParam String status,
            @RequestParam(required = false) String rejectionReason,
            @RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        String role = jwtService.extractRole(token);

        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        TicketResponse response = ticketService.updateTicketStatus(ticketId, status, rejectionReason);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{ticketId}/resolution-notes")
    public ResponseEntity<TicketResponse> updateResolutionNotes(
            @PathVariable String ticketId,
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        String userId = jwtService.extractUserId(token);
        String notes = request.get("notes");

        TicketResponse response = ticketService.updateResolutionNotes(ticketId, notes, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/technician/assigned")
    public ResponseEntity<Page<TicketResponse>> getTechnicianTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        String userId = jwtService.extractUserId(token);
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));

        Page<TicketResponse> tickets = ticketService.getTechnicianTickets(userId, pageable);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<Page<TicketResponse>> getTicketsByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        String role = jwtService.extractRole(token);

        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<TicketResponse> tickets = ticketService.getTicketsByStatus(status, pageable);
        return ResponseEntity.ok(tickets);
    }

    // ==================== TECHNICIAN OPERATIONS ====================

    @PutMapping("/{ticketId}/technician/complete")
    public ResponseEntity<TicketResponse> technicianCompleteTicket(
            @PathVariable String ticketId,
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        String userId = jwtService.extractUserId(token);
        String role = jwtService.extractRole(token);

        if (!("TECHNICIAN".equals(role) || "MANAGER".equals(role))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String resolutionNotes = request.getOrDefault("resolutionNotes", "");
        TicketResponse response = ticketService.technicianCompleteTicket(ticketId, userId, resolutionNotes);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{ticketId}/technician/reject")
    public ResponseEntity<TicketResponse> technicianRejectTicket(
            @PathVariable String ticketId,
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        String userId = jwtService.extractUserId(token);
        String role = jwtService.extractRole(token);

        if (!("TECHNICIAN".equals(role) || "MANAGER".equals(role))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String rejectionReason = request.getOrDefault("rejectionReason", "");
        TicketResponse response = ticketService.technicianRejectTicket(ticketId, userId, rejectionReason);
        return ResponseEntity.ok(response);
    }

    // ==================== ADMIN APPROVAL OPERATIONS ====================

    @PutMapping("/{ticketId}/admin/approve")
    public ResponseEntity<TicketResponse> adminApproveTicket(
            @PathVariable String ticketId,
            @RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        String role = jwtService.extractRole(token);

        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        TicketResponse response = ticketService.adminApproveTicket(ticketId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{ticketId}/admin/reject-completion")
    public ResponseEntity<TicketResponse> adminRejectCompletion(
            @PathVariable String ticketId,
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        String role = jwtService.extractRole(token);

        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String rejectionReason = request.getOrDefault("rejectionReason", "");
        TicketResponse response = ticketService.adminRejectCompletion(ticketId, rejectionReason);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/open")
    public ResponseEntity<Page<TicketResponse>> getOpenTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        String role = jwtService.extractRole(token);

        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<TicketResponse> tickets = ticketService.getOpenTickets(pageable);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/admin/in-progress")
    public ResponseEntity<Page<TicketResponse>> getInProgressTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        String role = jwtService.extractRole(token);

        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<TicketResponse> tickets = ticketService.getInProgressTickets(pageable);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/admin/resolved")
    public ResponseEntity<Page<TicketResponse>> getResolvedTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        String role = jwtService.extractRole(token);

        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<TicketResponse> tickets = ticketService.getResolvedTickets(pageable);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/admin/closed")
    public ResponseEntity<Page<TicketResponse>> getClosedTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        String role = jwtService.extractRole(token);

        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<TicketResponse> tickets = ticketService.getClosedTickets(pageable);
        return ResponseEntity.ok(tickets);
    }

    // ==================== HELPER METHODS ====================

    private String extractToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        throw new IllegalArgumentException("Invalid authorization header");
    }
}
