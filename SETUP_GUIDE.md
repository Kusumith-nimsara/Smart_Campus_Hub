# Smart Campus Hub - Setup & Development Guide

## 📋 Prerequisites

Ensure you have the following installed:

### Backend Requirements
- **Java Development Kit (JDK)**: Version 17 or higher
- **Maven**: Version 3.8.0 or higher
- **PostgreSQL**: Version 12 or higher
- **Git**: For version control

### Frontend Requirements
- **Node.js**: Version 16 or higher (includes npm)
- **Git**: For version control

### Optional Tools
- **Docker & Docker Compose**: For containerized development
- **Postman**: For API testing
- **pgAdmin**: For PostgreSQL management

---

## 🔧 Development Environment Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/smart-campus-hub.git
cd smart_campus_hub
```

### Step 2: Setup PostgreSQL Database

**Create Database:**
```sql
CREATE DATABASE smart_campus_hub;
CREATE USER campus_user WITH PASSWORD 'secure_password';
ALTER ROLE campus_user SET client_encoding TO 'utf8';
ALTER ROLE campus_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE campus_user SET default_transaction_deferrable TO on;
GRANT ALL PRIVILEGES ON DATABASE smart_campus_hub TO campus_user;
```

**Verify Connection:**
```bash
psql -h localhost -U campus_user -d smart_campus_hub
```

### Step 3: Configure Environment Variables

**Backend (.env or application-dev.properties):**
```properties
# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/smart_campus_hub
DATABASE_USER=campus_user
DATABASE_PASSWORD=secure_password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here_min_32_chars_recommended

# Server
SERVER_PORT=8080
```

**Frontend (.env file):**
```env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_ENV=development
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
REACT_APP_NOTIFICATION_WS_URL=ws://localhost:8080/api/ws
```

### Step 4: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies and build
mvn clean install

# Run database migrations (if using Flyway)
mvn flyway:migrate

# Start the Spring Boot application
mvn spring-boot:run

# Application will start on http://localhost:8080
```

**Verify Backend is Running:**
```bash
curl http://localhost:8080/api/health
```

### Step 5: Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Application will open at http://localhost:3000
```

---

## 🔑 Google OAuth 2.0 Setup

### Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → Create OAuth 2.0 Client ID
5. Select "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/callback`
   - `http://localhost:8080/api/auth/callback`
7. Copy Client ID and Client Secret
8. Add to your `.env` files

---

## 📁 Project Structure Overview

```
Smart_Campus_Hub/
├── backend/                      # Spring Boot REST API
│   ├── pom.xml
│   ├── src/main/java/           # Java source code
│   ├── src/main/resources/      # Configuration & migrations
│   └── src/test/java/           # Unit & integration tests
├── frontend/                     # React Application
│   ├── package.json
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/              # Page containers
│   │   ├── services/           # API services
│   │   └── hooks/              # Custom hooks
│   └── public/                 # Static assets
├── .github/
│   └── workflows/              # CI/CD pipelines
└── docs/                        # Documentation
```

---

## 🚀 Running the Application

### Option 1: Local Development

**Terminal 1 - Backend:**
```bash
cd backend
mvn spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Option 2: Using Docker Compose (When Ready)

```bash
docker-compose up --build
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=BookingServiceTest

# Run with coverage
mvn jacoco:report
mvn sonar:sonar
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run single test file
npm test -- BookingList.test.jsx
```

---

## 🔍 Code Quality & Linting

### Backend Code Quality

```bash
cd backend

# Checkstyle
mvn checkstyle:check

# SonarQube analysis
mvn sonar:sonar \
  -Dsonar.projectKey=smart-campus-hub \
  -Dsonar.host.url=https://sonarcloud.io \
  -Dsonar.login=your_sonar_token
```

### Frontend Code Quality

```bash
cd frontend

# ESLint
npm run lint

# Format code with Prettier
npm run format

# Check for issues
npm run lint -- --fix
```

---

## 📚 API Documentation

### Available Endpoints

**Authentication:**
- `POST /api/auth/login` - Google OAuth login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh JWT token

**Facilities:**
- `GET /api/facilities` - List all facilities
- `POST /api/facilities` - Create facility (ADMIN)
- `GET /api/facilities/{id}` - Get facility details
- `PUT /api/facilities/{id}` - Update facility (ADMIN)
- `DELETE /api/facilities/{id}` - Delete facility (ADMIN)

**Bookings:**
- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking (USER)
- `GET /api/bookings/{id}` - Get booking details
- `PUT /api/bookings/{id}/approve` - Approve booking (ADMIN)
- `PUT /api/bookings/{id}/reject` - Reject booking (ADMIN)
- `DELETE /api/bookings/{id}` - Cancel booking

**Maintenance Tickets (Module C):**
- `GET /api/tickets` - List tickets
- `POST /api/tickets` - Create ticket (USER)
- `GET /api/tickets/{id}` - Get ticket details
- `POST /api/tickets/{id}/attachments` - Upload attachments (max 3)
- `POST /api/tickets/{id}/comments` - Add comment
- `PUT /api/tickets/{id}/status` - Update status (TECHNICIAN/ADMIN)
- `PUT /api/tickets/{id}/technician` - Assign technician (ADMIN)

**Notifications:**
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/{id}/read` - Mark as read
- `DELETE /api/notifications/{id}` - Delete notification

---

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **Secrets Management**: Use GitHub Secrets for CI/CD
3. **HTTPS**: Use HTTPS in production
4. **CORS**: Update CORS settings for production domains
5. **JWT Token**: Set strong expiration times
6. **Input Validation**: Always validate on both frontend and backend
7. **File Uploads**: Validate file types, sizes, and quantities
8. **SQL Injection**: Use parameterized queries (JPA handles this)
9. **XSS Protection**: React escapes content by default
10. **CSRF Protection**: Enabled in Spring Security config

---

## 📝 Database Migrations

### Create New Migration (Flyway)

```bash
# In src/main/resources/db/migration/
# Create file: V1_0_1__your_migration_description.sql

ALTER TABLE users ADD COLUMN department VARCHAR(100);
```

### Run Migrations

```bash
cd backend
mvn flyway:migrate
```

---

## 🐛 Debugging

### Backend Debugging

**In IDE (IntelliJ IDEA):**
1. Set breakpoints in code
2. Run → Debug 'SmartCampusHubApplication'
3. Use the Debug Console to inspect variables

**Remote Debugging:**
```bash
# Start with debug port
mvn spring-boot:run -Dspring-boot.run.arguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"
```

### Frontend Debugging

- Use Chrome DevTools (F12)
- React Developer Tools extension
- Redux DevTools extension
- Console logging for debugging

---

## 🤝 Git Workflow

### Feature Branch Development

```bash
# Create feature branch
git checkout -b feature/module-c-maintenance

# Make changes and commit
git add .
git commit -m "feat: add maintenance ticket creation endpoint"

# Push to remote
git push origin feature/module-c-maintenance

# Create Pull Request on GitHub
```

### Commit Message Convention

```
feat: add new feature
fix: fix a bug
docs: documentation update
style: code style changes
refactor: code refactoring
test: add or update tests
chore: maintenance tasks
```

---

## 📋 Troubleshooting

### Backend Issues

| Issue | Solution |
|-------|----------|
| Port 8080 already in use | Change `server.port` in application.properties |
| Database connection failed | Verify PostgreSQL is running, check credentials |
| Maven build fails | Run `mvn clean install -U` to update dependencies |
| OAuth not working | Verify Google Client ID and Secret in `.env` |

### Frontend Issues

| Issue | Solution |
|-------|----------|
| Port 3000 already in use | Kill process: `lsof -ti:3000 \| xargs kill -9` |
| npm modules not working | Delete `node_modules` and run `npm install` again |
| API calls failing | Check if backend is running on port 8080 |
| CORS errors | Verify CORS settings in backend `SecurityConfig` |

---

## 📞 Support

For additional help:
- Check existing GitHub Issues
- Review API documentation
- Consult team members
- Check Spring Boot documentation

---

**Last Updated**: April 2026  
**Version**: 1.0.0
