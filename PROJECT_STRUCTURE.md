# Smart Campus Hub - Project Structure Documentation

## 📋 Project Overview

Smart Campus Operations Hub is a full-stack web platform designed to manage university operations including:
- **Facilities & Assets**: Room and equipment management
- **Bookings**: Request, approval, and conflict prevention
- **Maintenance & Incident Ticketing**: Fault reporting with attachments
- **Notifications**: Real-time updates
- **Authentication**: OAuth 2.0 Google login with role-based access (USER, ADMIN, TECHNICIAN)

## 🏗️ Directory Structure

### Backend (Spring Boot REST API)

```
backend/
├── pom.xml                          # Maven configuration
├── src/
│   ├── main/
│   │   ├── java/com/smartcampus/hub/
│   │   │   ├── SmartCampusHubApplication.java    # Main entry point
│   │   │   ├── controller/                        # REST API endpoints
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── FacilityController.java
│   │   │   │   ├── BookingController.java
│   │   │   │   ├── MaintenanceController.java
│   │   │   │   └── NotificationController.java
│   │   │   ├── service/                           # Business logic
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── FacilityService.java
│   │   │   │   ├── BookingService.java
│   │   │   │   ├── MaintenanceService.java
│   │   │   │   └── NotificationService.java
│   │   │   ├── repository/                        # Database access
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── FacilityRepository.java
│   │   │   │   ├── BookingRepository.java
│   │   │   │   ├── MaintenanceTicketRepository.java
│   │   │   │   └── NotificationRepository.java
│   │   │   ├── model/
│   │   │   │   ├── entity/                        # JPA entities (DB models)
│   │   │   │   │   ├── User.java
│   │   │   │   │   ├── Facility.java
│   │   │   │   │   ├── Equipment.java
│   │   │   │   │   ├── Booking.java
│   │   │   │   │   ├── MaintenanceTicket.java
│   │   │   │   │   ├── TicketAttachment.java
│   │   │   │   │   └── Notification.java
│   │   │   │   └── dto/                           # Data Transfer Objects
│   │   │   │       ├── AuthRequestDTO.java
│   │   │   │       ├── UserDTO.java
│   │   │   │       ├── FacilityDTO.java
│   │   │   │       ├── BookingDTO.java
│   │   │   │       ├── MaintenanceTicketDTO.java
│   │   │   │       └── NotificationDTO.java
│   │   │   ├── exception/                         # Custom exceptions & handlers
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   ├── ValidationException.java
│   │   │   │   └── UnauthorizedException.java
│   │   │   ├── config/                            # Configuration classes
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── WebConfig.java
│   │   │   │   └── JwtConfig.java
│   │   │   ├── security/                          # Security utilities
│   │   │   │   ├── JwtTokenProvider.java
│   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   ├── CustomUserDetailsService.java
│   │   │   │   └── SecurityConstants.java
│   │   │   └── util/                              # Utility classes
│   │   │       ├── FileUploadUtil.java
│   │   │       ├── ValidationUtil.java
│   │   │       └── DateUtil.java
│   │   └── resources/
│   │       ├── application.properties             # Main config
│   │       ├── application-dev.properties        # Development config
│   │       ├── application-prod.properties       # Production config
│   │       └── db/migration/                      # Flyway/Liquibase migrations (optional)
│   └── test/
│       └── java/com/smartcampus/hub/             # Unit & integration tests
│           ├── controller/
│           ├── service/
│           └── repository/
```

### Frontend (React with Material-UI)

```
frontend/
├── package.json                     # NPM dependencies & scripts
├── .env.example                     # Environment variables template
├── public/                          # Static assets
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── index.js                     # React entry point
│   ├── App.jsx                      # Main App component
│   ├── components/
│   │   ├── common/                  # Reusable components
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   ├── auth/                    # Authentication components
│   │   │   ├── LoginPage.jsx
│   │   │   ├── GoogleLoginButton.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── facilities/              # Facilities & Assets components
│   │   │   ├── FacilityList.jsx
│   │   │   ├── FacilityDetail.jsx
│   │   │   ├── FacilityForm.jsx
│   │   │   ├── EquipmentList.jsx
│   │   │   └── EquipmentForm.jsx
│   │   ├── bookings/                # Booking components
│   │   │   ├── BookingList.jsx
│   │   │   ├── BookingForm.jsx
│   │   │   ├── BookingDetail.jsx
│   │   │   └── BookingCalendar.jsx
│   │   ├── maintenance/             # Maintenance & Incident components
│   │   │   ├── TicketList.jsx
│   │   │   ├── TicketForm.jsx
│   │   │   ├── TicketDetail.jsx
│   │   │   ├── ImageUpload.jsx
│   │   │   └── TicketComments.jsx
│   │   └── notifications/           # Notification components
│   │       ├── NotificationCenter.jsx
│   │       ├── NotificationBell.jsx
│   │       └── NotificationList.jsx
│   ├── pages/                       # Page components
│   │   ├── Dashboard.jsx
│   │   ├── FacilitiesPage.jsx
│   │   ├── BookingsPage.jsx
│   │   ├── MaintenancePage.jsx
│   │   ├── AdminPanel.jsx
│   │   └── NotFoundPage.jsx
│   ├── hooks/                       # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useFetch.js
│   │   ├── useForm.js
│   │   └── useNotifications.js
│   ├── services/                    # API services
│   │   ├── api.js                   # Axios instance configuration
│   │   ├── authService.js
│   │   ├── facilityService.js
│   │   ├── bookingService.js
│   │   ├── maintenanceService.js
│   │   └── notificationService.js
│   ├── utils/                       # Utility functions
│   │   ├── constants.js
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   ├── localStorage.js
│   │   └── errorHandler.js
│   ├── styles/                      # Global styles
│   │   ├── index.css
│   │   ├── theme.js
│   │   └── variables.css
│   ├── config/                      # Configuration files
│   │   ├── api.config.js
│   │   ├── roles.js
│   │   └── permissions.js
│   └── App.css
```

## 🗄️ Database Schema Overview

### Key Entities:
1. **User** - Authentication and role management
2. **Facility** - Buildings, rooms, spaces
3. **Equipment** - Equipment catalog
4. **Booking** - Facility/equipment reservations
5. **MaintenanceTicket** - Service requests (Module C focus)
6. **TicketAttachment** - Images/files for tickets (max 3)
7. **Notification** - User notifications

## 🔐 Security Architecture

- **Authentication**: OAuth 2.0 (Google) + JWT tokens
- **Authorization**: Role-based access control (USER, ADMIN, TECHNICIAN)
- **File Upload**: Validated with size limits (10MB per file, max 3 per ticket)
- **CORS**: Configured for frontend origin
- **Password**: Spring Security configuration

## 🚀 Development Setup

### Backend Requirements:
- Java 17+
- Maven 3.8+
- PostgreSQL 12+

### Frontend Requirements:
- Node.js 16+
- npm or yarn

### Build & Run:

**Backend:**
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

## 📦 Key Dependencies

### Backend:
- Spring Boot 3.1.5
- Spring Data JPA
- Spring Security + OAuth2
- JWT (io.jsonwebtoken)
- PostgreSQL Driver
- Lombok
- JUnit 5

### Frontend:
- React 18.2
- Material-UI 5.14
- React Router 6.20
- Axios
- Redux Toolkit + React Redux
- Formik + Yup (validation)

## 📝 Code Quality Standards

- Exception handling and validation on both layers
- DTOs for API communication
- Layered architecture separation
- No sensitive data in logs
- RESTful API naming conventions
- React functional components with hooks
- Proper error boundaries

## 🔄 GitHub Actions Workflow

CI/CD pipeline includes:
- Code linting & formatting
- Unit tests
- Integration tests
- Build verification
- Security scanning

---

**Last Updated**: April 2026
**Status**: Project Structure Initialized
