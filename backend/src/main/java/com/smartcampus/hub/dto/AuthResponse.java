package com.smartcampus.hub.dto;

public class AuthResponse {
    private String token;
    private String username;
    private String email;
    private String role;
    private boolean approved;

    public AuthResponse(String token, String username, String email, String role, boolean approved) {
        this.token = token;
        this.username = username;
        this.email = email;
        this.role = role;
        this.approved = approved;
    }

    public String getToken() {
        return token;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public boolean isApproved() {
        return approved;
    }
}
