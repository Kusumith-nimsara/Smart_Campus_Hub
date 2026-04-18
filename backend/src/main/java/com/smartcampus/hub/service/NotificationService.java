package com.smartcampus.hub.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;

import com.smartcampus.hub.model.Notification;
import com.smartcampus.hub.repository.NotificationRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Notification createNotification(String userId, String message, String type) {
        String safeUserId = Objects.requireNonNull(userId, "User id cannot be null");
        String safeMessage = Objects.requireNonNull(message, "Message cannot be null");
        String safeType = Objects.requireNonNull(type, "Type cannot be null");

        Notification notification = new Notification();
        notification.setUserId(safeUserId);
        notification.setMessage(safeMessage);
        notification.setType(safeType);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForUser(String userId) {
        String safeUserId = Objects.requireNonNull(userId, "User id cannot be null");
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(safeUserId);
    }

    public Notification markAsRead(String id) {
        String safeId = Objects.requireNonNull(id, "Notification id cannot be null");
        Notification notification = notificationRepository.findById(safeId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void deleteNotification(String id) {
        String safeId = Objects.requireNonNull(id, "Notification id cannot be null");
        if (!notificationRepository.existsById(safeId)) {
            throw new IllegalArgumentException("Notification not found");
        }
        notificationRepository.deleteById(safeId);
    }
}