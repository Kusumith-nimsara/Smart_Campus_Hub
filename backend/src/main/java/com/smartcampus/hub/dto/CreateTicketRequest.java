package com.smartcampus.hub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateTicketRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 5000, message = "Description must be between 10 and 5000 characters")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;  // Predefined or custom

    @NotBlank(message = "Priority is required")
    private String priority;  // LOW, MEDIUM, HIGH, CRITICAL

    @NotBlank(message = "Resource location is required")
    @Size(min = 3, max = 255, message = "Resource location must be between 3 and 255 characters")
    private String resourceLocation;

    public CreateTicketRequest() {}

    public CreateTicketRequest(String title, String description, String category, String priority, String resourceLocation) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.priority = priority;
        this.resourceLocation = resourceLocation;
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

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getResourceLocation() {
        return resourceLocation;
    }

    public void setResourceLocation(String resourceLocation) {
        this.resourceLocation = resourceLocation;
    }
}
