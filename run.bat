@echo off
setlocal
title Brightloop Subscription Management System

set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"

echo ========================================================
echo   BRIGHTLOOP - SUBSCRIPTION MANAGEMENT SYSTEM
echo ========================================================
echo.
echo [1/3] Node.js Environment:
call node -v
echo.
echo [2/3] Opening browser at http://localhost:3000/auth/login ...
start http://localhost:3000/auth/login
echo.
echo [3/3] Starting Next.js Dev Server...
echo Press Ctrl+C at any time to stop.
echo.
call npm.cmd run dev
pause

