package com.smartcampus.hub.repository;

import com.smartcampus.hub.model.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Resource entity.
 * Provides database operations for resource management.
 * Uses Spring Data MongoDB for document-based queries.
 */
@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {
    
    /**
     * Find all resources of a specific type.
     * 
     * @param type the resource type (LECTURE_HALL, LAB, MEETING_ROOM)
     * @return list of resources with the specified type
     */
    List<Resource> findByType(String type);
    
    /**
     * Find all resources with a specific status.
     * 
     * @param status the resource status (ACTIVE, UNDER_MAINTENANCE, OUT_OF_SERVICE)
     * @return list of resources with the specified status
     */
    List<Resource> findByStatus(String status);
    
    /**
     * Find all active resources.
     * 
     * @return list of active resources
     */
    List<Resource> findByStatusOrderByNameAsc(String status);
    
    /**
     * Find all active resources with pagination.
     * 
     * @param status the resource status
     * @param pageable pagination info
     * @return page of resources with the specified status
     */
    Page<Resource> findByStatus(String status, Pageable pageable);
    
    /**
     * Find resources by type and status.
     * 
     * @param type the resource type
     * @param status the resource status
     * @return list of resources matching type and status
     */
    List<Resource> findByTypeAndStatus(String type, String status);
    
    /**
     * Find resources by location.
     * 
     * @param location the location of the resource
     * @return list of resources at the specified location
     */
    List<Resource> findByLocation(String location);
    
    /**
     * Find resources with capacity greater than or equal to specified value.
     * 
     * @param capacity minimum capacity required
     * @return list of resources with sufficient capacity
     */
    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);
    
    /**
     * Find active resources with capacity greater than or equal to specified value.
     * 
     * @param capacity minimum capacity required
     * @return list of active resources with sufficient capacity
     */
    List<Resource> findByStatusAndCapacityGreaterThanEqual(String status, Integer capacity);
    
    /**
     * Search resources by name or location.
     * 
     * @param name search term for name
     * @param location search term for location
     * @return list of matching resources
     */
    @Query("{ $or: [ { 'name': { $regex: ?0, $options: 'i' } }, { 'location': { $regex: ?0, $options: 'i' } } ] }")
    List<Resource> searchByNameOrLocation(String searchTerm);
    
    /**
     * Find resource by name.
     * 
     * @param name the exact resource name
     * @return optional containing resource if found
     */
    Optional<Resource> findByName(String name);
    
    /**
     * Find resources created by a specific person.
     * 
     * @param createdBy the user who created the resource
     * @return list of resources created by the specified user
     */
    List<Resource> findByCreatedBy(String createdBy);
}
