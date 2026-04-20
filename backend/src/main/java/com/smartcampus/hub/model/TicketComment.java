package com.smartcampus.hub.model;

import java.time.LocalDateTime;

public class TicketComment {

    private String id;
    private String content;
    private String createdById;  // User who created the comment
    private String createdByUsername;
    private LocalDateTime createdAt;

    public TicketComment() {
        this.id = java.util.UUID.randomUUID().toString();
        this.createdAt = LocalDateTime.now();
    }

    public TicketComment(String content, String createdById, String createdByUsername) {
        this();
        this.content = content;
        this.createdById = createdById;
        this.createdByUsername = createdByUsername;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getCreatedById() {
        return createdById;
    }

    public void setCreatedById(String createdById) {
        this.createdById = createdById;
    }

    public String getCreatedByUsername() {
        return createdByUsername;
    }

    public void setCreatedByUsername(String createdByUsername) {
        this.createdByUsername = createdByUsername;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
