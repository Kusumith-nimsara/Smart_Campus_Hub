package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.*;
import com.smartcampus.hub.model.*;
import com.smartcampus.hub.repository.TicketRepository;
import com.smartcampus.hub.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.*;

@Slf4j
@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public TicketService(TicketRepository ticketRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
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
}
