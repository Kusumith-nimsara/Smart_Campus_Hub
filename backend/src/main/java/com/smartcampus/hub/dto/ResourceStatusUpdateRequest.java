package com.smartcampus.hub.dto;

import com.smartcampus.hub.model.ResourceStatus;
import jakarta.validation.constraints.NotNull;

public class ResourceStatusUpdateRequest {
    @NotNull
    private ResourceStatus status;

    public ResourceStatusUpdateRequest() {}

    public ResourceStatus getStatus() {
        return status;
    }

    public void setStatus(ResourceStatus status) {
        this.status = status;
    }
}
