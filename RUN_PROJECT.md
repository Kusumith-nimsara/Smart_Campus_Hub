# Smart Campus Hub - Project Startup Guide

## ✅ Project Status: READY TO RUN

All errors have been fixed:
- ✅ Git merge conflict resolved (BookingService.java)
- ✅ Duplicate method definitions removed (NotificationService.java)
- ✅ Backend compilation successful
- ✅ Frontend build successful
- ✅ All dependencies installed

---

## 🚀 Quick Start

### Option 1: Run Both Services (Recommended)

#### Windows Command Prompt:
```batch
cd d:\Smart_Campus_Hub
run-project.bat
```

#### Windows PowerShell:
```powershell
cd d:\Smart_Campus_Hub
.\run-project.ps1
```

This will:
1. Start Spring Boot backend on `http://localhost:8080`
2. Start Vite frontend development server on `http://localhost:5173`

### Option 2: Run Separately

#### Backend (Spring Boot):
```bash
cd backend
mvn spring-boot:run
```
- Starts on: `http://localhost:8080`
- API Base URL: `http://localhost:8080/api`

#### Frontend (React + Vite):
```bash
cd frontend
npm run dev
```
- Starts on: `http://localhost:5173`
- Auto-opens browser

---

## 🔌 Service Endpoints

| Service | URL | Purpose |
|---------|-----|---------|
| Backend API | `http://localhost:8080` | REST API Server |
| Frontend | `http://localhost:5173` | React Application |
| API Endpoints | `http://localhost:8080/api/*` | All API calls |

---

## ⚙️ Configuration

### Backend (.env in root):
```properties
SERVER_PORT=8080
MONGO_URI=mongodb+srv://...
JWT_SECRET=SmartCampusSuperSecretKey2026VihangaPAFProject
VITE_API_BASE_URL=http://localhost:8080/api
```

### Frontend (.env in frontend/):
```javascript
VITE_API_BASE_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=194337731331-kv55hq4n86bln9honk84e7ida235o02f.apps.googleusercontent.com
```

---

## 📦 Project Structure

```
Smart_Campus_Hub/
├── backend/          (Spring Boot 3.1.5, Java 17)
│   ├── pom.xml
│   └── src/
├── frontend/         (React 19, Vite)
│   ├── package.json
│   ├── vite.config.js
│   └── src/
├── .env              (Environment variables)
└── RUN_PROJECT.md    (This file)
```

---

## 🛠️ Development Workflow

### Build Only:
```bash
# Backend
cd backend
mvn clean compile

# Frontend  
cd frontend
npm run build
```

### Run Tests:
```bash
# Backend
cd backend
mvn test

# Frontend
cd frontend
npm test
```

### Lint Code:
```bash
# Frontend
cd frontend
npm run lint
```

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Verify Maven is installed
mvn -v

# Clear Maven cache
mvn clean

# Check MongoDB connection
# Verify MONGO_URI in .env
```

### Frontend Won't Start
```bash
# Reinstall dependencies
npm install

# Clear node_modules
rm -r node_modules package-lock.json
npm install

# Check port 5173 is free
netstat -ano | findstr :5173
```

### API Connection Issues
1. Ensure backend is running on port 8080
2. Verify `VITE_API_BASE_URL=http://localhost:8080/api` in frontend/.env
3. Check MongoDB connection string in root .env

---

## 📋 Fixed Issues

### Issue 1: Git Merge Conflict
- **File**: `backend/src/main/java/com/smartcampus/hub/service/BookingService.java`
- **Problem**: Unmerged conflict in BookingService
- **Solution**: Resolved by accepting HEAD version with ResourceStatus import

### Issue 2: Duplicate Methods
- **File**: `backend/src/main/java/com/smartcampus/hub/service/NotificationService.java`
- **Problem**: Four booking notification methods defined twice
- **Solution**: Removed simple versions, kept detailed implementations with admin notifications

---

## 📝 Technology Stack

**Backend:**
- Spring Boot 3.1.5
- Java 17
- Maven
- MongoDB
- JWT Authentication
- Google OAuth2

**Frontend:**
- React 19
- Vite 8
- React Router v7
- SweetAlert2
- CSS3

---

## ✨ Features

- 📚 Resource Management & Booking System
- 🎫 Maintenance & Incident Ticketing
- 👥 User Management with Role-Based Access
- 🔔 Real-time Notifications
- 📱 Responsive Design
- 🔐 Secure Authentication (Google OAuth + JWT)

---

## 📞 Support

If issues persist:
1. Check terminal error messages carefully
2. Verify all environment variables are set
3. Ensure MongoDB is accessible
4. Confirm ports 8080 and 5173 are available

