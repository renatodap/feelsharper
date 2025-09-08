@echo off
REM FeelSharper Development Startup Script for Windows
REM Starts both Next.js frontend and Python backend

echo Starting FeelSharper Development Environment...
echo.

REM Start Python backend in new window
echo Starting Python backend on port 8000...
start "Python Backend" cmd /k "cd python-backend && python main.py"

REM Wait a moment for backend to start
timeout /t 2 /nobreak >nul

REM Start Next.js frontend in new window  
echo Starting Next.js frontend on port 3000...
start "Next.js Frontend" cmd /k "npm run dev"

echo.
echo Development environment started!
echo    - Frontend: http://localhost:3000
echo    - Backend API: http://localhost:8000
echo    - Backend Health: http://localhost:8000/health
echo.
echo Close the command windows to stop the servers.
echo.