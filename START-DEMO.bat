@echo off
cd /d "%~dp0"
echo.
echo ========================================
echo   Credicus Business - Demo Server
echo ========================================
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\dev-clean.ps1"
pause
