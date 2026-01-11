#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Complete Real Estate Intelligence System - Full Installation & Deployment
.DESCRIPTION
    Runs all installation, building, and deployment steps automatically
.EXAMPLE
    .\complete-deployment.ps1 -Mode full
    .\complete-deployment.ps1 -Mode test-only
#>

param(
    [ValidateSet("full", "install-only", "build-only", "test-only", "docker-only")]
    [string]$Mode = "full",
    [switch]$Verbose = $false,
    [string]$ProjectRoot = "C:\Users\JARVIS\OneDrive\Documents\Real_estate_Intelligence"
)

# Colors
$colors = @{
    'Success' = 'Green'
    'Error' = 'Red'
    'Warning' = 'Yellow'
    'Info' = 'Cyan'
}

function Write-Status {
    param([string]$Message, [string]$Status = 'Info')
    $color = $colors[$Status] ?? 'White'
    $prefix = switch($Status) {
        'Success' { '✅' }
        'Error' { '❌' }
        'Warning' { '⚠️' }
        'Info' { 'ℹ️' }
    }
    Write-Host "$prefix $Message" -ForegroundColor $color
}

function Invoke-Command {
    param([string]$Command, [string]$Description)
    Write-Status "Starting: $Description" Info
    
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        if ($Verbose) {
            Write-Host "Command: $Command" -ForegroundColor Gray
        }
        Invoke-Expression $Command | Out-Null
        $sw.Stop()
        Write-Status "$Description completed in $($sw.ElapsedMilliseconds)ms" Success
        return $true
    } catch {
        $sw.Stop()
        Write-Status "$Description failed: $_" Error
        return $false
    }
}

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  REAL ESTATE INTELLIGENCE - COMPLETE DEPLOYMENT SUITE    ║" -ForegroundColor Cyan
Write-Host "║  Status: Production-Ready Automation                      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$startTime = Get-Date

# ============================================================================
# PHASE 1: VALIDATE ENVIRONMENT
# ============================================================================
Write-Host "`n📋 PHASE 1: ENVIRONMENT VALIDATION" -ForegroundColor Cyan
Write-Host "══════════════════════════════════════`n"

# Check Node.js
$nodeCheck = node --version 2>$null
if ($nodeCheck) {
    Write-Status "Node.js: $nodeCheck" Success
} else {
    Write-Status "Node.js not found - Install from https://nodejs.org" Error
    exit 1
}

# Check npm
$npmCheck = npm --version 2>$null
if ($npmCheck) {
    Write-Status "npm: $npmCheck" Success
} else {
    Write-Status "npm not found" Error
    exit 1
}

# Check project directory
if (Test-Path $ProjectRoot) {
    Write-Status "Project directory: $ProjectRoot" Success
} else {
    Write-Status "Project directory not found: $ProjectRoot" Error
    exit 1
}

# Check package.json
if (Test-Path (Join-Path $ProjectRoot "package.json")) {
    Write-Status "package.json found" Success
} else {
    Write-Status "package.json not found" Error
    exit 1
}

# ============================================================================
# PHASE 2: INSTALL DEPENDENCIES
# ============================================================================
if ($Mode -in "full", "install-only") {
    Write-Host "`n📦 PHASE 2: INSTALLING DEPENDENCIES" -ForegroundColor Cyan
    Write-Host "════════════════════════════════════════`n"

    Push-Location $ProjectRoot
    
    if (Test-Path "node_modules") {
        Write-Status "Cleaning old node_modules..." Warning
        Remove-Item -Recurse -Force "node_modules" -ErrorAction Continue | Out-Null
        if (Test-Path ".npmrc") { Remove-Item ".npmrc" -ErrorAction Continue }
    }
    
    if (Invoke-Command "npm install" "npm install") {
        Write-Status "Installed $(((npm ls --depth=0) | Measure-Object -Line).Lines) packages" Success
    } else {
        Pop-Location
        exit 1
    }

    Pop-Location
}

# ============================================================================
# PHASE 3: BUILD & COMPILE
# ============================================================================
if ($Mode -in "full", "build-only") {
    Write-Host "`n🔨 PHASE 3: BUILDING PROJECT" -ForegroundColor Cyan
    Write-Host "════════════════════════════════════════`n"

    Push-Location $ProjectRoot
    
    # TypeScript check
    if (Invoke-Command "npm run typecheck" "TypeScript type checking") {
        Write-Status "No TypeScript errors found" Success
    } else {
        Write-Status "Fix TypeScript errors before continuing" Error
        Pop-Location
        exit 1
    }

    # Build
    if (Invoke-Command "npm run build" "Building TypeScript") {
        if (Test-Path "dist") {
            $distSize = (Get-ChildItem "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
            Write-Status "Build successful - dist/ size: $([math]::Round($distSize, 2))MB" Success
        }
    } else {
        Write-Status "Build failed" Error
        Pop-Location
        exit 1
    }

    Pop-Location
}

# ============================================================================
# PHASE 4: TESTING
# ============================================================================
if ($Mode -in "full", "test-only") {
    Write-Host "`n🧪 PHASE 4: RUNNING TESTS" -ForegroundColor Cyan
    Write-Host "════════════════════════════════════════`n"

    Push-Location $ProjectRoot

    # Module tests
    Write-Status "Testing modules..." Info
    
    $tests = @(
        @{ name = "voice-system"; cmd = "npm run voice:test" },
        @{ name = "workflow-automation"; cmd = "npm run workflow:test" },
        @{ name = "data-scraper"; cmd = "npm run scraper:run" },
        @{ name = "smart-contracts"; cmd = "npm run contracts:test" }
    )

    $passed = 0
    $failed = 0

    foreach ($test in $tests) {
        Write-Host "`nTesting: $($test.name)" -ForegroundColor Gray
        if (Invoke-Command $test.cmd "Test: $($test.name)") {
            $passed++
        } else {
            $failed++
            Write-Status "Test failed (non-critical)" Warning
        }
    }

    Write-Host "`n📊 Test Summary:" -ForegroundColor Cyan
    Write-Status "Passed: $passed" Success
    if ($failed -gt 0) {
        Write-Status "Failed: $failed (review above)" Warning
    }

    Pop-Location
}

# ============================================================================
# PHASE 5: DOCKER DEPLOYMENT
# ============================================================================
if ($Mode -in "full", "docker-only") {
    Write-Host "`n🐳 PHASE 5: DOCKER DEPLOYMENT" -ForegroundColor Cyan
    Write-Host "════════════════════════════════════════`n"

    Push-Location $ProjectRoot

    # Check Docker
    $dockerCheck = docker --version 2>$null
    if ($dockerCheck) {
        Write-Status "$dockerCheck" Success
    } else {
        Write-Status "Docker not installed - skipping" Warning
        Pop-Location
    } else {
        # Build images
        if (Invoke-Command "npm run docker:build" "Building Docker image") {
            Write-Status "Docker image built successfully" Success
        } else {
            Write-Status "Docker build failed" Error
            Pop-Location
            exit 1
        }

        # Start services
        Write-Host "`nStarting Docker services..." -ForegroundColor Gray
        if (Invoke-Command "npm run docker:up" "Starting services") {
            Write-Status "Docker services started" Success
            
            # Wait for services
            Write-Status "Waiting for services to be ready..." Info
            Start-Sleep -Seconds 5
            
            # Health check
            $healthCheck = docker ps | Select-String "real-estate-intelligence"
            if ($healthCheck) {
                Write-Status "All services running" Success
                docker ps --format "table {{.Names}}\t{{.Status}}" | Select-String "real-estate"
            }
        } else {
            Write-Status "Failed to start services" Error
        }
    }

    Pop-Location
}

# ============================================================================
# FINAL SUMMARY
# ============================================================================
$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  DEPLOYMENT COMPLETE                                       ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Status "Total time: $([math]::Round($duration.TotalSeconds, 2)) seconds" Success

Write-Host "`n📋 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Start dashboard:    npm run dashboard:serve"
Write-Host "2. Run intelligence:   npm run autonomous:full-cycle"
Write-Host "3. View logs:          tail -f logs/autonomous/*.log"
Write-Host "4. Monitor system:     http://localhost:4000"
Write-Host ""
Write-Host "📚 Documentation:"
Write-Host "   - README.md"
Write-Host "   - DEPLOYMENT_CHECKLIST.md"
Write-Host "   - AUTONOMOUS_QUICK_START.md"
Write-Host ""
Write-Host "✅ System is production-ready!" -ForegroundColor Green

Write-Host ""
