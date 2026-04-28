package com.smartcampus.hub.dto;

import com.smartcampus.hub.model.BookingStatus;
import java.time.LocalDateTime;

/**
 * DTO for returning booking details in API responses.
 * Used to send booking information to the client.
 */
public class BookingResponseDTO {
    
    private String id;
    private String userId;
    private String resourceId;
    private String resourceName;
    private String resourceType;
    private String resourceLocation;
    private Integer resourceCapacity;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;
    private Integer attendees;
    private String contactDetails;
    private BookingStatus status;
    private String approvalReason;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String approvedBy;
    private String rejectedBy;
    
    // ===== Constructors =====
    public BookingResponseDTO() {
    }
    
    public BookingResponseDTO(String id, String userId, String resourceId, LocalDateTime startTime,
                             LocalDateTime endTime, String purpose, Integer attendees,
                             String contactDetails, BookingStatus status, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.resourceId = resourceId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.purpose = purpose;
        this.attendees = attendees;
        this.contactDetails = contactDetails;
        this.status = status;
        this.createdAt = createdAt;
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
    
    public String getResourceName() {
        return resourceName;
    }
    
    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }
    
    public String getResourceType() {
        return resourceType;
    }
    
    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }
    
    public String getResourceLocation() {
        return resourceLocation;
    }
    
    public void setResourceLocation(String resourceLocation) {
        this.resourceLocation = resourceLocation;
    }
    
    public Integer getResourceCapacity() {
        return resourceCapacity;
    }
    
    public void setResourceCapacity(Integer resourceCapacity) {
        this.resourceCapacity = resourceCapacity;
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
    
    @Override
    public String toString() {
        return "BookingResponseDTO{" +
                "id='" + id + '\'' +
                ", userId=" + userId +
                ", resourceId=" + resourceId +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                ", purpose='" + purpose + '\'' +
                ", status=" + status +
                ", createdAt=" + createdAt +
                '}';
    }
}
