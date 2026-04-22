package com.smartcampus.hub.service;

import com.smartcampus.hub.model.Resource;
import com.smartcampus.hub.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ResourceService {
    @Autowired
    private ResourceRepository resourceRepository;

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public Optional<Resource> getResourceById(String id) {
        return resourceRepository.findById(id);
    }

    public List<Resource> getResourcesByStatus(String status) {
        return resourceRepository.findByStatus(status);
    }

    public List<Resource> getResourcesByType(String type) {
        return resourceRepository.findByType(type);
    }

    public List<Resource> getResourcesByLocation(String location) {
        return resourceRepository.findByLocation(location);
    }

    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    public Resource updateResource(String id, Resource resource) {
        Optional<Resource> existing = resourceRepository.findById(id);
        if (existing.isPresent()) {
            resource.setId(id);
            return resourceRepository.save(resource);
        }
        return null;
    }

    public void deleteResource(String id) {
        resourceRepository.deleteById(id);
    }
}
