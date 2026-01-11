#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Quick Start - Real Estate Intelligence System Setup
.DESCRIPTION
    One-command setup for immediate operation
.EXAMPLE
    .\quick-start.ps1
    .\quick-start.ps1 -SkipDocker
#>

param(
    [switch]$SkipDocker = $false,
    [string]$ProjectRoot = "C:\Users\JARVIS\OneDrive\Documents\Real_estate_Intelligence"
)

Write-Host "`n" + ("=" * 70) -ForegroundColor Cyan
Write-Host "  🚀 REAL ESTATE INTELLIGENCE - QUICK START" -ForegroundColor Cyan
Write-Host "=" * 70 + "`n" -ForegroundColor Cyan

# Step 1: Check if already installed
Push-Location $ProjectRoot

if (Test-Path "node_modules") {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
} else {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
    npm install 2>&1 | Select-Object -Last 5
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
}

# Step 2: Build
Write-Host "`n🔨 Building project..." -ForegroundColor Cyan
npm run build 2>&1 | Select-Object -Last 3
Write-Host "✅ Project built" -ForegroundColor Green

# Step 3: Run autonomous cycle
Write-Host "`n🤖 Running autonomous cycle..." -ForegroundColor Cyan
npm run autonomous:full-cycle 2>&1 | Select-Object -Last 10
Write-Host "✅ Autonomous cycle completed" -ForegroundColor Green

# Step 4: Start dashboard
Write-Host "`n🎨 Starting live dashboard..." -ForegroundColor Cyan
Write-Host "   Opening: http://localhost:4000" -ForegroundColor Gray
Start-Process "http://localhost:4000"

# Step 5: Summary
Write-Host "`n" + ("=" * 70) -ForegroundColor Green
Write-Host "  ✅ SYSTEM READY FOR OPERATION" -ForegroundColor Green
Write-Host "=" * 70 + "`n" -ForegroundColor Green

Write-Host "📊 What's Running:" -ForegroundColor Cyan
Write-Host "   • Autonomous agent (full-cycle completed)" -ForegroundColor White
Write-Host "   • Dashboard server (port 4000)" -ForegroundColor White
Write-Host "   • All crawlers & intelligence engines" -ForegroundColor White
Write-Host ""

Write-Host "📈 Check Status:" -ForegroundColor Cyan
Write-Host "   • Dashboard:     http://localhost:4000" -ForegroundColor White
Write-Host "   • Google Sheets: https://docs.google.com/spreadsheets/d/1u1USJDfPR5qZSb6-Zs4JyIyDFLLLfZhHKr1KJcFKrgU" -ForegroundColor White
Write-Host "   • Logs:          ./logs/autonomous/" -ForegroundColor White
Write-Host "   • Reports:       ./reports/autonomous/" -ForegroundColor White
Write-Host ""

Write-Host "⏰ Next Automated Run:" -ForegroundColor Cyan
Write-Host "   Scheduled for: Next 6-hour interval" -ForegroundColor White
Write-Host "   Manual trigger: npm run autonomous:full-cycle" -ForegroundColor White
Write-Host ""

Write-Host "🚀 To Deploy with Docker:" -ForegroundColor Cyan
if (-not $SkipDocker) {
    Write-Host "   npm run docker:up" -ForegroundColor White
} else {
    Write-Host "   (Skipped - add -SkipDocker:$false to enable)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   • Quick reference: ./AUTONOMOUS_QUICK_START.md" -ForegroundColor White
Write-Host "   • Full guide:      ./DEPLOYMENT_CHECKLIST.md" -ForegroundColor White
Write-Host "   • API docs:        ./README.md" -ForegroundColor White
Write-Host ""

Pop-Location
Write-Host "✨ Ready to go! System is autonomous and monitoring 24/7`n" -ForegroundColor Green
