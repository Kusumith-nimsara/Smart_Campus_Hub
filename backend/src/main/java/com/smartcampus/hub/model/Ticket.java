package com.smartcampus.hub.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "tickets")
public class Ticket {

    @Id
    private String id;

    private String title;
    private String description;
    private String category;  // Predefined or custom
    private TicketPriority priority;
    private TicketStatus status = TicketStatus.OPEN;
    private String resourceLocation;
    
    private String createdById;  // User who created the ticket
    private String createdByUsername;
    private String assignedToId;  // Technician/Staff assigned to ticket
    private String assignedToUsername;
    
    private List<String> images = new ArrayList<>();  // Base64 encoded images, max 3
    private List<TicketComment> comments = new ArrayList<>();
    
    private String rejectionReason;  // Only if status is REJECTED
    private String resolutionNotes;  // Technical notes from assigned technician
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;

    public Ticket() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Ticket(String title, String description, String category, TicketPriority priority, 
                  String resourceLocation, String createdById, String createdByUsername) {
        this();
        this.title = title;
        this.description = description;
        this.category = category;
        this.priority = priority;
        this.resourceLocation = resourceLocation;
        this.createdById = createdById;
        this.createdByUsername = createdByUsername;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public TicketPriority getPriority() {
        return priority;
    }

    public void setPriority(TicketPriority priority) {
        this.priority = priority;
    }

    public TicketStatus getStatus() {
        return status;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
        if (status == TicketStatus.RESOLVED || status == TicketStatus.CLOSED) {
            this.resolvedAt = LocalDateTime.now();
        }
    }

    public String getResourceLocation() {
        return resourceLocation;
    }

    public void setResourceLocation(String resourceLocation) {
        this.resourceLocation = resourceLocation;
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

    public String getAssignedToId() {
        return assignedToId;
    }

    public void setAssignedToId(String assignedToId) {
        this.assignedToId = assignedToId;
    }

    public String getAssignedToUsername() {
        return assignedToUsername;
    }

    public void setAssignedToUsername(String assignedToUsername) {
        this.assignedToUsername = assignedToUsername;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images != null ? images : new ArrayList<>();
    }

    public void addImage(String imageBase64) {
        if (this.images.size() < 3) {
            this.images.add(imageBase64);
        }
    }

    public List<TicketComment> getComments() {
        return comments;
    }

    public void setComments(List<TicketComment> comments) {
        this.comments = comments != null ? comments : new ArrayList<>();
    }

    public void addComment(TicketComment comment) {
        this.comments.add(comment);
        this.updatedAt = LocalDateTime.now();
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }
}
