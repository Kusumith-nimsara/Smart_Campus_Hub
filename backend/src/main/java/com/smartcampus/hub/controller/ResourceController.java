package com.smartcampus.hub.controller;

import com.smartcampus.hub.model.Resource;
import com.smartcampus.hub.service.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/resources")
@CrossOrigin(origins = "*")
public class ResourceController {
    @Autowired
    private ResourceService resourceService;

    /**
     * Get all resources - PUBLIC ACCESS
     */
    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<Resource>> getAllResources() {
        try {
            List<Resource> resources = resourceService.getAllResources();
            return ResponseEntity.ok(resources);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get resource by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(
            @PathVariable String id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            return resourceService.getResourceById(id)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get resources by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Resource>> getResourcesByStatus(
            @PathVariable String status,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            List<Resource> resources = resourceService.getResourcesByStatus(status);
            return ResponseEntity.ok(resources);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get resources by type
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Resource>> getResourcesByType(
            @PathVariable String type,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            List<Resource> resources = resourceService.getResourcesByType(type);
            return ResponseEntity.ok(resources);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create resource (admin only)
     */
    @PostMapping
    public ResponseEntity<Resource> createResource(
            @RequestBody Resource resource,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Resource created = resourceService.createResource(resource);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update resource (admin only)
     */
    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(
            @PathVariable String id,
            @RequestBody Resource resource,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Resource updated = resourceService.updateResource(id, resource);
            if (updated != null) {
                return ResponseEntity.ok(updated);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete resource (admin only)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(
            @PathVariable String id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            resourceService.deleteResource(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
