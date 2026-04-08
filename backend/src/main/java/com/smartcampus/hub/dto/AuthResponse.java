package com.smartcampus.hub.dto;

import java.util.Set;

public class AuthResponse {
    private String token;
    private String username;
    private String email;
    private Set<String> roles;

    public AuthResponse(String token, String username, String email, Set<String> roles) {
        this.token = token;
        this.username = username;
        this.email = email;
        this.roles = roles;
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

    public Set<String> getRoles() {
        return roles;
    }
}
