package com.smartcampus.hub.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

/**
 * Booking document representing a resource booking request in the system.
 * Stored in MongoDB collection: bookings
 * 
 * Workflow: PENDING -> APPROVED/REJECTED -> CANCELLED (if approved)
 */
@Document(collection = "bookings")
public class Booking {
    
    @Id
    private String id;
    
    @NotBlank(message = "User ID is required")
    private String userId;
    
    @NotBlank(message = "Resource ID is required")
    private String resourceId;
    
    @NotNull(message = "Start time is required")
    @Future(message = "Start time must be in the future")
    private LocalDateTime startTime;
    
    @NotNull(message = "End time is required")
    @Future(message = "End time must be in the future")
    private LocalDateTime endTime;
    
    @NotBlank(message = "Purpose cannot be blank")
    @Size(min = 5, max = 500, message = "Purpose must be between 5 and 500 characters")
    private String purpose;
    
    @Min(value = 1, message = "At least 1 attendee required")
    @Max(value = 500, message = "Attendees cannot exceed 500")
    private Integer attendees;
    
    @NotNull(message = "Contact details are required")
    @Email(message = "Contact details must be a valid email")
    private String contactDetails;
    
    @NotNull(message = "Status is required")
    private BookingStatus status = BookingStatus.PENDING;
    
    private String approvalReason;
    
    private String rejectionReason;
    
    @NotNull(message = "Created timestamp is required")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    private String approvedBy;  // Admin ID (username) who approved
    
    private String rejectedBy;  // Admin ID (username) who rejected
    
    // ===== Constructors =====
    public Booking() {
    }
    
    public Booking(String userId, String resourceId, LocalDateTime startTime, 
                   LocalDateTime endTime, String purpose, Integer attendees, String contactDetails) {
        this.userId = userId;
        this.resourceId = resourceId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.purpose = purpose;
        this.attendees = attendees;
        this.contactDetails = contactDetails;
        this.status = BookingStatus.PENDING;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // ===== Getters and Setters =====
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getResourceId() {
        return resourceId;
    }
    
    public void setResourceId(String resourceId) {
        this.resourceId = resourceId;
    }
    
    public LocalDateTime getStartTime() {
        return startTime;
    }
    
    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }
    
    public LocalDateTime getEndTime() {
        return endTime;
    }
    
    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }
    
    public String getPurpose() {
        return purpose;
    }
    
    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }
    
    public Integer getAttendees() {
        return attendees;
    }
    
    public void setAttendees(Integer attendees) {
        this.attendees = attendees;
    }
    
    public String getContactDetails() {
        return contactDetails;
    }
    
    public void setContactDetails(String contactDetails) {
        this.contactDetails = contactDetails;
    }
    
    public BookingStatus getStatus() {
        return status;
    }
    
    public void setStatus(BookingStatus status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }
    
    public String getApprovalReason() {
        return approvalReason;
    }
    
    public void setApprovalReason(String approvalReason) {
        this.approvalReason = approvalReason;
    }
    
    public String getRejectionReason() {
        return rejectionReason;
    }
    
    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
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
    
    public String getApprovedBy() {
        return approvedBy;
    }
    
    public void setApprovedBy(String approvedBy) {
        this.approvedBy = approvedBy;
    }
    
    public String getRejectedBy() {
        return rejectedBy;
    }
    
    public void setRejectedBy(String rejectedBy) {
        this.rejectedBy = rejectedBy;
    }
    
    // ===== Utility Methods =====
    @Override
    public String toString() {
        return "Booking{" +
                "id='" + id + '\'' +
                ", userId=" + userId +
                ", resourceId=" + resourceId +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                ", purpose='" + purpose + '\'' +
                ", attendees=" + attendees +
                ", status=" + status +
                ", createdAt=" + createdAt +
                '}';
    }
}
