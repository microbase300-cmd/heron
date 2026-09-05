@echo off
title Heron Main Website - Port 3000
color 0A
echo.
echo  =====================================================
echo   HERON ASSETS - React Main Website (Dev Server)
echo   Running on http://localhost:3000
echo   Press CTRL+C to stop
echo  =====================================================
echo.
cd /d "%~dp0web"
npm run dev
pause
