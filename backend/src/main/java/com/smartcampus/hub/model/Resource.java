package com.smartcampus.hub.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

/**
 * Resource document representing a bookable facility/room in the campus.
 * Stored in MongoDB collection: resources
 * 
 * Resource types: LECTURE_HALL, LAB, MEETING_ROOM
 * Status: ACTIVE, UNDER_MAINTENANCE, OUT_OF_SERVICE
 */
@Document(collection = "resources")
public class Resource {
    
    @Id
    private String id;
    
    @NotBlank(message = "Resource name is required")
    private String name;
    
    @NotBlank(message = "Resource type is required")
    private String type; // LECTURE_HALL, LAB, MEETING_ROOM
    
    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;
    
    @NotBlank(message = "Location is required")
    private String location;
    
    private String description;
    
    @NotBlank(message = "Status is required")
    private String status = "ACTIVE"; // ACTIVE, UNDER_MAINTENANCE, OUT_OF_SERVICE
    
    private String imageUrl;
    
    @NotBlank(message = "Created by is required")
    private String createdBy;
    
    @NotNull(message = "Created at is required")
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    // ===== Constructors =====
    public Resource() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = "ACTIVE";
    }
    
    public Resource(String name, String type, Integer capacity, String location) {
        this();
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.location = location;
    }
    
    public Resource(String name, String type, Integer capacity, String location, 
                   String description, String createdBy) {
        this();
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.location = location;
        this.description = description;
        this.createdBy = createdBy;
    }
    
    // ===== Getters and Setters =====
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public Integer getCapacity() {
        return capacity;
    }
    
    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getImageUrl() {
        return imageUrl;
    }
    
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    
    public String getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
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
    
    // ===== Helper Methods =====
    /**
     * Check if resource is available (not under maintenance or out of service)
     */
    public boolean isAvailable() {
        return "ACTIVE".equals(this.status);
    }
    
    /**
     * Check if resource can accommodate given number of people
     */
    public boolean canAccommodate(int attendees) {
        return this.capacity >= attendees && this.isAvailable();
    }
    
    @Override
    public String toString() {
        return "Resource{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", type='" + type + '\'' +
                ", capacity=" + capacity +
                ", location='" + location + '\'' +
                ", status='" + status + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
