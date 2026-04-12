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

        applyUpdate(user, safeRequest, false, true);
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

    public UserResponse approveUserById(String id) {
        String safeId = Objects.requireNonNull(id, "User id cannot be null");
        User user = Objects.requireNonNull(userRepository.findById(safeId)
            .orElseThrow(() -> new IllegalArgumentException("User not found")));

        user.setApproved(true);
        userRepository.save(user);

        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            List<User> sameEmailUsers = userRepository.findAllByEmailIgnoreCase(user.getEmail());
            for (User sameEmailUser : sameEmailUsers) {
                if (!sameEmailUser.isApproved()) {
                    sameEmailUser.setApproved(true);
                    userRepository.save(sameEmailUser);
                }
            }
        }

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
            boolean sameEmailIgnoringCase = user.getEmail() != null
                    && user.getEmail().equalsIgnoreCase(requestedEmail);
            if (!sameEmailIgnoringCase
                    && userRepository.existsByEmailIgnoreCase(requestedEmail)) {
                throw new IllegalArgumentException("Email is already in use");
            }
            user.setEmail(requestedEmail);
        }

        String requestedFirstName = request.getFirstName();
        if (requestedFirstName != null && !requestedFirstName.isBlank()) {
            user.setFirstName(requestedFirstName);
        }

        String requestedLastName = request.getLastName();
        if (requestedLastName != null && !requestedLastName.isBlank()) {
            user.setLastName(requestedLastName);
        }

        String requestedPassword = request.getPassword();
        if (requestedPassword != null && !requestedPassword.isBlank()) {
            user.setPassword(passwordEncoder.encode(requestedPassword));
        }

        String requestedRegistrationNumber = request.getRegistrationNumber();
        if (requestedRegistrationNumber != null && !requestedRegistrationNumber.isBlank()) {
            if (!requestedRegistrationNumber.equals(user.getRegistrationNumber())
                    && userRepository.existsByRegistrationNumber(requestedRegistrationNumber)) {
                throw new IllegalArgumentException("Registration number is already in use");
            }
            user.setRegistrationNumber(requestedRegistrationNumber);
        }

        String requestedMobileNumber = request.getMobileNumber();
        if (requestedMobileNumber != null && !requestedMobileNumber.isBlank()) {
            if (!requestedMobileNumber.equals(user.getMobileNumber())
                    && userRepository.existsByMobileNumber(requestedMobileNumber)) {
                throw new IllegalArgumentException("Mobile number is already in use");
            }
            user.setMobileNumber(requestedMobileNumber);
        }

        String requestedRole = request.getRole();
        if (allowRoleUpdate && requestedRole != null && !requestedRole.isBlank()) {
            user.setRole(resolveRole(requestedRole));
        }
    }

    private Role resolveRole(String requestedRole) {
        try {
            return Role.valueOf(requestedRole.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid role: " + requestedRole + ". Allowed: USER, ADMIN, MANAGER, TECHNICIAN");
        }
    }

    public UserResponse suspendUserById(String id) {
        String safeId = Objects.requireNonNull(id, "User id cannot be null");
        User user = Objects.requireNonNull(userRepository.findById(safeId)
            .orElseThrow(() -> new IllegalArgumentException("User not found")));
        user.setSuspended(true);
        userRepository.save(user);
        return toUserResponse(user);
    }

    public UserResponse unsuspendUserById(String id) {
        String safeId = Objects.requireNonNull(id, "User id cannot be null");
        User user = Objects.requireNonNull(userRepository.findById(safeId)
            .orElseThrow(() -> new IllegalArgumentException("User not found")));
        user.setSuspended(false);
        userRepository.save(user);
        return toUserResponse(user);
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRegistrationNumber(),
                user.getMobileNumber(),
                user.getRole().name(),
                user.isApproved(),
                user.getUserType(),
                user.isSuspended()
        );
    }
}
