package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.AvailabilityWindowDto;
import com.smartcampus.hub.dto.ResourceRequest;
import com.smartcampus.hub.dto.ResourceResponse;
import com.smartcampus.hub.exception.DuplicateResourceException;
import com.smartcampus.hub.exception.ResourceNotFoundException;
import com.smartcampus.hub.model.AvailabilityWindow;
import com.smartcampus.hub.model.Resource;
import com.smartcampus.hub.model.ResourceStatus;
import com.smartcampus.hub.model.ResourceType;
import com.smartcampus.hub.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResourceService {

    private final ResourceRepository repository;

    public ResourceService(ResourceRepository repository) {
        this.repository = repository;
    }

    public List<ResourceResponse> getAllResources(ResourceType type, ResourceStatus status, String location, Integer minCapacity, String search) {
        List<Resource> results;

        if (search != null && !search.isBlank()) {
            results = repository.findByNameContainingIgnoreCaseOrLocationContainingIgnoreCaseOrDescriptionContainingIgnoreCase(search, search, search);
        } else if (type != null && status != null) {
            results = repository.findByTypeAndStatus(type, status);
        } else if (type != null) {
            results = repository.findByType(type);
        } else if (status != null) {
            results = repository.findByStatus(status);
        } else if (location != null && !location.isBlank()) {
            results = repository.findByLocationContainingIgnoreCase(location);
        } else {
            results = repository.findAll();
        }

        // apply minCapacity filter if provided
        if (minCapacity != null) {
            results = results.stream()
                    .filter(r -> r.getCapacity() != null && r.getCapacity() >= minCapacity)
                    .collect(Collectors.toList());
        }

        return results.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public ResourceResponse getResourceById(String id) {
        Resource resource = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        return mapToResponse(resource);
    }

    public ResourceResponse createResource(ResourceRequest request, String adminEmail) {
        if (repository.existsByNameAndLocation(request.getName(), request.getLocation())) {
            throw new DuplicateResourceException();
        }

        Resource r = new Resource();
        r.setName(request.getName());
        r.setType(request.getType());
        r.setCapacity(request.getCapacity());
        r.setLocation(request.getLocation());
        r.setDescription(request.getDescription());
        r.setStatus(request.getStatus());
        r.setImageUrl(request.getImageUrl());
        r.setCreatedBy(adminEmail);

        if (request.getAvailabilityWindows() != null) {
            List<AvailabilityWindow> aw = new ArrayList<>();
            for (AvailabilityWindowDto dto : request.getAvailabilityWindows()) {
                aw.add(new AvailabilityWindow(dto.getDayOfWeek(), dto.getStartTime(), dto.getEndTime()));
            }
            r.setAvailabilityWindows(aw);
        }

        Resource saved = repository.save(r);
        return mapToResponse(saved);
    }

    public ResourceResponse updateResource(String id, ResourceRequest request) {
        Resource existing = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        // if name or location changed, check duplicate
        if (!existing.getName().equals(request.getName()) || !existing.getLocation().equals(request.getLocation())) {
            if (repository.existsByNameAndLocation(request.getName(), request.getLocation())) {
                throw new DuplicateResourceException();
            }
        }

        existing.setName(request.getName());
        existing.setType(request.getType());
        existing.setCapacity(request.getCapacity());
        existing.setLocation(request.getLocation());
        existing.setDescription(request.getDescription());
        existing.setStatus(request.getStatus());
        existing.setImageUrl(request.getImageUrl());

        if (request.getAvailabilityWindows() != null) {
            List<AvailabilityWindow> aw = new ArrayList<>();
            for (AvailabilityWindowDto dto : request.getAvailabilityWindows()) {
                aw.add(new AvailabilityWindow(dto.getDayOfWeek(), dto.getStartTime(), dto.getEndTime()));
            }
            existing.setAvailabilityWindows(aw);
        } else {
            existing.setAvailabilityWindows(null);
        }

        Resource saved = repository.save(existing);
        return mapToResponse(saved);
    }

    public ResourceResponse patchResourceStatus(String id, ResourceStatus newStatus) {
        Resource existing = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        existing.setStatus(newStatus);
        Resource saved = repository.save(existing);
        return mapToResponse(saved);
    }

    public void deleteResource(String id) {
        Resource existing = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        repository.delete(existing);
    }

    private ResourceResponse mapToResponse(Resource resource) {
        ResourceResponse resp = new ResourceResponse();
        resp.setId(resource.getId());
        resp.setName(resource.getName());
        resp.setType(resource.getType());
        resp.setCapacity(resource.getCapacity());
        resp.setLocation(resource.getLocation());
        resp.setDescription(resource.getDescription());
        resp.setStatus(resource.getStatus());
        resp.setImageUrl(resource.getImageUrl());
        resp.setCreatedBy(resource.getCreatedBy());
        resp.setCreatedAt(resource.getCreatedAt());
        resp.setUpdatedAt(resource.getUpdatedAt());

        if (resource.getAvailabilityWindows() != null) {
            List<AvailabilityWindowDto> dtos = new ArrayList<>();
            for (AvailabilityWindow aw : resource.getAvailabilityWindows()) {
                AvailabilityWindowDto dto = new AvailabilityWindowDto();
                dto.setDayOfWeek(aw.getDayOfWeek());
                dto.setStartTime(aw.getStartTime());
                dto.setEndTime(aw.getEndTime());
                dtos.add(dto);
            }
            resp.setAvailabilityWindows(dtos);
        }

        resp.setAvailableNow(computeAvailableNow(resource.getAvailabilityWindows()));

        return resp;
    }

    private boolean computeAvailableNow(List<AvailabilityWindow> windows) {
        if (windows == null || windows.isEmpty()) return false;

        String today = LocalDate.now().getDayOfWeek().name();
        LocalTime now = LocalTime.now();

        for (AvailabilityWindow w : windows) {
            if (w == null || w.getDayOfWeek() == null) continue;
            if (!today.equalsIgnoreCase(w.getDayOfWeek())) continue;

            try {
                LocalTime start = LocalTime.parse(w.getStartTime());
                LocalTime end = LocalTime.parse(w.getEndTime());
                if (!start.isAfter(end)) {
                    if ((now.equals(start) || now.isAfter(start)) && (now.equals(end) || now.isBefore(end))) {
                        return true;
                    }
                } else {
                    // overnight window (start > end) e.g. 22:00 - 06:00
                    if (now.equals(start) || now.isAfter(start) || now.isBefore(end)) {
                        return true;
                    }
                }
            } catch (Exception e) {
                // ignore parse errors for a single window
            }
        }

        return false;
    }
}
