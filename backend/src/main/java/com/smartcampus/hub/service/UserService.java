package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.UpdateUserRequest;
import com.smartcampus.hub.dto.UserResponse;
import com.smartcampus.hub.model.Role;
import com.smartcampus.hub.model.User;
import com.smartcampus.hub.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse getCurrentUser(String username) {
        String safeUsername = Objects.requireNonNull(username, "Username cannot be null");
        User user = Objects.requireNonNull(userRepository.findByUsername(safeUsername)
            .orElseThrow(() -> new IllegalArgumentException("User not found")));
        return toUserResponse(user);
    }

    public UserResponse updateCurrentUser(String username, UpdateUserRequest request) {
        String safeUsername = Objects.requireNonNull(username, "Username cannot be null");
        UpdateUserRequest safeRequest = Objects.requireNonNull(request, "Request cannot be null");
        User user = Objects.requireNonNull(userRepository.findByUsername(safeUsername)
            .orElseThrow(() -> new IllegalArgumentException("User not found")));

        applyUpdate(user, safeRequest, false, false);
        userRepository.save(user);
        return toUserResponse(user);
    }

    public void deleteCurrentUser(String username) {
        String safeUsername = Objects.requireNonNull(username, "Username cannot be null");
        User user = Objects.requireNonNull(userRepository.findByUsername(safeUsername)
            .orElseThrow(() -> new IllegalArgumentException("User not found")));
        userRepository.delete(user);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::toUserResponse).toList();
    }

    public UserResponse getUserById(String id) {
        String safeId = Objects.requireNonNull(id, "User id cannot be null");
        User user = Objects.requireNonNull(userRepository.findById(safeId)
            .orElseThrow(() -> new IllegalArgumentException("User not found")));
        return toUserResponse(user);
    }

    public UserResponse updateUserById(String id, UpdateUserRequest request) {
        String safeId = Objects.requireNonNull(id, "User id cannot be null");
        UpdateUserRequest safeRequest = Objects.requireNonNull(request, "Request cannot be null");
        User user = Objects.requireNonNull(userRepository.findById(safeId)
            .orElseThrow(() -> new IllegalArgumentException("User not found")));

        applyUpdate(user, safeRequest, true, true);
        userRepository.save(user);
        return toUserResponse(user);
    }

    public void deleteUserById(String id) {
        String safeId = Objects.requireNonNull(id, "User id cannot be null");
        if (!userRepository.existsById(safeId)) {
            throw new IllegalArgumentException("User not found");
        }
        userRepository.deleteById(safeId);
    }

    private void applyUpdate(User user, UpdateUserRequest request, boolean allowRoleUpdate, boolean allowUsernameUpdate) {
        String requestedUsername = request.getUsername();
        if (requestedUsername != null && !requestedUsername.isBlank()) {
            if (!allowUsernameUpdate && !requestedUsername.equals(user.getUsername())) {
                throw new IllegalArgumentException("Username cannot be changed from this endpoint");
            }

            if (!requestedUsername.equals(user.getUsername())
                    && userRepository.existsByUsername(requestedUsername)) {
                throw new IllegalArgumentException("Username is already taken");
            }
            user.setUsername(requestedUsername);
        }

        String requestedEmail = request.getEmail();
        if (requestedEmail != null && !requestedEmail.isBlank()) {
            if (!requestedEmail.equals(user.getEmail())
                    && userRepository.existsByEmail(requestedEmail)) {
                throw new IllegalArgumentException("Email is already in use");
            }
            user.setEmail(requestedEmail);
        }

        String requestedPassword = request.getPassword();
        if (requestedPassword != null && !requestedPassword.isBlank()) {
            user.setPassword(passwordEncoder.encode(requestedPassword));
        }

        Set<String> requestedRoles = request.getRoles();
        if (allowRoleUpdate && requestedRoles != null && !requestedRoles.isEmpty()) {
            user.setRoles(resolveRoles(requestedRoles));
        }
    }

    private Set<Role> resolveRoles(Set<String> requestRoles) {
        return requestRoles.stream()
                .map(role -> {
                    try {
                        return Role.valueOf(role.trim().toUpperCase());
                    } catch (IllegalArgumentException ex) {
                        throw new IllegalArgumentException("Invalid role: " + role + ". Allowed: USER, ADMIN");
                    }
                })
                .collect(Collectors.toSet());
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRoles().stream().map(Role::name).collect(Collectors.toSet())
        );
    }
}
