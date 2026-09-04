@echo off
title Heron Dashboard - Port 5173
color 09
echo.
echo  =====================================================
echo   HERON ASSETS - React Dashboard (Dev Server)
echo   Running on http://localhost:5173
echo   Press CTRL+C to stop
echo  =====================================================
echo.
cd /d "%~dp0dashboard"
npm run dev
pause
