# Smart Campus Operations Hub

A comprehensive full-stack web platform for managing university operations including facilities, bookings, maintenance ticketing, and real-time notifications.

## 🎯 Project Overview

This platform streamlines university operations by providing:
- **Facilities & Assets Management** - Catalog and manage rooms, labs, and equipment
- **Booking System** - Request, approve, and manage facility/equipment reservations
- **Maintenance & Incident Ticketing** - Report faults with image attachments and track resolutions
- **Real-time Notifications** - Keep users updated on bookings and ticket status
- **Role-Based Access Control** - USER, ADMIN, and TECHNICIAN roles with OAuth 2.0 Google authentication

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│          Frontend (React + Material-UI)             │
│ (Dashboard, Components, Services, State Management) │
└──────────────────────┬──────────────────────────────┘
                       │
                  HTTP/REST/WebSocket
                       │
┌──────────────────────▼──────────────────────────────┐
│        Backend (Spring Boot REST API)               │
│ (Controllers, Services, Repositories, Security)     │
└──────────────────────┬──────────────────────────────┘
                       │
           JDBC/Connection Pooling
                       │
┌──────────────────────▼──────────────────────────────┐
│      Database (PostgreSQL)                          │
│ (Users, Facilities, Bookings, Tickets, etc.)        │
└─────────────────────────────────────────────────────┘
```

## 💻 Tech Stack

**Backend:**
- Java 17 + Spring Boot 3.1.5
- Spring Data JPA + Hibernate
- Spring Security + OAuth2
- JWT Authentication
- PostgreSQL Database

**Frontend:**
- React 18.2
- Material-UI Component Library
- Redux Toolkit for State Management
- Axios for API Communication
- React Router for Navigation

**DevOps:**
- GitHub + GitHub Actions (CI/CD)
- Maven for dependency management
- Docker support (ready to implement)

## 📁 Project Structure

```
Smart_Campus_Hub/
├── backend/                    # Spring Boot REST API
│   ├── src/main/java/         # Source code
│   ├── src/test/java/         # Tests
│   └── pom.xml                # Maven config
├── frontend/                   # React Application
│   ├── src/                   # Source code
│   ├── public/                # Static assets
│   └── package.json           # NPM config
├── .github/workflows/         # CI/CD pipelines
├── docs/                      # Documentation
└── README.md
```

*See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed breakdown*

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 16+
- PostgreSQL 12+
- Git

### Backend Setup
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

The frontend will open at `http://localhost:3000` and the backend API runs on `http://localhost:8080/api`

## 🔒 Authentication

- **OAuth 2.0 Google Login** - Seamless authentication
- **JWT Tokens** - Secure API communication
- **Role-Based Access Control** - USER, ADMIN, TECHNICIAN permissions

## 📋 Module Features

### Module A: Facilities & Assets
- Create, update, delete facilities and equipment
- Catalog management
- Availability tracking

### Module B: Bookings
- Request facility/equipment bookings
- Conflict prevention and validation
- Approve/reject with comments
- Cancel with history

### Module C: Maintenance & Incident Ticketing ⭐
- Create maintenance tickets for reported faults
- Attach up to 3 images per ticket
- Status workflow (Open → In Progress → Resolved → Closed)
- Add comments and notes
- Assign to technicians
- Real-time status tracking

### Module D: Notifications
- Real-time updates on bookings and tickets
- Email/in-app notifications
- Notification history and preferences

### Module E: Authentication
- Google OAuth 2.0 integration
- Role-based authorization
- JWT token management

## 📊 Database Schema

Key tables include:
- `users` - User accounts and roles
- `facilities` - Buildings, rooms, spaces
- `equipment` - Equipment catalog
- `bookings` - Reservations with status
- `maintenance_tickets` - Service requests
- `ticket_attachments` - Images (max 3, max 10MB each)
- `notifications` - User notifications

## 🛡️ Security Features

- Input validation on all endpoints
- CORS configuration for frontend
- Role-based authorization
- File upload validation (type, size, count)
- SQL injection prevention via JPA
- XSS protection via Spring Security

## ✅ Requirements Checklist

- [x] Layered architecture (Controller → Service → Repository)
- [x] REST API best practices
- [x] Input validation and error handling
- [x] Role-based security (OAuth 2.0)
- [x] File attachment support (up to 3 images)
- [x] React modular components
- [x] Database persistence (PostgreSQL)
- [x] Clean code following conventions
- [x] GitHub repository setup
- [x] Project structure scaffolding

## 📝 Code Quality Standards

- Java/Spring conventions and naming
- React functional components with hooks
- Clean architecture patterns
- Exception handling and logging
- Unit and integration tests
- Code comments for complex logic
- No hardcoded credentials or secrets

## 🔄 CI/CD Pipeline

GitHub Actions workflows for:
- Code linting and formatting
- Unit test execution
- Integration tests
- Build verification
- Security scanning

## 📚 Documentation

- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Detailed directory layout
- API Documentation (In Progress)
- Database Schema (In Progress)
- Setup Guide (In Progress)

## 🤝 Team Collaboration

- **Version Control**: GitHub with feature branches
- **Code Review**: Pull request process
- **Issue Tracking**: GitHub Issues
- **Documentation**: Keep up-to-date with code changes

## 📞 Support & Contact

For issues, questions, or contributions, please contact the development team.

---

**Status**: Project Initialization Complete ✅  
**Last Updated**: April 2026  
**Version**: 1.0.0 (Base Structure)
