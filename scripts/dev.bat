@echo off
REM dev.bat - Brinkmanship Environment Launcher
REM Bypasses PowerShell Execution Policy for dev.ps1
powershell -ExecutionPolicy Bypass -File "%~dp0dev.ps1"
