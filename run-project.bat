@echo off
REM Smart Campus Hub - Full Project Runner
REM This script starts both backend and frontend servers

echo.
echo ======================================
echo   Smart Campus Hub - Project Startup
echo ======================================
echo.

REM Check if both directories exist
if not exist "backend" (
    echo Error: backend directory not found
    exit /b 1
)
if not exist "frontend" (
    echo Error: frontend directory not found
    exit /b 1
)

REM Start backend in a new window
echo [1/2] Starting Backend Server (Spring Boot)...
start cmd /k "cd backend && mvn spring-boot:run"
timeout /t 3 /nobreak

REM Start frontend in a new window
echo [2/2] Starting Frontend Server (Vite - React)...
start cmd /k "cd frontend && npm run dev"

echo.
echo ======================================
echo   Project Started Successfully!
echo ======================================
echo.
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:5173
echo.
echo API Base: http://localhost:8080/api
echo.
