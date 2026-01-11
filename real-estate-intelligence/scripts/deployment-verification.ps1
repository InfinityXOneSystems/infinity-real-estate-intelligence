# ========================================
# DEPLOYMENT VERIFICATION SCRIPT
# ========================================
# Validates all aspects of the system after deployment
# Run this to ensure everything is working correctly
# ========================================

param(
    [ValidateSet("quick", "full", "docker", "api")]
    [string]$Mode = "quick"
)

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$results = @()
$failureCount = 0

# Color codes
$colors = @{
    Success = 'Green'
    Warning = 'Yellow'
    Error = 'Red'
    Info = 'Cyan'
    Section = 'Magenta'
}

function Write-ColorLine {
    param([string]$Text, [string]$Color = 'White')
    Write-Host $Text -ForegroundColor $Color
}

function Add-Result {
    param(
        [string]$Check,
        [bool]$Status,
        [string]$Details = ""
    )
    $icon = if ($Status) { "✓" } else { "✗" }
    $color = if ($Status) { $colors.Success } else { $colors.Error }
    
    Write-ColorLine "$icon $Check" $color
    if ($Details) {
        Write-ColorLine "  └─ $Details" $colors.Info
    }
    
    if (-not $Status) {
        $script:failureCount++
    }
    
    $results += @{
        Check = $Check
        Status = $Status
        Details = $Details
    }
}

function Show-Header {
    param([string]$Title)
    Write-Host ""
    Write-ColorLine ("=" * 70) $colors.Section
    Write-ColorLine $Title $colors.Section
    Write-ColorLine ("=" * 70) $colors.Section
    Write-Host ""
}

# ========================================
# QUICK VERIFICATION (2-3 minutes)
# ========================================
function Verify-Quick {
    Show-Header "QUICK VERIFICATION"
    
    Write-Host "Environment Checks..."
    
    # Node.js
    $nodeCheck = Test-CommandExists "node"
    Add-Result "Node.js installed" $nodeCheck
    if ($nodeCheck) {
        $nodeVersion = node --version
        Add-Result "Node.js version" $true "Version: $nodeVersion"
    }
    
    # npm
    $npmCheck = Test-CommandExists "npm"
    Add-Result "npm installed" $npmCheck
    if ($npmCheck) {
        $npmVersion = npm --version
        Add-Result "npm version" $true "Version: $npmVersion"
    }
    
    # TypeScript
    Write-Host ""
    Write-Host "Build Checks..."
    $tsCheck = Test-Path "dist/"
    Add-Result "TypeScript compiled" $tsCheck "dist/ folder exists"
    
    # Dependencies
    $nodeModulesCheck = Test-Path "node_modules/"
    Add-Result "npm packages installed" $nodeModulesCheck "node_modules/ folder exists"
    
    # .env file
    Write-Host ""
    Write-Host "Configuration Checks..."
    $envCheck = Test-Path ".env"
    Add-Result ".env configuration file" $envCheck
    if ($envCheck) {
        $envContent = Get-Content ".env"
        $keyCount = ($envContent | Select-String "=" | Measure-Object).Count
        Add-Result "Environment variables" $true "$keyCount keys configured"
    }
    
    # Core directories
    Write-Host ""
    Write-Host "Directory Checks..."
    $srcCheck = Test-Path "src/"
    Add-Result "Source code directory (src/)" $srcCheck
    
    $logsCheck = Test-Path "logs/"
    Add-Result "Logs directory (logs/)" $logsCheck
    
    $reportsCheck = Test-Path "reports/"
    Add-Result "Reports directory (reports/)" $reportsCheck
}

# ========================================
# FULL VERIFICATION (10-15 minutes)
# ========================================
function Verify-Full {
    Show-Header "FULL SYSTEM VERIFICATION"
    
    # Quick checks first
    Verify-Quick
    
    Write-Host ""
    Write-Host "Application Checks..."
    
    # Dashboard port
    $dashboardCheck = Test-NetConnection -ComputerName localhost -Port 4000 -WarningAction SilentlyContinue
    Add-Result "Dashboard port 4000 available" $dashboardCheck.TcpTestSucceeded
    
    # API port
    $apiCheck = Test-NetConnection -ComputerName localhost -Port 3000 -WarningAction SilentlyContinue
    Add-Result "API port 3000 available" $apiCheck.TcpTestSucceeded
    
    # Package.json scripts
    Write-Host ""
    Write-Host "NPM Scripts Checks..."
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    
    $requiredScripts = @("build", "dev", "test", "autonomous:full-cycle", "dashboard:serve")
    foreach ($script in $requiredScripts) {
        $scriptExists = $packageJson.scripts.$script -ne $null
        Add-Result "npm run $script" $scriptExists
    }
    
    # Core files
    Write-Host ""
    Write-Host "Core Files Checks..."
    $orchestratorCheck = Test-Path "dist/orchestrator.js"
    Add-Result "Orchestrator compiled (dist/orchestrator.js)" $orchestratorCheck
    
    $dashboardCheck = Test-Path "dist/dashboard/server.js"
    Add-Result "Dashboard compiled (dist/dashboard/server.js)" $dashboardCheck
    
    # Agents
    Write-Host ""
    Write-Host "Agent Directories Checks..."
    $agentDirs = @("echo", "market-intelligence", "deal-closer", "shadow-agent", "financial-advisor")
    foreach ($agent in $agentDirs) {
        $agentPath = Join-Path "agents" $agent
        $exists = Test-Path $agentPath
        Add-Result "Agent: $agent" $exists
    }
    
    # Data directories
    Write-Host ""
    Write-Host "Data Storage Checks..."
    $dataCheck = Test-Path "data/"
    Add-Result "Data directory (data/)" $dataCheck
    
    $processedCheck = Test-Path "data/processed/"
    Add-Result "Processed data (data/processed/)" $processedCheck
    
    $rawCheck = Test-Path "data/raw/"
    Add-Result "Raw data (data/raw/)" $rawCheck
}

# ========================================
# DOCKER VERIFICATION (5 minutes)
# ========================================
function Verify-Docker {
    Show-Header "DOCKER VERIFICATION"
    
    Write-Host "Docker Installation..."
    
    # Docker installed
    $dockerCheck = Test-CommandExists "docker"
    Add-Result "Docker installed" $dockerCheck
    
    if ($dockerCheck) {
        $dockerVersion = docker --version
        Add-Result "Docker version" $true $dockerVersion
    }
    
    # Docker Compose
    Write-Host ""
    Write-Host "Docker Compose..."
    $composeCheck = Test-CommandExists "docker-compose"
    Add-Result "Docker Compose installed" $composeCheck
    
    if ($composeCheck) {
        $composeVersion = docker-compose --version
        Add-Result "Docker Compose version" $true $composeVersion
    }
    
    # docker-compose.yml
    Write-Host ""
    Write-Host "Docker Configuration..."
    $composeFileCheck = Test-Path "docker-compose.yml"
    Add-Result "docker-compose.yml exists" $composeFileCheck
    
    # Dockerfile
    $dockerfileCheck = Test-Path "Dockerfile"
    Add-Result "Dockerfile exists" $dockerfileCheck
    
    # Running containers
    Write-Host ""
    Write-Host "Running Containers..."
    try {
        $containers = docker ps --format "{{.Names}}" 2>$null
        if ($containers) {
            Add-Result "Docker containers running" $true "Count: $(($containers | Measure-Object).Count)"
            Write-Host ""
            foreach ($container in $containers) {
                Write-ColorLine "  - $container" $colors.Success
            }
        } else {
            Add-Result "Docker containers running" $false "No containers currently running"
        }
    } catch {
        Add-Result "Docker containers running" $false "Unable to connect to Docker daemon"
    }
}

# ========================================
# API VERIFICATION (5 minutes)
# ========================================
function Verify-API {
    Show-Header "API CREDENTIAL VERIFICATION"
    
    Write-Host "Reading .env configuration..."
    
    $envFile = Get-Content ".env" -ErrorAction SilentlyContinue
    if (-not $envFile) {
        Add-Result ".env file found" $false
        return
    }
    
    Add-Result ".env file found" $true
    
    # API key groups
    Write-Host ""
    Write-Host "Financial APIs..."
    
    $apiKeys = @{
        "Coinbase" = "COINBASE_API_KEY"
        "CoinGecko" = "COINGECKO_API_KEY"
        "Alpha Vantage" = "ALPHA_VANTAGE_API_KEY"
        "Finnhub" = "FINNHUB_API_KEY"
        "FRED" = "FRED_API_KEY"
        "Exchange Rate" = "EXCHANGE_RATE_API_KEY"
    }
    
    foreach ($api in $apiKeys.Keys) {
        $key = $apiKeys[$api]
        $exists = $envFile -match "$key="
        $configured = $envFile -match "$key=(?!$|your_|<)"
        Add-Result "$api ($key)" ($exists -and $configured)
    }
    
    # Voice APIs
    Write-Host ""
    Write-Host "Voice & Communication APIs..."
    
    $voiceAPIs = @{
        "ElevenLabs" = "ELEVENLABS_API_KEY"
        "Twilio SID" = "TWILIO_ACCOUNT_SID"
        "Twilio Token" = "TWILIO_AUTH_TOKEN"
    }
    
    foreach ($api in $voiceAPIs.Keys) {
        $key = $voiceAPIs[$api]
        $exists = $envFile -match "$key="
        $configured = $envFile -match "$key=(?!$|your_|<)"
        $status = if ($exists) { "Configured" } else { "Missing" }
        Add-Result "$api" $configured "Status: $status"
    }
    
    # Google Cloud APIs
    Write-Host ""
    Write-Host "Google Cloud APIs..."
    
    $googleAPIs = @{
        "Google Cloud Project" = "GOOGLE_CLOUD_PROJECT"
        "Google Cloud Key" = "GOOGLE_CLOUD_KEY"
        "Vertex AI" = "VERTEX_AI_API_KEY"
    }
    
    foreach ($api in $googleAPIs.Keys) {
        $key = $googleAPIs[$api]
        $exists = $envFile -match "$key="
        $configured = $envFile -match "$key=(?!$|your_|<)"
        $status = if ($exists) { "Configured" } else { "Missing" }
        Add-Result "$api" $configured "Status: $status"
    }
    
    # Web3 APIs
    Write-Host ""
    Write-Host "Blockchain APIs..."
    
    $web3APIs = @{
        "Infura" = "INFURA_RPC_URL"
        "Etherscan" = "ETHERSCAN_API_KEY"
    }
    
    foreach ($api in $web3APIs.Keys) {
        $key = $web3APIs[$api]
        $exists = $envFile -match "$key="
        $configured = $envFile -match "$key=(?!$|your_|<)"
        $status = if ($exists) { "Configured" } else { "Missing" }
        Add-Result "$api" $configured "Status: $status"
    }
}

# ========================================
# HELPER FUNCTIONS
# ========================================
function Test-CommandExists {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# ========================================
# SUMMARY REPORT
# ========================================
function Show-Summary {
    Show-Header "VERIFICATION SUMMARY"
    
    $totalChecks = $results.Count
    $passedChecks = ($results | Where-Object { $_.Status -eq $true } | Measure-Object).Count
    $failedChecks = $script:failureCount
    $passPercentage = [math]::Round(($passedChecks / $totalChecks) * 100, 1)
    
    Write-Host "Total Checks: $totalChecks"
    Write-ColorLine "✓ Passed: $passedChecks" $colors.Success
    if ($failedChecks -gt 0) {
        Write-ColorLine "✗ Failed: $failedChecks" $colors.Error
    }
    Write-Host "Pass Rate: $passPercentage%"
    Write-Host ""
    
    if ($failedChecks -eq 0) {
        Write-ColorLine "🎉 ALL CHECKS PASSED - SYSTEM READY!" $colors.Success
    } else {
        Write-ColorLine "⚠️  SOME CHECKS FAILED - SEE ABOVE FOR DETAILS" $colors.Warning
    }
    
    Write-Host ""
    Write-Host "Timestamp: $timestamp"
}

# ========================================
# MAIN EXECUTION
# ========================================
Clear-Host
Write-ColorLine "Real Estate Intelligence - Deployment Verification" $colors.Section
Write-ColorLine "Mode: $Mode" $colors.Info
Write-Host ""

switch ($Mode) {
    "quick" { Verify-Quick }
    "full" { Verify-Full }
    "docker" { Verify-Docker }
    "api" { Verify-API }
    default { Verify-Full }
}

Show-Summary

# Save report
$reportPath = "reports/deployment-verification-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
$results | ConvertTo-Csv -NoTypeInformation | Out-File $reportPath
Write-Host ""
Write-ColorLine "Report saved: $reportPath" $colors.Info
