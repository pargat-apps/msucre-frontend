@echo off
title M. Sucre Frontend Server
color 0B

echo ========================================
echo M. Sucre Frontend Server Starter
echo ========================================
echo.

REM Check if port 3000 is in use
echo Checking port 3000...
netstat -ano | findstr :3000 | findstr LISTENING >nul

if %ERRORLEVEL% EQU 0 (
    echo ⚠️  Port 3000 is already in use!
    echo Killing process on port 3000...
    
    REM Get PID and kill it
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
        echo Stopping process %%a...
        taskkill /F /PID %%a >nul 2>&1
    )
    
    echo ✅ Port 3000 is now free!
    timeout /t 2 /nobreak >nul
    echo.
) else (
    echo ✅ Port 3000 is available!
    echo.
)

REM Start the server
echo ========================================
echo Starting Frontend Server on Port 3000...
echo ========================================
echo.
echo Frontend will be available at: http://localhost:3000
echo.
echo The browser will open automatically.
echo Press Ctrl+C to stop the server
echo.

REM Wait a moment then open browser
start /min cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000"

npm run dev

