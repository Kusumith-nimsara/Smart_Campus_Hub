package com.smartcampus.hub.dto;

import jakarta.validation.constraints.NotBlank;

public class UploadTicketImageRequest {

    @NotBlank(message = "Image data is required")
    private String imageBase64;  // Base64 encoded image

    public UploadTicketImageRequest() {}

    public UploadTicketImageRequest(String imageBase64) {
        this.imageBase64 = imageBase64;
    }

    public String getImageBase64() {
        return imageBase64;
    }

    public void setImageBase64(String imageBase64) {
        this.imageBase64 = imageBase64;
    }
}
