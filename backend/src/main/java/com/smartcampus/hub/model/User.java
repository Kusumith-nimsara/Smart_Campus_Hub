package com.smartcampus.hub.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String username;

    @Indexed(unique = true)
    private String email;

    private String firstName;

    private String lastName;

    private String registrationNumber;

    private String mobileNumber;

    private String password;

    private Role role = Role.USER;

    private Boolean approved = Boolean.FALSE;

    public User() {
    }

    public User(String username, String email, String password, Role role) {
        this(username, email, password, role, false, null, null, null, null);
    }

    public User(String username, String email, String password, Role role, String registrationNumber, String mobileNumber) {
        this(username, email, password, role, false, registrationNumber, mobileNumber, null, null);
    }

    public User(String username, String email, String password, Role role, boolean approved) {
        this(username, email, password, role, approved, null, null, null, null);
    }

    public User(
            String username,
            String email,
            String password,
            Role role,
            boolean approved,
            String registrationNumber,
            String mobileNumber,
            String firstName,
            String lastName
    ) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role == null ? Role.USER : role;
        this.approved = approved;
        this.registrationNumber = registrationNumber;
        this.mobileNumber = mobileNumber;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role == null ? Role.USER : role;
    }

    public void setRole(Role role) {
        this.role = role == null ? Role.USER : role;
    }

    public boolean isApproved() {
        return Boolean.TRUE.equals(approved);
    }

    public void setApproved(boolean approved) {
        this.approved = approved;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
}
