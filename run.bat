@echo off
setlocal
title Brightloop Subscription Management System

set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"

echo ========================================================
echo   BRIGHTLOOP - SUBSCRIPTION MANAGEMENT SYSTEM
echo ========================================================
echo.
echo Freeing port 3000 if in use...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

echo.
echo Opening browser at http://localhost:3000/auth/login ...
start http://localhost:3000/auth/login
echo.
echo Starting Brightloop Dev Server on http://localhost:3000 ...
call npm.cmd run dev
pause
