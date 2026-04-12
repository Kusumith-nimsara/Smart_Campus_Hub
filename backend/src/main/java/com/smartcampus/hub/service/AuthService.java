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

    private static final String ADMIN_GOOGLE_EMAIL = "vihanga.shehan99@gmail.com";

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
            @Value("${app.google.client-id}") String googleClientId
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
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

        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole().name(), user.isApproved());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtService.generateToken(userDetails);

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
        User user = matchedUsers.stream()
            .filter(User::isApproved)
            .findFirst()
            .orElseGet(() -> matchedUsers.stream().findFirst().orElseGet(() -> createGoogleUser(email)));

        Role expectedRole = normalizedEmail.equals(ADMIN_GOOGLE_EMAIL) ? Role.ADMIN : Role.USER;
        boolean anyApproved = matchedUsers.stream().anyMatch(User::isApproved);
        boolean expectedApproval = expectedRole == Role.ADMIN || user.isApproved() || anyApproved;
        if (user.getRole() != expectedRole || user.isApproved() != expectedApproval) {
            user.setRole(expectedRole);
            user.setApproved(expectedApproval);
            user = userRepository.save(user);
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole().name(), user.isApproved());
    }

    private GoogleIdToken.Payload verifyGoogleToken(String idToken) {
        try {
            GoogleIdToken googleIdToken = googleIdTokenVerifier.verify(idToken);
            if (googleIdToken == null) {
                throw new IllegalArgumentException("Invalid Google token");
            }
            return googleIdToken.getPayload();
        } catch (GeneralSecurityException | IOException ex) {
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
        Role role = normalizedEmail.equals(ADMIN_GOOGLE_EMAIL) ? Role.ADMIN : Role.USER;
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
