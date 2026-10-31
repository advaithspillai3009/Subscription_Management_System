@echo off
setlocal
title Brightloop Subscription Management System

set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"

echo ========================================================
echo   BRIGHTLOOP - SUBSCRIPTION MANAGEMENT SYSTEM
echo ========================================================
echo.
echo Opening browser at http://localhost:3000/auth/login ...
start http://localhost:3000/auth/login
echo.
echo Starting Brightloop Dev Server on http://localhost:3000 ...
call npm.cmd run dev
pause
