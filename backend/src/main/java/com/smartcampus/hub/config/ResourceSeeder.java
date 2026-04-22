package com.smartcampus.hub.config;

import com.smartcampus.hub.model.Resource;
import com.smartcampus.hub.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class ResourceSeeder implements CommandLineRunner {
    @Autowired
    private ResourceRepository resourceRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only seed if collection is empty
        if (resourceRepository.count() == 0) {
            seedResources();
        }
    }

    private void seedResources() {
        // Sample locations for campus resources
        String[] locations = {
            "Room 101",
            "Room 102",
            "Room 201",
            "Room 202",
            "Lab A",
            "Lab B",
            "Building A",
            "Building B",
            "Auditorium",
            "Cafeteria",
            "Library",
            "Gymnasium",
            "Parking Lot A",
            "Parking Lot B",
            "Main Gate",
            "Admin Office"
        };

        for (String location : locations) {
            Resource resource = new Resource();
            resource.setName(location + " Resource");
            resource.setType("Facility");
            resource.setLocation(location);
            resource.setCapacity(50);
            resource.setDescription("Campus resource at " + location);
            resource.setStatus("ACTIVE");
            resource.setCreatedBy("SYSTEM");
            resource.setImageUrl("");
            
            resourceRepository.save(resource);
        }

        System.out.println("✅ Resources database seeded with " + locations.length + " locations");
    }
}
