# 🏫 Smart Campus Hub

A full-stack campus management platform built with **Spring Boot** and **React** that brings students, faculty, and administrators together in one unified digital experience.

---

## ✨ Features

- 📅 **Student Portal** — View schedules, track attendance, and access grades in real time
- 🏛️ **Facility & Resource Management** — Book rooms, labs, and equipment with ease
- 📢 **Campus Events & Announcements** — Stay updated with news, events, and notices
- 🔐 **Authentication** — Secure login via JWT and Google OAuth2

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Spring Boot | REST API framework |
| Spring Security | Authentication & authorization |
| JWT | Stateless session tokens |
| Google OAuth2 | Social login |
| Spring Data MongoDB | Database ORM |
| MongoDB | NoSQL database |

### Frontend
| Technology | Purpose |
|---|---|
| React | UI framework |
| Axios | HTTP client |
| React Router | Client-side routing |
| Context API / Redux | State management |

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- MongoDB (local or Atlas)
- Maven

---

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/smart-campus-hub.git
   cd smart-campus-hub/backend
   ```

2. **Configure environment variables**

   Create `src/main/resources/application.properties` or `application.yml`:
   ```properties
   # Database
   spring.data.mongodb.uri=mongodb://localhost:27017/smart_campus_hub

   # JWT
   app.jwt.secret=your_jwt_secret_key
   app.jwt.expiration=86400000

   # Google OAuth2
   spring.security.oauth2.client.registration.google.client-id=your_google_client_id
   spring.security.oauth2.client.registration.google.client-secret=your_google_client_secret
   ```

3. **Run the backend**
   ```bash
   mvn spring-boot:run
   ```

   The API will be available at `http://localhost:8080`

---

### Frontend Setup

1. **Navigate to the frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file:
   ```env
   REACT_APP_API_BASE_URL=http://localhost:8080/api
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

   The app will be available at `http://localhost:3000`

---

## 🔑 Authentication Flow

```
User → Login (Email/Password or Google)
     → Backend validates credentials
     → JWT token issued
     → Token stored client-side
     → Token sent in Authorization header on each request
```

> Google login uses OAuth2. Make sure your Google Cloud Console has `http://localhost:3000` added as an authorized redirect URI.

---

## 📁 Project Structure

```
smart-campus-hub/
├── backend/
│   └── src/
│       └── main/
│           ├── java/com/smartcampus/
│           │   ├── auth/          # JWT & OAuth2 logic
│           │   ├── student/       # Student portal APIs
│           │   ├── facility/      # Facility management APIs
│           │   └── events/        # Events & announcements APIs
│           └── resources/
│               └── application.properties
│
└── frontend/
    └── src/
        ├── components/            # Reusable UI components
        ├── pages/                 # Route-level pages
        ├── services/              # Axios API calls
        └── context/               # Auth & global state
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email & password |
| POST | `/api/auth/register` | Register new user |
| GET | `/oauth2/authorize/google` | Initiate Google login |
| GET | `/api/students/schedule` | Get student schedule |
| GET | `/api/students/attendance` | Get attendance records |
| GET | `/api/facilities` | List available facilities |
| POST | `/api/facilities/book` | Book a facility |
| GET | `/api/events` | Get campus events |
| POST | `/api/events` | Create a new event (admin) |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

> Built with ❤️ for smarter campuses.
