package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.AuthResponse;
import com.smartcampus.hub.dto.LoginRequest;
import com.smartcampus.hub.dto.RegisterRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.smartcampus.hub.model.Role;
import com.smartcampus.hub.model.User;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.security.CustomUserDetailsService;
import com.smartcampus.hub.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class AuthService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AuthService.class);

    private final String adminGoogleEmail;
    private final String googleClientId;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final GoogleIdTokenVerifier googleIdTokenVerifier;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            CustomUserDetailsService userDetailsService,
            JwtService jwtService,
            @Value("${app.google.client-id}") String googleClientId,
            @Value("${app.admin.google-email:}") String adminGoogleEmail
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
        this.adminGoogleEmail = adminGoogleEmail != null ? adminGoogleEmail.trim().toLowerCase() : "";
        this.googleClientId = googleClientId != null ? googleClientId.trim() : "";
        this.googleIdTokenVerifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Set.of(googleClientId))
                .build();
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken");
        }

        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new IllegalArgumentException("Email is already in use");
        }

        if (userRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new IllegalArgumentException("Registration number is already in use");
        }

        if (userRepository.existsByMobileNumber(request.getMobileNumber())) {
            throw new IllegalArgumentException("Mobile number is already in use");
        }

        Role role = resolveRole(request.getRole());
        boolean approved = role == Role.ADMIN;

        User user = new User(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                role,
            approved,
                request.getRegistrationNumber(),
                request.getMobileNumber(),
                request.getFirstName(),
                request.getLastName()
        );

        user = userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtService.generateTokenWithUserId(userDetails, user.getId());

        return new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole().name(), user.isApproved());
    }

    public AuthResponse login(LoginRequest request) {
        String identifier = request.getUsername();
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(identifier, request.getPassword())
        );

        User user = null;
        if (identifier.contains("@")) {
            user = userRepository.findByEmailIgnoreCase(identifier).orElse(null);
        }
        if (user == null) {
            user = userRepository.findByUsername(identifier)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));
        }

        // Block suspended users with a clear message
        if (user.isSuspended()) {
            throw new IllegalArgumentException("Your account has been suspended. Please contact an administrator.");
        }

        // Block unapproved non-admin users
        if (!user.isApproved() && user.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Your account is pending admin approval.");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtService.generateTokenWithUserId(userDetails, user.getId());

        return new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole().name(), user.isApproved());
    }

    public AuthResponse loginWithGoogle(String idToken) {
        GoogleIdToken.Payload payload = verifyGoogleToken(idToken);

        String email = payload.getEmail();
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Google account email is missing");
        }

        String normalizedEmail = email.trim().toLowerCase();

        List<User> matchedUsers = userRepository.findAllByEmailIgnoreCase(normalizedEmail);

        // Check if ANY account with this email is already approved
        boolean anyApproved = matchedUsers.stream().anyMatch(User::isApproved);

        // Pick the best user: prefer approved admin, then approved user, then any
        User user = matchedUsers.stream()
                .filter(existing -> existing.getRole() == Role.ADMIN && existing.isApproved())
                .findFirst()
                .orElseGet(() -> matchedUsers.stream()
                        .filter(User::isApproved)
                        .findFirst()
                        .orElseGet(() -> matchedUsers.stream().findFirst().orElseGet(() -> createGoogleUser(email))));

        // Only override role to ADMIN for the configured admin email;
        // otherwise preserve the existing DB role (e.g. MANAGER, TECHNICIAN)
        Role expectedRole = user.getRole();
        if (!adminGoogleEmail.isEmpty() && normalizedEmail.equals(adminGoogleEmail)) {
            expectedRole = Role.ADMIN;
        }

        // If ANY account with this email was approved, this user should be approved too
        boolean expectedApproval = expectedRole == Role.ADMIN || user.isApproved() || anyApproved;

        if (user.getRole() != expectedRole || user.isApproved() != expectedApproval) {
            user.setRole(expectedRole);
            user.setApproved(expectedApproval);
            user = userRepository.save(user);
        }

        // Also approve all other accounts with the same email if any is approved
        if (expectedApproval) {
            for (User sameEmailUser : matchedUsers) {
                if (!sameEmailUser.isApproved()) {
                    sameEmailUser.setApproved(true);
                    userRepository.save(sameEmailUser);
                }
            }
        }

        // Block suspended users from obtaining a token via Google login
        if (user.isSuspended()) {
            throw new IllegalArgumentException("Your account has been suspended. Please contact an administrator.");
        }

        // Block unapproved non-admin users
        if (!user.isApproved() && user.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Your account is pending admin approval.");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtService.generateTokenWithUserId(userDetails, user.getId());

        return new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole().name(), user.isApproved());
    }

    private GoogleIdToken.Payload verifyGoogleToken(String idToken) {
        try {
            if (idToken == null || idToken.isBlank()) {
                log.warn("Received empty idToken for Google login");
                throw new IllegalArgumentException("Invalid Google token");
            }

            log.debug("Verifying Google token (len={}) using configured clientId={}", idToken.length(), googleClientId);

            GoogleIdToken googleIdToken = googleIdTokenVerifier.verify(idToken);
            if (googleIdToken == null) {
                log.warn("GoogleIdTokenVerifier returned null. Token may be invalid or audience mismatch. Configured clientId={}", googleClientId);
                throw new IllegalArgumentException("Invalid Google token");
            }

            return googleIdToken.getPayload();
        } catch (GeneralSecurityException | IOException ex) {
            log.error("Exception while verifying Google token: {}", ex.toString());
            throw new IllegalArgumentException("Failed to verify Google token");
        }
    }

    private User createGoogleUser(String email) {
        String normalizedEmail = email.trim().toLowerCase();

        // Double-check: maybe a user exists with a slightly different casing
        java.util.Optional<User> existing = userRepository.findByEmailIgnoreCase(normalizedEmail);
        if (existing.isPresent()) {
            return existing.get();
        }

        String username = generateUniqueUsername(normalizedEmail);
        Role role = (!adminGoogleEmail.isEmpty() && normalizedEmail.equals(adminGoogleEmail)) ? Role.ADMIN : Role.USER;
        User user = new User(
                username,
                normalizedEmail,
                passwordEncoder.encode(UUID.randomUUID().toString()),
            role,
            role == Role.ADMIN
        );
        try {
            return userRepository.save(user);
        } catch (org.springframework.dao.DuplicateKeyException ex) {
            // Race condition: another request created the user simultaneously
            return userRepository.findByEmailIgnoreCase(normalizedEmail)
                    .orElseThrow(() -> new IllegalArgumentException("Failed to create or find Google user"));
        }
    }

    private String generateUniqueUsername(String email) {
        String base = email.substring(0, email.indexOf("@")).replaceAll("[^a-zA-Z0-9._-]", "");
        if (base.isBlank()) {
            base = "googleuser";
        }

        String candidate = base;
        int suffix = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = base + suffix;
            suffix++;
        }
        return candidate;
    }

    private Role resolveRole(String requestRole) {
        if (requestRole == null || requestRole.isBlank()) {
            return Role.USER;
        }

        try {
            return Role.valueOf(requestRole.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid role: " + requestRole + ". Allowed: USER, ADMIN");
        }
    }
}
