package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.MessageResponse;
import com.smartcampus.hub.dto.UpdateUserRequest;
import com.smartcampus.hub.dto.UserResponse;
import com.smartcampus.hub.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(userService.getCurrentUser(authentication.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateCurrentUser(
            Authentication authentication,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        return ResponseEntity.ok(userService.updateCurrentUser(authentication.getName(), request));
    }

    @DeleteMapping("/me")
    public ResponseEntity<MessageResponse> deleteCurrentUser(Authentication authentication) {
        userService.deleteCurrentUser(authentication.getName());
        return ResponseEntity.ok(new MessageResponse("User deleted successfully"));
    }
}
