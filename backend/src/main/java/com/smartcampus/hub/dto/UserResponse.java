package com.smartcampus.hub.dto;

import java.util.Set;

public class UserResponse {
    private String id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String registrationNumber;
    private String mobileNumber;
    private Set<String> roles;

    public UserResponse(
            String id,
            String username,
            String email,
            String firstName,
            String lastName,
            String registrationNumber,
            String mobileNumber,
            Set<String> roles
    ) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.registrationNumber = registrationNumber;
        this.mobileNumber = mobileNumber;
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

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public Set<String> getRoles() {
        return roles;
    }
}
