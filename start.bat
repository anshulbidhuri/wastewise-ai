@echo off
echo.
echo ============================================================
echo  WasteWise AI - Setup Script
echo ============================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    echo Then run this script again.
    pause
    exit /b 1
)

echo [OK] Node.js found.
echo.
echo Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
)

echo.
echo [OK] Dependencies installed.
echo.
echo ============================================================
echo  Starting WasteWise AI Server...
echo  Open your browser at: http://localhost:3000
echo ============================================================
echo.

node server.js

pause
