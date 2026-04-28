# Smart Campus Hub - Full Project Runner (PowerShell)
# This script starts both backend and frontend servers

Write-Host "`n" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host "  Smart Campus Hub - Project Startup" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host "`n" -ForegroundColor Green

# Check if both directories exist
if (-not (Test-Path "backend")) {
    Write-Host "Error: backend directory not found" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path "frontend")) {
    Write-Host "Error: frontend directory not found" -ForegroundColor Red
    exit 1
}

# Start backend in a new PowerShell window
Write-Host "[1/2] Starting Backend Server (Spring Boot on port 8080)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; mvn spring-boot:run"
Start-Sleep -Seconds 3

# Start frontend in a new PowerShell window
Write-Host "[2/2] Starting Frontend Server (Vite React on port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "`n" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host "  Project Started Successfully!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host "`n" -ForegroundColor Green
Write-Host "Backend:  " -ForegroundColor Cyan -NoNewLine
Write-Host "http://localhost:8080" -ForegroundColor White
Write-Host "Frontend: " -ForegroundColor Cyan -NoNewLine
Write-Host "http://localhost:5173" -ForegroundColor White
Write-Host "API Base: " -ForegroundColor Cyan -NoNewLine
Write-Host "http://localhost:8080/api" -ForegroundColor White
Write-Host "`n" -ForegroundColor Green
