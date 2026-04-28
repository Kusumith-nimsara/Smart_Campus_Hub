package com.smartcampus.hub.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;

import com.smartcampus.hub.model.Booking;
import com.smartcampus.hub.model.Notification;
import com.smartcampus.hub.repository.NotificationRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    /**
     * Create a basic notification (backwards-compatible).
     */
    public Notification createNotification(String userId, String message, String type) {
        return createNotification(userId, null, message, type, null, null);
    }

    /**
     * Create a notification with full parameters for Maintenance & Incident Ticketing.
     */
    public Notification createNotification(String userId, String title, String message, String type,
                                           String referenceId, String referenceType) {
        String safeUserId = Objects.requireNonNull(userId, "User id cannot be null");
        String safeMessage = Objects.requireNonNull(message, "Message cannot be null");
        String safeType = Objects.requireNonNull(type, "Type cannot be null");

        Notification notification = new Notification();
        notification.setUserId(safeUserId);
        notification.setTitle(title);
        notification.setMessage(safeMessage);
        notification.setType(safeType);
        notification.setReferenceId(referenceId);
        notification.setReferenceType(referenceType);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        return notificationRepository.save(notification);
    }

    /**
     * Convenience methods for Maintenance & Incident Ticketing notifications.
     */
    public Notification notifyTicketCreated(String userId, String ticketId, String ticketTitle) {
        return createNotification(
                userId,
                "New Ticket Created",
                "A new ticket has been created: " + ticketTitle,
                "TICKET_CREATED",
                ticketId,
                "TICKET"
        );
    }

    public Notification notifyTicketUpdated(String userId, String ticketId, String ticketTitle, String status) {
        return createNotification(
                userId,
                "Ticket Updated",
                "Ticket \"" + ticketTitle + "\" status changed to " + status,
                "TICKET_UPDATED",
                ticketId,
                "TICKET"
        );
    }

    public Notification notifyTicketAssigned(String userId, String ticketId, String ticketTitle) {
        return createNotification(
                userId,
                "Ticket Assigned to You",
                "You have been assigned to ticket: " + ticketTitle,
                "TICKET_ASSIGNED",
                ticketId,
                "TICKET"
        );
    }

    public Notification notifyTicketResolved(String userId, String ticketId, String ticketTitle) {
        return createNotification(
                userId,
                "Ticket Resolved",
                "Ticket \"" + ticketTitle + "\" has been resolved",
                "TICKET_RESOLVED",
                ticketId,
                "TICKET"
        );
    }

    public Notification notifyMaintenanceScheduled(String userId, String maintenanceId, String facilityName, String scheduledDate) {
        return createNotification(
                userId,
                "Maintenance Scheduled",
                "Maintenance scheduled for " + facilityName + " on " + scheduledDate,
                "MAINTENANCE_SCHEDULED",
                maintenanceId,
                "MAINTENANCE"
        );
    }

    public Notification notifyIncidentReported(String userId, String incidentId, String location) {
        return createNotification(
                userId,
                "Incident Reported",
                "A new incident has been reported at " + location,
                "INCIDENT_REPORTED",
                incidentId,
                "INCIDENT"
        );
    }

    public Notification notifyIncidentUpdate(String userId, String incidentId, String status) {
        return createNotification(
                userId,
                "Incident Update",
                "Incident status updated to " + status,
                "INCIDENT_UPDATED",
                incidentId,
                "INCIDENT"
        );
    }

    /**
     * Notify when a comment is added to a ticket.
     */
    public Notification notifyTicketComment(String userId, String ticketId, String ticketTitle, String commenterName) {
        return createNotification(
                userId,
                "New Comment on Ticket",
                commenterName + " commented on ticket: " + ticketTitle,
                "TICKET_COMMENT",
                ticketId,
                "TICKET"
        );
    }

    /**
     * Notify ticket creator when their ticket is rejected.
     */
    public Notification notifyTicketRejected(String userId, String ticketId, String ticketTitle, String reason) {
        String message = "Your ticket \"" + ticketTitle + "\" has been rejected";
        if (reason != null && !reason.isBlank()) {
            message += ". Reason: " + reason;
        }
        return createNotification(
                userId,
                "Ticket Rejected",
                message,
                "TICKET_REJECTED",
                ticketId,
                "TICKET"
        );
    }

    public Notification sendBookingCreatedNotification(Booking booking) {
        return createNotification(
                booking.getUserId(),
                "Booking Submitted",
                "Your booking request has been submitted for review.",
                "BOOKING_CREATED",
                booking.getId(),
                "BOOKING"
        );
    }

    public Notification sendBookingApprovedNotification(Booking booking) {
        return createNotification(
                booking.getUserId(),
                "Booking Approved",
                "Your booking request has been approved.",
                "BOOKING_APPROVED",
                booking.getId(),
                "BOOKING"
        );
    }

    public Notification sendBookingRejectedNotification(Booking booking) {
        return createNotification(
                booking.getUserId(),
                "Booking Rejected",
                "Your booking request has been rejected.",
                "BOOKING_REJECTED",
                booking.getId(),
                "BOOKING"
        );
    }

    public Notification sendBookingCancelledNotification(Booking booking) {
        return createNotification(
                booking.getUserId(),
                "Booking Cancelled",
                "Your booking has been cancelled.",
                "BOOKING_CANCELLED",
                booking.getId(),
                "BOOKING"
        );
    }

    public List<Notification> getNotificationsForUser(String userId) {
        String safeUserId = Objects.requireNonNull(userId, "User id cannot be null");
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(safeUserId);
    }

    public List<Notification> getUnreadNotificationsForUser(String userId) {
        String safeUserId = Objects.requireNonNull(userId, "User id cannot be null");
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(safeUserId);
    }

    public long getUnreadCount(String userId) {
        String safeUserId = Objects.requireNonNull(userId, "User id cannot be null");
        return notificationRepository.countByUserIdAndIsReadFalse(safeUserId);
    }

    public List<Notification> getNotificationsByType(String userId, String type) {
        String safeUserId = Objects.requireNonNull(userId, "User id cannot be null");
        String safeType = Objects.requireNonNull(type, "Type cannot be null");
        return notificationRepository.findByUserIdAndTypeOrderByCreatedAtDesc(safeUserId, safeType);
    }

    public List<Notification> getNotificationsByReferenceType(String userId, String referenceType) {
        String safeUserId = Objects.requireNonNull(userId, "User id cannot be null");
        return notificationRepository.findByUserIdAndReferenceTypeOrderByCreatedAtDesc(safeUserId, referenceType);
    }

    public Notification markAsRead(String id) {
        String safeId = Objects.requireNonNull(id, "Notification id cannot be null");
        Notification notification = notificationRepository.findById(safeId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(String userId) {
        String safeUserId = Objects.requireNonNull(userId, "User id cannot be null");
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(safeUserId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public void deleteNotification(String id) {
        String safeId = Objects.requireNonNull(id, "Notification id cannot be null");
        if (!notificationRepository.existsById(safeId)) {
            throw new IllegalArgumentException("Notification not found");
        }
        notificationRepository.deleteById(safeId);
    }

    public void deleteAllNotifications(String userId) {
        String safeUserId = Objects.requireNonNull(userId, "User id cannot be null");
        notificationRepository.deleteByUserId(safeUserId);
    }
}