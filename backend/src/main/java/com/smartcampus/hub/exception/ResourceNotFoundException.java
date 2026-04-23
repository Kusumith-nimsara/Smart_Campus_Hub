package com.smartcampus.hub.exception;

public class ResourceNotFoundException extends RuntimeException {

    private Long resourceId;

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String message, Long resourceId) {
        super(message);
        this.resourceId = resourceId;
    }

    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }
}
