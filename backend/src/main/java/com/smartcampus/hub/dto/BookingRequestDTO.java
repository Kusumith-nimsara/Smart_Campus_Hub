package com.smartcampus.hub.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

/**
 * DTO for creating a new booking request from the client.
 * Used when users submit booking requests.
 */
public class BookingRequestDTO {
    
    @NotNull(message = "Resource ID is required")
    private Long resourceId;
    
    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;
    
    @NotNull(message = "End time is required")
    private LocalDateTime endTime;
    
    @NotBlank(message = "Purpose cannot be blank")
    @Size(min = 5, max = 500, message = "Purpose must be between 5 and 500 characters")
    private String purpose;
    
    @Min(value = 1, message = "At least 1 attendee required")
    @Max(value = 500, message = "Attendees cannot exceed 500")
    private Integer attendees = 1;
    
    @NotBlank(message = "Contact details are required")
    @Email(message = "Contact details must be a valid email")
    private String contactDetails;
    
    // ===== Constructors =====
    public BookingRequestDTO() {
    }
    
    public BookingRequestDTO(Long resourceId, LocalDateTime startTime, LocalDateTime endTime,
                            String purpose, Integer attendees, String contactDetails) {
        this.resourceId = resourceId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.purpose = purpose;
        this.attendees = attendees;
        this.contactDetails = contactDetails;
    }
    
    // ===== Getters and Setters =====
    public Long getResourceId() {
        return resourceId;
    }
    
    public void setResourceId(Long resourceId) {
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
    
    @Override
    public String toString() {
        return "BookingRequestDTO{" +
                "resourceId=" + resourceId +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                ", purpose='" + purpose + '\'' +
                ", attendees=" + attendees +
                ", contactDetails='" + contactDetails + '\'' +
                '}';
    }
}
