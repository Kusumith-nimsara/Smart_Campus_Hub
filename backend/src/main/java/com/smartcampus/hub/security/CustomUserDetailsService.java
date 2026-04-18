package com.smartcampus.hub.security;

import com.smartcampus.hub.model.User;
import com.smartcampus.hub.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user = null;
        if (identifier.contains("@")) {
            user = userRepository.findByEmailIgnoreCase(identifier).orElse(null);
        }
        if (user == null) {
            user = userRepository.findByUsername(identifier)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + identifier));
        }

        // Block suspended users and unapproved non-admin users at the security level
        boolean isApprovedOrAdmin = user.isApproved() || user.getRole() == com.smartcampus.hub.model.Role.ADMIN;
        boolean isSuspended = user.isSuspended();

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                isApprovedOrAdmin,        // enabled — false if unapproved
                true,                     // accountNonExpired
                true,                     // credentialsNonExpired
                !isSuspended,             // accountNonLocked — false if suspended
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
