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
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuthService {

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

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already in use");
        }

        Set<Role> roles = resolveRoles(request.getRoles());

        User user = new User(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                roles
        );

        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(token, user.getUsername(), user.getEmail(),
                user.getRoles().stream().map(Role::name).collect(Collectors.toSet()));
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(token, user.getUsername(), user.getEmail(),
                user.getRoles().stream().map(Role::name).collect(Collectors.toSet()));
    }

    public AuthResponse loginWithGoogle(String idToken) {
        GoogleIdToken.Payload payload = verifyGoogleToken(idToken);

        String email = payload.getEmail();
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Google account email is missing");
        }

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> createGoogleUser(email));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(token, user.getUsername(), user.getEmail(),
                user.getRoles().stream().map(Role::name).collect(Collectors.toSet()));
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
        String username = generateUniqueUsername(email);
        User user = new User(
                username,
                email,
                passwordEncoder.encode(UUID.randomUUID().toString()),
                Set.of(Role.USER)
        );
        return userRepository.save(user);
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

    private Set<Role> resolveRoles(Set<String> requestRoles) {
        if (requestRoles == null || requestRoles.isEmpty()) {
            return Set.of(Role.USER);
        }

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
}
