package com.smartcampus.hub.repository;

import com.smartcampus.hub.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {
    List<Resource> findByStatus(String status);
    List<Resource> findByType(String type);
    List<Resource> findByLocation(String location);
}
