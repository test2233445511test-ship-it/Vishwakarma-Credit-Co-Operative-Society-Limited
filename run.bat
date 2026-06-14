@echo off
title Vishwakarma Cooperative Society Bank
cd /d "%~dp0"
echo ==============================================
echo   Vishwakarma Cooperative Society Bank
echo   Starting Application...
echo ==============================================
echo.
echo [INFO] Launching run script...
powershell -ExecutionPolicy Bypass -File "%~dp0run.ps1"
if %errorlevel% neq 0 (
    echo [ERR] Script failed with error code %errorlevel%
    pause
)
