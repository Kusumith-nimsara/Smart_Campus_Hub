package com.smartcampus.hub.dto;

public class UserResponse {
    private String id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String registrationNumber;
    private String mobileNumber;
    private String role;
    private boolean approved;

    public UserResponse(
            String id,
            String username,
            String email,
            String firstName,
            String lastName,
            String registrationNumber,
            String mobileNumber,
            String role,
            boolean approved
    ) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.registrationNumber = registrationNumber;
        this.mobileNumber = mobileNumber;
        this.role = role;
        this.approved = approved;
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

    public String getRole() {
        return role;
    }

    public boolean isApproved() {
        return approved;
    }
}
