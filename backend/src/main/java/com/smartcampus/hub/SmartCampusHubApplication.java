package com.smartcampus.hub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

/**
 * Smart Campus Hub Backend Application
 * 
 * Main entry point for the Spring Boot REST API
 * 
 * Features:
 * - REST API endpoints for all modules
 * - OAuth 2.0 Google authentication
 * - JWT-based security
 * - Real-time notifications
 * - File upload handling
 * - Role-based access control
 */
@SpringBootApplication
@EnableAsync
@EnableScheduling
@EnableMongoAuditing
public class SmartCampusHubApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartCampusHubApplication.class, args);
        System.out.println("╔════════════════════════════════════════════════════════╗");
        System.out.println("║   Smart Campus Operations Hub - Backend Started        ║");
        System.out.println("║   API running at: http://localhost:8080/api           ║");
        System.out.println("╚════════════════════════════════════════════════════════╝");
    }
}
