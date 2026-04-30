package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.ResourceRequest;
import com.smartcampus.hub.dto.ResourceResponse;
import com.smartcampus.hub.dto.ResourceStatusUpdateRequest;
import com.smartcampus.hub.model.ResourceStatus;
import com.smartcampus.hub.model.ResourceType;
import com.smartcampus.hub.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getAllResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(resourceService.getAllResources(type, status, location, minCapacity, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceResponse> createResource(@Valid @RequestBody ResourceRequest request, Authentication authentication) {
        String adminEmail = authentication != null ? authentication.getName() : null;
        ResourceResponse resp = resourceService.createResource(request, adminEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceResponse> updateResource(@PathVariable String id, @Valid @RequestBody ResourceRequest request) {
        return ResponseEntity.ok(resourceService.updateResource(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceResponse> patchStatus(@PathVariable String id, @Valid @RequestBody ResourceStatusUpdateRequest statusReq) {
        return ResponseEntity.ok(resourceService.patchResourceStatus(id, statusReq.getStatus()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}
