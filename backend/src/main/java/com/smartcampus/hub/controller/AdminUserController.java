package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.MessageResponse;
import com.smartcampus.hub.dto.UpdateUserRequest;
import com.smartcampus.hub.dto.UserResponse;
import com.smartcampus.hub.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/users")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUserById(
            @PathVariable String id,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        return ResponseEntity.ok(userService.updateUserById(id, request));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<UserResponse> approveUserById(@PathVariable String id) {
        return ResponseEntity.ok(userService.approveUserById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteUserById(@PathVariable String id) {
        userService.deleteUserById(id);
        return ResponseEntity.ok(new MessageResponse("User deleted successfully"));
    }
}
