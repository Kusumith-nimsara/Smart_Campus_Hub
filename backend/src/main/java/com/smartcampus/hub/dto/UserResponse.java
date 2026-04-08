package com.smartcampus.hub.dto;

import java.util.Set;

public class UserResponse {
    private String id;
    private String username;
    private String email;
    private Set<String> roles;

    public UserResponse(String id, String username, String email, Set<String> roles) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.roles = roles;
    }

    public String getId() {
        return id;
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
