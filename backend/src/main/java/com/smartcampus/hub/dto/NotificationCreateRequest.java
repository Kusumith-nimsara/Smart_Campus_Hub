package com.smartcampus.hub.dto;

import jakarta.validation.constraints.NotBlank;

public class NotificationCreateRequest {

    @NotBlank
    private String userId;

    @NotBlank
    private String message;

    @NotBlank
    private String type;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}