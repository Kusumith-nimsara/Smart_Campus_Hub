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
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // Block suspended users and unapproved non-admin users at the security level
        boolean isEnabled = !user.isSuspended()
                && (user.isApproved() || user.getRole() == com.smartcampus.hub.model.Role.ADMIN);

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                isEnabled,                // enabled — false if suspended or unapproved
                true,                     // accountNonExpired
                true,                     // credentialsNonExpired
                true,                     // accountNonLocked
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
