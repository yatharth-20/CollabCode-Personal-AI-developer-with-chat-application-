@echo off
TITLE CollabCode Starter
COLOR 0B

echo ==========================================
echo    CollabCode: Personal AI Developer
echo ==========================================
echo.
echo Starting Backend and Frontend servers...
echo.

:: Start Backend
cd backend
start "CollabCode - Backend" cmd /k "echo Initializing Backend... && npm run dev"

:: Start Frontend
cd ..
cd frontend
start "CollabCode - Frontend" cmd /k "echo Initializing Frontend... && npm run dev"

echo.
echo ==========================================
echo    Project is launching in separate windows.
echo    Backend: http://localhost:3500
echo    Frontend: http://localhost:5174
echo ==========================================
pause
