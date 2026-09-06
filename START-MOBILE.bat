@echo off
title Heron Mobile App - Expo Metro Bundler (Port 8081)
color 0E
echo.
echo  =====================================================
echo   HERON ASSETS - Cross-Platform Mobile Application
echo   Expo Metro Server running on Port 8081
echo.
echo   Press:
echo     [a] Open Android Emulator
echo     [i] Open iOS Simulator (macOS only)
echo     [w] Open in Web Browser Simulator
echo     [r] Reload app
echo.
echo   Scan the QR Code with Expo Go on your mobile phone!
echo   Press CTRL+C to stop
echo  =====================================================
echo.
cd /d "%~dp0mobile"
npx expo start -c
pause
