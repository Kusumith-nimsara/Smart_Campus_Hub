package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.*;
import com.smartcampus.hub.model.*;
import com.smartcampus.hub.repository.TicketRepository;
import com.smartcampus.hub.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class TicketService {

    private static final Logger log = LoggerFactory.getLogger(TicketService.class);

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public TicketService(TicketRepository ticketRepository, UserRepository userRepository,
                         NotificationService notificationService) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    // ==================== USER OPERATIONS ====================

    public TicketResponse createTicket(CreateTicketRequest request, String userId, String username) {
        // Validate priority
        try {
            TicketPriority.valueOf(request.getPriority().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid priority level: " + request.getPriority());
        }

        Ticket ticket = new Ticket(
                request.getTitle(),
                request.getDescription(),
                request.getCategory(),
                TicketPriority.valueOf(request.getPriority().toUpperCase()),
                request.getResourceLocation(),
                userId,
                username
        );

        Ticket savedTicket = ticketRepository.save(ticket);

        // --- NOTIFICATIONS ---
        // 1. Notify the creator that their ticket was submitted successfully
        try {
            notificationService.notifyTicketCreated(userId, savedTicket.getId(), savedTicket.getTitle());
        } catch (Exception e) {
            log.warn("Failed to send ticket-created notification to creator: {}", e.getMessage());
        }

        // 2. Notify all admins about the new ticket
        try {
            List<User> admins = userRepository.findByRole(Role.ADMIN);
            for (User admin : admins) {
                notificationService.createNotification(
                        admin.getId(),
                        "New Ticket Submitted",
                        "New " + savedTicket.getPriority() + " priority ticket from " + username + ": " + savedTicket.getTitle(),
                        "TICKET_CREATED",
                        savedTicket.getId(),
                        "TICKET"
                );
            }
        } catch (Exception e) {
            log.warn("Failed to send ticket-created notification to admins: {}", e.getMessage());
        }

        return new TicketResponse(savedTicket);
    }

    public Page<TicketResponse> getUserTickets(String userId, Pageable pageable) {
        return ticketRepository.findByCreatedById(userId, pageable)
                .map(TicketResponse::new);
    }

    public TicketResponse getTicketById(String ticketId, String userId, boolean isAdmin) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        // Check if user has access to this ticket
        if (!isAdmin && !ticket.getCreatedById().equals(userId) && !isTechnicianAssigned(ticket, userId)) {
            throw new IllegalArgumentException("You do not have access to this ticket");
        }

        return new TicketResponse(ticket);
    }

    public TicketResponse addComment(String ticketId, AddCommentRequest request, String userId, String username) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        // Only creator and assigned technician can comment
        if (!ticket.getCreatedById().equals(userId) && !isTechnicianAssigned(ticket, userId)) {
            throw new IllegalArgumentException("You cannot add comments to this ticket");
        }

        TicketComment comment = new TicketComment(request.getContent(), userId, username);
        ticket.addComment(comment);
        Ticket updatedTicket = ticketRepository.save(ticket);

        // --- NOTIFICATIONS ---
        // Notify the other party about the comment
        try {
            // If commenter is the creator, notify the assigned technician
            if (ticket.getCreatedById().equals(userId) && ticket.getAssignedToId() != null) {
                notificationService.notifyTicketComment(
                        ticket.getAssignedToId(), ticket.getId(), ticket.getTitle(), username);
            }
            // If commenter is the technician, notify the creator
            if (isTechnicianAssigned(ticket, userId)) {
                notificationService.notifyTicketComment(
                        ticket.getCreatedById(), ticket.getId(), ticket.getTitle(), username);
            }
        } catch (Exception e) {
            log.warn("Failed to send comment notification: {}", e.getMessage());
        }

        return new TicketResponse(updatedTicket);
    }

    public TicketResponse deleteComment(String ticketId, String commentId, String userId, boolean isAdmin) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        TicketComment comment = ticket.getComments().stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        // Only comment owner or admin can delete
        if (!comment.getCreatedById().equals(userId) && !isAdmin) {
            throw new IllegalArgumentException("You cannot delete this comment");
        }

        ticket.getComments().removeIf(c -> c.getId().equals(commentId));
        Ticket updatedTicket = ticketRepository.save(ticket);

        return new TicketResponse(updatedTicket);
    }

    public TicketResponse uploadImage(String ticketId, String imageBase64, String userId, boolean isAdmin) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        // Check if user has access
        if (!isAdmin && !ticket.getCreatedById().equals(userId)) {
            throw new IllegalArgumentException("You cannot add images to this ticket");
        }

        // Validate image size (Base64 encoded is ~33% larger than original)
        // For 5MB limit: base64 would be ~6.7MB
        if (imageBase64.length() > 7000000) {  // ~7MB limit
            throw new IllegalArgumentException("Image size exceeds 5MB limit");
        }

        // Check max 3 images
        if (ticket.getImages().size() >= 3) {
            throw new IllegalArgumentException("Maximum 3 images allowed per ticket");
        }

        ticket.addImage(imageBase64);
        Ticket updatedTicket = ticketRepository.save(ticket);

        return new TicketResponse(updatedTicket);
    }

    // ==================== ADMIN OPERATIONS ====================

    public Page<TicketResponse> getAllTickets(Pageable pageable) {
        return ticketRepository.findAll(pageable)
                .map(TicketResponse::new);
    }

    public TicketResponse assignTechnician(String ticketId, String technicianId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new IllegalArgumentException("Technician not found"));

        // Check if user is a technician or staff
        if (technician.getRole() != Role.TECHNICIAN && technician.getRole() != Role.MANAGER) {
            throw new IllegalArgumentException("User is not a technician or staff member");
        }

        ticket.setAssignedToId(technicianId);
        ticket.setAssignedToUsername(technician.getUsername());
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }

        Ticket updatedTicket = ticketRepository.save(ticket);

        // --- NOTIFICATIONS ---
        try {
            // Notify the technician that they've been assigned
            notificationService.notifyTicketAssigned(
                    technicianId, ticket.getId(), ticket.getTitle());

            // Notify the ticket creator that their ticket is being worked on
            notificationService.notifyTicketUpdated(
                    ticket.getCreatedById(), ticket.getId(), ticket.getTitle(),
                    "IN_PROGRESS (assigned to " + technician.getUsername() + ")");
        } catch (Exception e) {
            log.warn("Failed to send assignment notification: {}", e.getMessage());
        }

        return new TicketResponse(updatedTicket);
    }

    public TicketResponse updateTicketStatus(String ticketId, String newStatus, String rejectionReason) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        try {
            TicketStatus status = TicketStatus.valueOf(newStatus.toUpperCase());
            ticket.setStatus(status);

            if (status == TicketStatus.REJECTED && rejectionReason != null) {
                ticket.setRejectionReason(rejectionReason);
            }

            Ticket updatedTicket = ticketRepository.save(ticket);

            // --- NOTIFICATIONS ---
            try {
                switch (status) {
                    case RESOLVED -> notificationService.notifyTicketResolved(
                            ticket.getCreatedById(), ticket.getId(), ticket.getTitle());
                    case REJECTED -> notificationService.notifyTicketRejected(
                            ticket.getCreatedById(), ticket.getId(), ticket.getTitle(), rejectionReason);
                    case CLOSED -> notificationService.notifyTicketUpdated(
                            ticket.getCreatedById(), ticket.getId(), ticket.getTitle(), "CLOSED");
                    default -> notificationService.notifyTicketUpdated(
                            ticket.getCreatedById(), ticket.getId(), ticket.getTitle(), status.name());
                }

                // Also notify the assigned technician if there is one
                if (ticket.getAssignedToId() != null && !ticket.getAssignedToId().equals(ticket.getCreatedById())) {
                    notificationService.notifyTicketUpdated(
                            ticket.getAssignedToId(), ticket.getId(), ticket.getTitle(), status.name());
                }
            } catch (Exception e) {
                log.warn("Failed to send status-update notification: {}", e.getMessage());
            }

            return new TicketResponse(updatedTicket);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + newStatus);
        }
    }

    public TicketResponse updateResolutionNotes(String ticketId, String notes, String userId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        // Only assigned technician can add resolution notes
        if (!isTechnicianAssigned(ticket, userId)) {
            throw new IllegalArgumentException("You are not assigned to this ticket");
        }

        ticket.setResolutionNotes(notes);
        Ticket updatedTicket = ticketRepository.save(ticket);

        // --- NOTIFICATIONS ---
        // Notify the ticket creator about the resolution notes
        try {
            notificationService.notifyTicketUpdated(
                    ticket.getCreatedById(), ticket.getId(), ticket.getTitle(),
                    "Resolution notes added by " + ticket.getAssignedToUsername());
        } catch (Exception e) {
            log.warn("Failed to send resolution-notes notification: {}", e.getMessage());
        }

        return new TicketResponse(updatedTicket);
    }

    public Page<TicketResponse> getTechnicianTickets(String technicianId, Pageable pageable) {
        return ticketRepository.findByAssignedToId(technicianId, pageable)
                .map(TicketResponse::new);
    }

    public Page<TicketResponse> getTicketsByStatus(String status, Pageable pageable) {
        try {
            TicketStatus ticketStatus = TicketStatus.valueOf(status.toUpperCase());
            return ticketRepository.findByStatus(ticketStatus, pageable)
                    .map(TicketResponse::new);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }
    }

    // ==================== HELPER METHODS ====================

    private boolean isTechnicianAssigned(Ticket ticket, String userId) {
        return ticket.getAssignedToId() != null && ticket.getAssignedToId().equals(userId);
    }

    public long getOpenTicketCount(String userId) {
        return ticketRepository.countByCreatedByIdAndStatus(userId, TicketStatus.OPEN);
    }

    // ==================== TECHNICIAN OPERATIONS ====================

    /**
     * Technician completes a ticket and marks it as RESOLVED
     */
    public TicketResponse technicianCompleteTicket(String ticketId, String userId, String resolutionNotes) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        // Verify technician is assigned
        if (!isTechnicianAssigned(ticket, userId)) {
            throw new IllegalArgumentException("You are not assigned to this ticket");
        }

        ticket.setStatus(TicketStatus.RESOLVED);
        ticket.setResolutionNotes(resolutionNotes);
        Ticket updatedTicket = ticketRepository.save(ticket);

        // Notify the admin and creator
        try {
            List<User> admins = userRepository.findByRole(Role.ADMIN);
            for (User admin : admins) {
                notificationService.createNotification(
                        admin.getId(),
                        "Ticket Completed",
                        "Ticket \"" + ticket.getTitle() + "\" completed by " + ticket.getAssignedToUsername(),
                        "TICKET_RESOLVED",
                        ticket.getId(),
                        "TICKET"
                );
            }
            notificationService.notifyTicketResolved(ticket.getCreatedById(), ticket.getId(), ticket.getTitle());
        } catch (Exception e) {
            log.warn("Failed to send completion notification: {}", e.getMessage());
        }

        return new TicketResponse(updatedTicket);
    }

    /**
     * Technician rejects a ticket with reason
     */
    public TicketResponse technicianRejectTicket(String ticketId, String userId, String rejectionReason) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        // Verify technician is assigned
        if (!isTechnicianAssigned(ticket, userId)) {
            throw new IllegalArgumentException("You are not assigned to this ticket");
        }

        ticket.setStatus(TicketStatus.REJECTED);
        ticket.setRejectionReason(rejectionReason);
        ticket.setAssignedToId(null);
        ticket.setAssignedToUsername(null);
        Ticket updatedTicket = ticketRepository.save(ticket);

        // Notify creator and admins
        try {
            notificationService.notifyTicketRejected(
                    ticket.getCreatedById(), ticket.getId(), ticket.getTitle(), rejectionReason);
            List<User> admins = userRepository.findByRole(Role.ADMIN);
            for (User admin : admins) {
                notificationService.createNotification(
                        admin.getId(),
                        "Ticket Rejected",
                        "Ticket \"" + ticket.getTitle() + "\" rejected",
                        "TICKET_REJECTED",
                        ticket.getId(),
                        "TICKET"
                );
            }
        } catch (Exception e) {
            log.warn("Failed to send rejection notification: {}", e.getMessage());
        }

        return new TicketResponse(updatedTicket);
    }

    // ==================== ADMIN OPERATIONS (APPROVAL) ====================

    /**
     * Admin approves a completed ticket and marks it as CLOSED
     */
    public TicketResponse adminApproveTicket(String ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        if (ticket.getStatus() != TicketStatus.RESOLVED) {
            throw new IllegalArgumentException("Only RESOLVED tickets can be approved");
        }

        ticket.setStatus(TicketStatus.CLOSED);
        Ticket updatedTicket = ticketRepository.save(ticket);

        // Notify creator and technician
        try {
            notificationService.notifyTicketUpdated(
                    ticket.getCreatedById(), ticket.getId(), ticket.getTitle(),
                    "CLOSED (approved by admin)");
            if (ticket.getAssignedToId() != null) {
                notificationService.notifyTicketUpdated(
                        ticket.getAssignedToId(), ticket.getId(), ticket.getTitle(),
                        "CLOSED (approved)");
            }
        } catch (Exception e) {
            log.warn("Failed to send approval notification: {}", e.getMessage());
        }

        return new TicketResponse(updatedTicket);
    }

    /**
     * Admin rejects a completed ticket, sending it back to IN_PROGRESS
     */
    public TicketResponse adminRejectCompletion(String ticketId, String rejectionReason) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        if (ticket.getStatus() != TicketStatus.RESOLVED) {
            throw new IllegalArgumentException("Only RESOLVED tickets can be rejected");
        }

        ticket.setStatus(TicketStatus.IN_PROGRESS);
        ticket.setRejectionReason(rejectionReason);
        Ticket updatedTicket = ticketRepository.save(ticket);

        // Notify technician
        try {
            if (ticket.getAssignedToId() != null) {
                notificationService.createNotification(
                        ticket.getAssignedToId(),
                        "Ticket Rejection",
                        "Your completion for \"" + ticket.getTitle() + "\" was rejected: " + rejectionReason,
                        "TICKET_NEEDS_REVISION",
                        ticket.getId(),
                        "TICKET"
                );
            }
        } catch (Exception e) {
            log.warn("Failed to send rejection notification: {}", e.getMessage());
        }

        return new TicketResponse(updatedTicket);
    }

    /**
     * Get all open tickets (for admin dashboard)
     */
    public Page<TicketResponse> getOpenTickets(Pageable pageable) {
        return ticketRepository.findByStatus(TicketStatus.OPEN, pageable)
                .map(TicketResponse::new);
    }

    /**
     * Get all in-progress tickets (for admin dashboard)
     */
    public Page<TicketResponse> getInProgressTickets(Pageable pageable) {
        return ticketRepository.findByStatus(TicketStatus.IN_PROGRESS, pageable)
                .map(TicketResponse::new);
    }

    /**
     * Get all resolved tickets (pending admin approval)
     */
    public Page<TicketResponse> getResolvedTickets(Pageable pageable) {
        return ticketRepository.findByStatus(TicketStatus.RESOLVED, pageable)
                .map(TicketResponse::new);
    }

    /**
     * Get all closed tickets (approved and finalized)
     */
    public Page<TicketResponse> getClosedTickets(Pageable pageable) {
        return ticketRepository.findByStatus(TicketStatus.CLOSED, pageable)
                .map(TicketResponse::new);
    }
}
