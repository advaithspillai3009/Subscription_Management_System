@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"
echo Starting Brightloop Dev Server on http://localhost:3000 ...
call npm.cmd run dev
pause
