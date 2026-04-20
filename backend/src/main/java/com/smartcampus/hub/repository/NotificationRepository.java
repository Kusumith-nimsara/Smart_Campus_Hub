package com.smartcampus.hub.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.smartcampus.hub.model.Notification;

public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(String userId);

    long countByUserIdAndIsReadFalse(String userId);

    List<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(String userId, String type);

    List<Notification> findByUserIdAndReferenceTypeOrderByCreatedAtDesc(String userId, String referenceType);
}