@echo off
title Heron Backend API - Port 5000
color 0A
echo.
echo  =====================================================
echo   HERON ASSETS - Backend API Server
echo   Running on http://localhost:5000
echo   Press CTRL+C to stop
echo  =====================================================
echo.
cd /d "%~dp0backend"
node dist/server.js
pause
