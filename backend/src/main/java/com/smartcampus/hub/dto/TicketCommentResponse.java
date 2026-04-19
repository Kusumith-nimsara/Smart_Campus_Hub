package com.smartcampus.hub.dto;

import com.smartcampus.hub.model.TicketComment;
import java.time.LocalDateTime;

public class TicketCommentResponse {

    private String id;
    private String content;
    private String createdById;
    private String createdByUsername;
    private LocalDateTime createdAt;

    public TicketCommentResponse() {}

    public TicketCommentResponse(TicketComment comment) {
        this.id = comment.getId();
        this.content = comment.getContent();
        this.createdById = comment.getCreatedById();
        this.createdByUsername = comment.getCreatedByUsername();
        this.createdAt = comment.getCreatedAt();
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
