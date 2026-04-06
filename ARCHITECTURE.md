# Smart Campus Hub - Architecture & Module Specifications

## 🏗️ Layered Architecture Overview

```
┌────────────────────────────────────────────────────┐
│         Presentation Layer (REST Controllers)      │
│  Handles HTTP requests/responses, validation      │
└────────────────────┬─────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────┐
│           Business Logic Layer (Services)          │
│  Business rules, processing, transactions         │
└────────────────────┬─────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────┐
│        Data Access Layer (Repositories)            │
│  Database queries using Spring Data JPA           │
└────────────────────┬─────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────┐
│         Database Layer (PostgreSQL)                │
│  Data persistence and retrieval                   │
└────────────────────────────────────────────────────┘
```

## 📦 Module Specifications

### Module A: Authentication & Authorization
**Responsibility:** OAuth 2.0 integration, JWT token management, role-based access

**Key Components:**
- `AuthController` - Authentication endpoints
- `AuthService` - OAuth 2.0 logic
- `JwtTokenProvider` - Token generation/validation
- `SecurityConfig` - Spring Security configuration
- `User` entity with roles (USER, ADMIN, TECHNICIAN)

**API Endpoints:**
```
POST /api/auth/login          - Google OAuth login
POST /api/auth/logout         - User logout
POST /api/auth/refresh        - Refresh JWT token
GET  /api/auth/me            - Get current user info
```

---

### Module B: Facilities & Assets Management
**Responsibility:** Manage rooms, labs, equipment, and asset cataloging

**Key Components:**
- `FacilityController` - Facility endpoints
- `EquipmentController` - Equipment endpoints
- `FacilityService` - Business logic
- `FacilityRepository` - Database access
- `Facility` & `Equipment` entities

**Database Tables:**
```sql
facilities (id, name, location, capacity, type, status)
equipment (id, name, description, facility_id, status)
```

**API Endpoints:**
```
GET    /api/facilities              - List all facilities
POST   /api/facilities              - Create facility (ADMIN)
GET    /api/facilities/{id}         - Get facility details
PUT    /api/facilities/{id}         - Update facility (ADMIN)
DELETE /api/facilities/{id}         - Delete facility (ADMIN)

GET    /api/equipment               - List equipment
POST   /api/equipment               - Create equipment (ADMIN)
GET    /api/equipment/{id}          - Get equipment details
PUT    /api/equipment/{id}          - Update equipment (ADMIN)
DELETE /api/equipment/{id}          - Delete equipment (ADMIN)
```

---

### Module C: Maintenance & Incident Ticketing ⭐
**Responsibility:** Create, manage, and track maintenance tickets with image attachments

**Key Components:**
- `MaintenanceController` - Ticket endpoints
- `MaintenanceService` - Business logic
- `MaintenanceTicketRepository` - Database access
- `FileUploadUtil` - File handling
- `MaintenanceTicket` & `TicketAttachment` entities

**Database Tables:**
```sql
maintenance_tickets (
    id, title, description, facility_id, status,
    priority, created_at, updated_at, assigned_technician_id
)

ticket_attachments (
    id, ticket_id, file_name, file_path, file_size,
    mime_type, uploaded_at
)

ticket_comments (
    id, ticket_id, user_id, comment, created_at
)
```

**Ticket Status Workflow:**
```
Open (Created) 
  ↓
In Progress (Assigned to technician)
  ↓
Resolved (Problem fixed, awaiting verification)
  ↓
Closed (Verified and completed)
```

**File Attachment Constraints:**
- Maximum 3 images per ticket
- Supported formats: JPG, JPEG, PNG, GIF
- Maximum file size: 10MB per image
- Total size per ticket: 30MB max

**API Endpoints:**
```
GET    /api/tickets                         - List tickets (filter by status)
POST   /api/tickets                         - Create ticket (USER)
GET    /api/tickets/{id}                    - Get ticket details
PUT    /api/tickets/{id}                    - Update ticket
DELETE /api/tickets/{id}                    - Delete ticket (Creator/ADMIN)

POST   /api/tickets/{id}/attachments        - Upload images (max 3)
GET    /api/tickets/{id}/attachments        - List attachments
DELETE /api/tickets/{id}/attachments/{fid}  - Delete attachment

POST   /api/tickets/{id}/comments           - Add comment
GET    /api/tickets/{id}/comments           - Get comments
DELETE /api/tickets/{id}/comments/{cid}     - Delete comment

PUT    /api/tickets/{id}/status             - Update status (TECHNICIAN/ADMIN)
PUT    /api/tickets/{id}/assign-technician  - Assign technician (ADMIN)
```

**Request/Response Examples:**

**Create Ticket:**
```json
POST /api/tickets
{
  "title": "Broken Air Conditioner in Room 101",
  "description": "AC unit not cooling properly",
  "facilityId": 1,
  "priority": "HIGH"
}
```

**Upload Attachment:**
```
POST /api/tickets/1/attachments
Form-Data:
- file: [image.jpg]
- file: [image2.png]
- file: [image3.jpg]
```

---

### Module D: Booking System
**Responsibility:** Request and manage facility/equipment reservations with conflict prevention

**Key Components:**
- `BookingController` - Booking endpoints
- `BookingService` - Business logic & conflict detection
- `BookingRepository` - Database access
- `Booking` entity

**Database Tables:**
```sql
bookings (
    id, user_id, facility_id, equipment_id,
    start_time, end_time, status, created_at, approved_by,
    approval_comments
)
```

**Booking Status Workflow:**
```
Pending (Created, awaiting approval)
  ↓
Approved (Admin approved)
  ↓
Completed (Event finished)
  ✗ Rejected (Admin rejected)
  ✗ Cancelled (User cancelled)
```

**API Endpoints:**
```
GET    /api/bookings                    - List bookings
POST   /api/bookings                    - Create booking (USER)
GET    /api/bookings/{id}               - Get booking details
PUT    /api/bookings/{id}               - Update booking
DELETE /api/bookings/{id}               - Cancel booking

PUT    /api/bookings/{id}/approve       - Approve booking (ADMIN)
PUT    /api/bookings/{id}/reject        - Reject booking (ADMIN)
```

---

### Module E: Notifications
**Responsibility:** Real-time updates for bookings and ticket changes

**Key Components:**
- `NotificationController` - Notification endpoints
- `NotificationService` - Business logic
- `NotificationRepository` - Database access
- `Notification` entity

**Database Tables:**
```sql
notifications (
    id, user_id, type, title, message,
    related_entity_id, is_read, created_at
)
```

**Notification Types:**
- `BOOKING_APPROVED` - Booking approved by admin
- `BOOKING_REJECTED` - Booking rejected
- `TICKET_CREATED` - New ticket created
- `TICKET_ASSIGNED` - Ticket assigned to technician
- `TICKET_STATUS_CHANGED` - Ticket status updated
- `TICKET_COMMENT_ADDED` - New comment on ticket

**API Endpoints:**
```
GET    /api/notifications              - List user notifications
POST   /api/notifications/{id}/read    - Mark as read
DELETE /api/notifications/{id}         - Delete notification
```

---

## 🗄️ Entity Relationships

```
┌─────────────┐
│   User      │
├─────────────┤
│ id (PK)     │
│ email       │
│ name        │
│ role        │
└────┬────────┘
     │
     ├──→ ┌──────────────────┐
     │    │    Booking       │
     │    ├──────────────────┤
     │    │ id (PK)          │
     │    │ user_id (FK)     │
     │    └──────────────────┘
     │
     └──→ ┌──────────────────┐
          │ MaintenanceTicket│
          ├──────────────────┤
          │ id (PK)          │
          │ created_by (FK)  │
          │ assigned_to (FK) │
          └──────┬───────────┘
                 │
                 ├──→ ┌─────────────────┐
                 │    │ TicketAttachment│
                 │    └─────────────────┘
                 │
                 └──→ ┌─────────────────┐
                      │ TicketComment   │
                      └─────────────────┘

┌─────────────┐
│  Facility   │
├─────────────┤
│ id (PK)     │
│ name        │
│ location    │
└────┬────────┘
     │
     ├──→ Booking
     │    Equipment
     │
     └──→ MaintenanceTicket
```

---

## 🔒 Security Architecture

### Authentication Flow
```
1. User clicks "Login with Google"
2. Frontend redirects to Google OAuth
3. Google authenticates user
4. Google redirects back with auth code
5. Backend exchanges code for tokens
6. Backend creates JWT token
7. Frontend stores JWT in localStorage
8. Subsequent requests include JWT in Authorization header
```

### Authorization (Role-Based Access)

| Role | Permissions |
|------|---|
| USER | Create bookings, create tickets, view own data |
| ADMIN | Create/edit/delete facilities, approve/reject bookings, assign technicians, manage users |
| TECHNICIAN | View assigned tickets, update ticket status, add comments |

---

## 🎨 Frontend Architecture

### Component Hierarchy

```
App
├── Header
│   ├── Logo
│   ├── Navigation
│   └── UserMenu
├── Sidebar
│   ├── NavLink (Facilities)
│   ├── NavLink (Bookings)
│   ├── NavLink (Maintenance)
│   └── NavLink (Notifications)
└── MainContent
    ├── Dashboard
    ├── FacilitiesList
    ├── BookingForm
    ├── MaintenanceList
    │   ├── TicketForm
    │   ├── ImageUpload
    │   └── TicketComments
    └── NotificationCenter
```

### State Management (Redux / Zustand)

**Store Structure:**
```JavaScript
{
  auth: { user, token, isAuthenticated },
  facilities: { items, loading, error },
  bookings: { items, loading, error },
  tickets: { items, loading, error },
  notifications: { items, unreadCount }
}
```

---

## 🧪 Testing Strategy

### Backend Testing

**Unit Tests:**
- Test individual service methods
- Mock repositories
- Test data validation

**Integration Tests:**
- Test controller endpoints
- Use embedded database (H2)
- Test database interactions

**Example Test:**
```java
@SpringBootTest
class BookingServiceTest {
    @MockBean
    private BookingRepository bookingRepository;
    
    @InjectMocks
    private BookingService bookingService;
    
    @Test
    void testCreateBooking_Success() {
        // Arrange
        BookingDTO dto = new BookingDTO(...);
        
        // Act
        Booking result = bookingService.createBooking(dto);
        
        // Assert
        assertNotNull(result.getId());
    }
}
```

### Frontend Testing

**Unit Tests:**
- Test component rendering
- Test props and state changes
- Mock API calls

**Integration Tests:**
- Test user workflows
- Test component interactions

---

## 📊 Performance Considerations

1. **Database Indexing**: Add indexes on frequently queried fields
2. **Pagination**: Implement for large lists (facilities, bookings, tickets)
3. **Caching**: Cache facility and equipment data
4. **Async Operations**: Use async for file uploads and notifications
5. **QueryDSL**: Use for complex queries
6. **Frontend Optimization**: Code splitting, lazy loading

---

## 🔄 REST API Best Practices

### Naming Conventions
- Use nouns for endpoints: `/api/tickets` not `/api/getTickets`
- Use HTTP methods: `POST` for create, `GET` for read, `PUT` for update, `DELETE` for delete
- Use plural nouns: `/api/bookings` not `/api/booking`
- Use hyphens for multi-word resources: `/api/maintenance-tickets`

### Response Format
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Ticket not found",
    "details": {}
  }
}
```

### Status Codes
- 200 OK - Successful GET/PUT/PATCH
- 201 Created - Successful POST
- 204 No Content - Successful DELETE
- 400 Bad Request - Validation error
- 401 Unauthorized - Authentication required
- 403 Forbidden - Insufficient permissions
- 404 Not Found - Resource not found
- 500 Internal Server Error - Server error

---

## 📝 Code Quality Standards

### Java Coding Standards
- Use PascalCase for class names
- Use camelCase for method/variable names
- Use UPPER_SNAKE_CASE for constants
- Add Javadoc comments for public methods
- Follow Spring Boot naming conventions
- Keep methods focused and small

### React Coding Standards
- Use PascalCase for component names
- Use camelCase for functions/variables
- Use functional components with hooks
- Extract reusable logic into custom hooks
- Use meaningful component prop names
- Add PropTypes or TypeScript types

---

**Last Updated**: April 2026  
**Version**: 1.0.0
