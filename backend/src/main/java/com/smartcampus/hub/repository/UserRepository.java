package com.smartcampus.hub.repository;

import com.smartcampus.hub.model.Role;
import com.smartcampus.hub.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    List<User> findByRole(Role role);
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    List<User> findAllByEmailIgnoreCase(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
    boolean existsByEmailIgnoreCase(String email);

    boolean existsByRegistrationNumber(String registrationNumber);

    boolean existsByMobileNumber(String mobileNumber);
}
