package com.smartcampus.hub.repository;

import com.smartcampus.hub.model.Ticket;
import com.smartcampus.hub.model.TicketStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface TicketRepository extends MongoRepository<Ticket, String> {
    
    // Find tickets created by a user
    Page<Ticket> findByCreatedById(String userId, Pageable pageable);
    
    // Find tickets assigned to a technician
    Page<Ticket> findByAssignedToId(String assignedToId, Pageable pageable);
    
    // Find all tickets with a specific status
    Page<Ticket> findByStatus(TicketStatus status, Pageable pageable);
    
    // Find tickets created by user with specific status
    Page<Ticket> findByCreatedByIdAndStatus(String userId, TicketStatus status, Pageable pageable);
    
    // Find tickets by priority
    Page<Ticket> findByPriority(String priority, Pageable pageable);
    
    // Find all unassigned tickets
    Page<Ticket> findByAssignedToIdIsNull(Pageable pageable);
    
    // Count open tickets created by user
    long countByCreatedByIdAndStatus(String userId, TicketStatus status);
    
    // Count assigned unresolved tickets
    long countByAssignedToIdAndStatusNotIn(String assignedToId, List<TicketStatus> statuses);
    
    // Find tickets assigned to technician with specific status
    Page<Ticket> findByAssignedToIdAndStatus(String assignedToId, TicketStatus status, Pageable pageable);
    
    // Find all open tickets (unassigned)
    long countByStatusAndAssignedToIdIsNull(TicketStatus status);
}
