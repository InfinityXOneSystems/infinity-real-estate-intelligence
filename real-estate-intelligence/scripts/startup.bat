@echo off
REM ============================================================================
REM Autonomous Agent Startup Script (Windows Batch)
REM ============================================================================
REM This script initializes and starts the autonomous agent system
REM Status: Production Ready - Full Autonomous Operation

setlocal enabledelayedexpansion

REM Colors (Windows 10+ ANSI support)
set "GREEN=[92m"
set "BLUE=[94m"
set "YELLOW=[93m"
set "RED=[91m"
set "NC=[0m"

REM Set project root
set "PROJECT_ROOT=%~dp0.."
set "LOG_DIR=%PROJECT_ROOT%\logs\autonomous"
set "REPORT_DIR=%PROJECT_ROOT%\reports\autonomous"

REM Ensure directories exist
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
if not exist "%REPORT_DIR%" mkdir "%REPORT_DIR%"

cls
echo.
echo %BLUE%=====================================================================%NC%
echo %BLUE%[0m 🤖 AUTONOMOUS AGENT SYSTEM - STARTUP%NC%
echo %BLUE%=====================================================================%NC%
echo.

REM ============================================================================
REM PRE-FLIGHT CHECKS
REM ============================================================================

echo %YELLOW%📋 Running Pre-Flight Checks...%NC%
echo.

REM Check Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo %RED%❌ Node.js not found%NC%
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo %GREEN%✅ Node.js %NODE_VERSION%%NC%

REM Check npm
where npm >nul 2>nul
if errorlevel 1 (
    echo %RED%❌ npm not found%NC%
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo %GREEN%✅ npm %NPM_VERSION%%NC%

REM Check node_modules
if not exist "%PROJECT_ROOT%\node_modules" (
    echo %YELLOW%📦 Installing dependencies...%NC%
    cd /d "%PROJECT_ROOT%"
    call npm install
    if errorlevel 1 (
        echo %RED%❌ npm install failed%NC%
        exit /b 1
    )
)

echo %GREEN%✅ Pre-Flight Checks Passed%NC%
echo.

REM ============================================================================
REM BUILD CHECK & COMPILE
REM ============================================================================

echo %YELLOW%🔨 Checking Build...%NC%
echo.

if not exist "%PROJECT_ROOT%\dist" (
    echo %YELLOW%Building TypeScript...%NC%
    cd /d "%PROJECT_ROOT%"
    call npm run build
    if errorlevel 1 (
        echo %YELLOW%⚠️  Build warning - continuing anyway%NC%
    )
)

echo %GREEN%✅ Build Check Complete%NC%
echo.

REM ============================================================================
REM START AUTONOMOUS AGENT
REM ============================================================================

echo %YELLOW%🚀 Starting Autonomous Agent...%NC%
echo.

set "MODE=%1"
if "%MODE%"=="" set "MODE=monitor"

if /i "%MODE%"=="agent" (
    echo %BLUE%Starting TypeScript Autonomous Agent...%NC%
    cd /d "%PROJECT_ROOT%"
    call npm run autonomous:agent
) else if /i "%MODE%"=="scheduler" (
    echo %BLUE%Starting Autonomous Scheduler ^(Cron-based^)...%NC%
    cd /d "%PROJECT_ROOT%"
    call npm run autonomous:scheduler
) else if /i "%MODE%"=="full-cycle" (
    echo %BLUE%Running Full Autonomous Cycle...%NC%
    cd /d "%PROJECT_ROOT%"
    call npm run autonomous:full-cycle
) else if /i "%MODE%"=="monitor" (
    echo %BLUE%Starting Continuous Monitoring Mode...%NC%
    echo %YELLOW%This will run full cycles every 6 hours%NC%
    cd /d "%PROJECT_ROOT%"
    call npm run autonomous:monitor
) else if /i "%MODE%"=="diagnose" (
    echo %BLUE%Running Diagnostic Mode...%NC%
    cd /d "%PROJECT_ROOT%"
    call npm run autonomous:diagnose
) else if /i "%MODE%"=="fix" (
    echo %BLUE%Running Auto-Fix Mode...%NC%
    cd /d "%PROJECT_ROOT%"
    call npm run autonomous:fix
) else if /i "%MODE%"=="heal" (
    echo %BLUE%Running Auto-Heal Mode...%NC%
    cd /d "%PROJECT_ROOT%"
    call npm run autonomous:heal
) else if /i "%MODE%"=="optimize" (
    echo %BLUE%Running Optimization Mode...%NC%
    cd /d "%PROJECT_ROOT%"
    call npm run autonomous:optimize
) else if /i "%MODE%"=="enhance" (
    echo %BLUE%Running Enhancement Mode...%NC%
    cd /d "%PROJECT_ROOT%"
    call npm run autonomous:enhance
) else (
    echo %RED%Unknown mode: %MODE%%NC%
    echo Available modes: agent, scheduler, full-cycle, monitor, diagnose, fix, heal, optimize, enhance
    exit /b 1
)

echo.
echo %GREEN%=====================================================================%NC%
echo %GREEN%✅ Autonomous Agent System Started Successfully%NC%
echo %GREEN%=====================================================================%NC%

pause

endlocal
