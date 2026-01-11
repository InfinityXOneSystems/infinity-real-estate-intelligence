# ========================================
# CONTINUOUS HEALTH MONITORING SCRIPT
# ========================================
# Monitors system health and automatically reports issues
# Run this in background for 24/7 monitoring
# ========================================

param(
    [int]$IntervalSeconds = 300,  # Check every 5 minutes
    [switch]$Continuous = $true,  # Run continuously
    [int]$MaxLogFiles = 30        # Keep last 30 days of logs
)

$monitoringStartTime = Get-Date
$checksPerformed = 0
$alertsRaised = 0

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
    Write-Host "$(Get-Date -Format 'HH:mm:ss') - $Text" -ForegroundColor $Color
}

function Log-Event {
    param(
        [string]$Level,
        [string]$Message,
        [string]$Component = "System"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] [$Component] $Message"
    
    # Console output
    $color = switch ($Level) {
        "ERROR" { $colors.Error }
        "WARNING" { $colors.Warning }
        "SUCCESS" { $colors.Success }
        default { $colors.Info }
    }
    Write-ColorLine "$Component - $Message" $color
    
    # File logging
    $logDir = "logs/monitoring"
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    
    $logFile = Join-Path $logDir "health-monitor-$(Get-Date -Format 'yyyy-MM-dd').log"
    Add-Content -Path $logFile -Value $logMessage
}

# ========================================
# PROCESS MONITORING
# ========================================
function Check-Process {
    param([string]$ProcessName)
    
    $process = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
    if ($process) {
        Log-Event "SUCCESS" "$ProcessName is running (PID: $($process.Id), CPU: $($process.CPU)ms)" "Process"
        return $true
    } else {
        Log-Event "WARNING" "$ProcessName is not running" "Process"
        return $false
    }
}

function Monitor-Processes {
    Write-Host ""
    Write-ColorLine "=== PROCESS MONITORING ===" $colors.Section
    
    $processes = @("node", "docker", "npm")
    $results = @()
    
    foreach ($proc in $processes) {
        $running = Check-Process $proc
        $results += @{ Process = $proc; Running = $running }
    }
    
    return $results
}

# ========================================
# PORT MONITORING
# ========================================
function Check-Port {
    param([int]$Port)
    
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue
        if ($connection.TcpTestSucceeded) {
            Log-Event "SUCCESS" "Port $Port is responding" "Port"
            return $true
        } else {
            Log-Event "ERROR" "Port $Port is not responding" "Port"
            return $false
        }
    } catch {
        Log-Event "ERROR" "Unable to check port $Port - $_" "Port"
        return $false
    }
}

function Monitor-Ports {
    Write-Host ""
    Write-ColorLine "=== PORT MONITORING ===" $colors.Section
    
    $ports = @(
        @{ Port = 3000; Service = "API Server" }
        @{ Port = 4000; Service = "Dashboard" }
        @{ Port = 5432; Service = "PostgreSQL" }
        @{ Port = 6379; Service = "Redis" }
    )
    
    $results = @()
    
    foreach ($portInfo in $ports) {
        $responding = Check-Port $portInfo.Port
        $results += @{
            Port = $portInfo.Port
            Service = $portInfo.Service
            Responding = $responding
        }
    }
    
    return $results
}

# ========================================
# DISK SPACE MONITORING
# ========================================
function Monitor-DiskSpace {
    Write-Host ""
    Write-ColorLine "=== DISK SPACE MONITORING ===" $colors.Section
    
    $drive = Get-PSDrive -Name C
    $totalGB = [math]::Round($drive.Used / 1GB + $drive.Free / 1GB, 2)
    $usedGB = [math]::Round($drive.Used / 1GB, 2)
    $freeGB = [math]::Round($drive.Free / 1GB, 2)
    $usagePercent = [math]::Round(($drive.Used / ($drive.Used + $drive.Free)) * 100, 1)
    
    Write-ColorLine "Drive C: - $usagePercent% used" $colors.Info
    Write-ColorLine "  Total: $totalGB GB" $colors.Info
    Write-ColorLine "  Used: $usedGB GB" $colors.Info
    Write-ColorLine "  Free: $freeGB GB" $colors.Info
    
    if ($usagePercent -gt 90) {
        Log-Event "ERROR" "Disk usage critically high: $usagePercent%" "Disk"
        $script:alertsRaised++
    } elseif ($usagePercent -gt 80) {
        Log-Event "WARNING" "Disk usage warning: $usagePercent%" "Disk"
    } else {
        Log-Event "SUCCESS" "Disk usage normal: $usagePercent%" "Disk"
    }
    
    return @{
        TotalGB = $totalGB
        UsedGB = $usedGB
        FreeGB = $freeGB
        UsagePercent = $usagePercent
    }
}

# ========================================
# MEMORY MONITORING
# ========================================
function Monitor-Memory {
    Write-Host ""
    Write-ColorLine "=== MEMORY MONITORING ===" $colors.Section
    
    $memory = Get-WmiObject -Class win32_operatingsystem
    $totalMemGB = [math]::Round($memory.TotalVisibleMemorySize / 1MB, 2)
    $freeMemGB = [math]::Round($memory.FreePhysicalMemory / 1MB, 2)
    $usedMemGB = [math]::Round(($memory.TotalVisibleMemorySize - $memory.FreePhysicalMemory) / 1MB, 2)
    $usagePercent = [math]::Round((($memory.TotalVisibleMemorySize - $memory.FreePhysicalMemory) / $memory.TotalVisibleMemorySize) * 100, 1)
    
    Write-ColorLine "Memory Usage: $usagePercent%" $colors.Info
    Write-ColorLine "  Total: $totalMemGB GB" $colors.Info
    Write-ColorLine "  Used: $usedMemGB GB" $colors.Info
    Write-ColorLine "  Free: $freeMemGB GB" $colors.Info
    
    if ($usagePercent -gt 90) {
        Log-Event "ERROR" "Memory usage critically high: $usagePercent%" "Memory"
        $script:alertsRaised++
    } elseif ($usagePercent -gt 80) {
        Log-Event "WARNING" "Memory usage warning: $usagePercent%" "Memory"
    } else {
        Log-Event "SUCCESS" "Memory usage normal: $usagePercent%" "Memory"
    }
    
    return @{
        TotalMemGB = $totalMemGB
        UsedMemGB = $usedMemGB
        FreeMemGB = $freeMemGB
        UsagePercent = $usagePercent
    }
}

# ========================================
# LOG FILE MONITORING
# ========================================
function Monitor-LogFiles {
    Write-Host ""
    Write-ColorLine "=== LOG FILE MONITORING ===" $colors.Section
    
    $logDirs = @("logs", "logs/autonomous", "logs/monitoring")
    $totalSize = 0
    
    foreach ($dir in $logDirs) {
        if (Test-Path $dir) {
            $files = Get-ChildItem -Path $dir -File
            $dirSize = ($files | Measure-Object -Property Length -Sum).Sum
            $sizeGB = [math]::Round($dirSize / 1GB, 3)
            
            Write-ColorLine "$dir: $sizeGB GB" $colors.Info
            $totalSize += $dirSize
            
            # Clean old logs
            $daysOld = 30
            $cutoffDate = (Get-Date).AddDays(-$daysOld)
            $oldFiles = $files | Where-Object { $_.LastWriteTime -lt $cutoffDate }
            
            if ($oldFiles) {
                $oldFiles | Remove-Item -Force
                Log-Event "SUCCESS" "Cleaned $(($oldFiles | Measure-Object).Count) log files older than $daysOld days" "Cleanup"
            }
        }
    }
    
    $totalSizeGB = [math]::Round($totalSize / 1GB, 3)
    Log-Event "SUCCESS" "Total log file size: $totalSizeGB GB" "Logs"
    
    return @{ TotalSizeGB = $totalSizeGB }
}

# ========================================
# API HEALTH CHECK
# ========================================
function Monitor-API {
    Write-Host ""
    Write-ColorLine "=== API HEALTH CHECK ===" $colors.Section
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Log-Event "SUCCESS" "API health check passed" "API"
            return $true
        }
    } catch {
        Log-Event "ERROR" "API health check failed - $_" "API"
        $script:alertsRaised++
        return $false
    }
}

# ========================================
# DATABASE MONITORING
# ========================================
function Monitor-Database {
    Write-Host ""
    Write-ColorLine "=== DATABASE MONITORING ===" $colors.Section
    
    # Check if PostgreSQL container is running
    try {
        $container = docker ps --filter "name=postgres" --format "{{.Names}}" 2>$null
        if ($container) {
            Log-Event "SUCCESS" "PostgreSQL container is running" "Database"
            return $true
        } else {
            Log-Event "WARNING" "PostgreSQL container is not running" "Database"
            return $false
        }
    } catch {
        Log-Event "WARNING" "Unable to check PostgreSQL status - $_" "Database"
        return $false
    }
}

# ========================================
# COMPREHENSIVE STATUS REPORT
# ========================================
function Generate-StatusReport {
    param(
        [object]$ProcessResults,
        [object]$PortResults,
        [object]$DiskResults,
        [object]$MemoryResults,
        [object]$LogResults,
        [bool]$ApiHealthy,
        [bool]$DatabaseHealthy
    )
    
    Write-Host ""
    Write-ColorLine "=== COMPREHENSIVE STATUS REPORT ===" $colors.Section
    
    $overallHealthy = $true
    
    # Process status
    Write-Host ""
    Write-Host "Process Status:"
    foreach ($result in $ProcessResults) {
        $status = if ($result.Running) { "✓ Running" } else { "✗ Not Running" }
        $color = if ($result.Running) { $colors.Success } else { $colors.Error }
        Write-ColorLine "  $($result.Process): $status" $color
        if (-not $result.Running) { $overallHealthy = $false }
    }
    
    # Port status
    Write-Host ""
    Write-Host "Service Status:"
    foreach ($result in $PortResults) {
        $status = if ($result.Responding) { "✓ Responding" } else { "✗ Not Responding" }
        $color = if ($result.Responding) { $colors.Success } else { $colors.Error }
        Write-ColorLine "  $($result.Service) (port $($result.Port)): $status" $color
        if (-not $result.Responding) { $overallHealthy = $false }
    }
    
    # Resource status
    Write-Host ""
    Write-Host "Resource Status:"
    Write-ColorLine "  Disk Usage: $($DiskResults.UsagePercent)% - $(if ($DiskResults.UsagePercent -lt 80) { '✓ OK' } else { '⚠ Warning' })" $colors.Info
    Write-ColorLine "  Memory Usage: $($MemoryResults.UsagePercent)% - $(if ($MemoryResults.UsagePercent -lt 80) { '✓ OK' } else { '⚠ Warning' })" $colors.Info
    
    # Application status
    Write-Host ""
    Write-Host "Application Status:"
    Write-ColorLine "  API Health: $(if ($ApiHealthy) { '✓ Healthy' } else { '✗ Unhealthy' })" (if ($ApiHealthy) { $colors.Success } else { $colors.Error })
    Write-ColorLine "  Database: $(if ($DatabaseHealthy) { '✓ Running' } else { '⚠ Issue' })" (if ($DatabaseHealthy) { $colors.Success } else { $colors.Warning })
    
    # Overall status
    Write-Host ""
    $overallStatus = if ($overallHealthy -and $ApiHealthy -and $DatabaseHealthy) { "✓ HEALTHY" } else { "⚠ WARNING" }
    $overallColor = if ($overallHealthy -and $ApiHealthy -and $DatabaseHealthy) { $colors.Success } else { $colors.Warning }
    Write-ColorLine "OVERALL STATUS: $overallStatus" $overallColor
    
    Write-Host ""
    Write-ColorLine "Alerts Raised: $($script:alertsRaised)" (if ($script:alertsRaised -eq 0) { $colors.Success } else { $colors.Warning })
    Write-ColorLine "Checks Performed: $($script:checksPerformed)" $colors.Info
    Write-ColorLine "Uptime: $(((Get-Date) - $monitoringStartTime).ToString('dd\:hh\:mm\:ss'))" $colors.Info
}

# ========================================
# SEND ALERT
# ========================================
function Send-Alert {
    param(
        [string]$Subject,
        [string]$Message
    )
    
    # Log to file
    Log-Event "ERROR" $Message "Alert"
    
    # TODO: Implement email/Slack alerts
    # For now, just log to console
    Write-ColorLine "🚨 ALERT: $Message" $colors.Error
}

# ========================================
# MAIN MONITORING LOOP
# ========================================
function Start-Monitoring {
    Write-ColorLine "Starting Health Monitoring Service..." $colors.Section
    Write-ColorLine "Check Interval: $IntervalSeconds seconds" $colors.Info
    Write-ColorLine "Continuous Mode: $Continuous" $colors.Info
    Write-Host ""
    
    do {
        Clear-Host
        Write-ColorLine "Real Estate Intelligence - Health Monitor" $colors.Section
        Write-ColorLine "Started: $monitoringStartTime" $colors.Info
        Write-ColorLine "Current Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" $colors.Info
        
        $script:checksPerformed++
        $script:alertsRaised = 0
        
        # Run all checks
        $processResults = Monitor-Processes
        $portResults = Monitor-Ports
        $diskResults = Monitor-DiskSpace
        $memoryResults = Monitor-Memory
        $logResults = Monitor-LogFiles
        $apiHealthy = Monitor-API
        $databaseHealthy = Monitor-Database
        
        # Generate comprehensive report
        Generate-StatusReport $processResults $portResults $diskResults $memoryResults $logResults $apiHealthy $databaseHealthy
        
        if ($Continuous) {
            Write-Host ""
            Write-ColorLine "Next check in $IntervalSeconds seconds... (Press Ctrl+C to stop)" $colors.Info
            Start-Sleep -Seconds $IntervalSeconds
        } else {
            break
        }
    } while ($true)
}

# ========================================
# RUN MONITORING
# ========================================
Start-Monitoring
