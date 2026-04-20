package com.smartcampus.hub.util;

import com.smartcampus.hub.model.Role;
import com.smartcampus.hub.model.Ticket;
import com.smartcampus.hub.model.User;
import com.smartcampus.hub.repository.TicketRepository;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * One-time utility to generate admin notifications for all existing tickets.
 * Usage: Add @Component annotation, run the backend once, then remove this file.
 */
@Component
public class AdminTicketNotificationBackfill implements CommandLineRunner {
    @Autowired
    private TicketRepository ticketRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private NotificationService notificationService;

    @Override
    public void run(String... args) {
        List<Ticket> tickets = ticketRepository.findAll();
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (Ticket ticket : tickets) {
            for (User admin : admins) {
                notificationService.createNotification(
                        admin.getId(),
                        "New Ticket Submitted (Backfill)",
                        "[Backfill] Ticket: " + ticket.getTitle(),
                        "TICKET_CREATED",
                        ticket.getId(),
                        "TICKET"
                );
            }
        }
        System.out.println("Backfill complete: Admin notifications created for all tickets.");
    }
}
