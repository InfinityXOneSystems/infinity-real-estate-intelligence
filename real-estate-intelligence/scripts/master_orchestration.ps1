# ============================================================================
# MASTER ORCHESTRATION AGENT
# ============================================================================
# Full system: analyze, diagnose, validate, fix, heal, and compliance check

param([string]$ProjectRoot = "C:\Users\JARVIS\OneDrive\Documents\Real_estate_Intelligence")

$OutputDirectory = Join-Path $ProjectRoot "reports\orchestration"
$LogDirectory = Join-Path $ProjectRoot "logs\orchestration"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

@($OutputDirectory, $LogDirectory) | ForEach-Object {
    if (-not (Test-Path $_)) { New-Item -ItemType Directory -Force -Path $_ | Out-Null }
}

$MasterLog = Join-Path $LogDirectory "master_$Timestamp.log"
$MasterReport = Join-Path $OutputDirectory "report_$Timestamp.txt"

function Write-Master {
    param([string]$Message, [string]$Level = "INFO")
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$ts] [$Level] $Message"
    Add-Content -Path $MasterLog -Value $line
    Write-Host $line -ForegroundColor $(if($Level -eq "SUCCESS"){"Green"}elseif($Level -eq "ERROR"){"Red"}elseif($Level -eq "PHASE"){"Cyan"}elseif($Level -eq "WARN"){"Yellow"}else{"White"})
}

Write-Master "======================================================" "PHASE"
Write-Master "MASTER ORCHESTRATION STARTING" "PHASE"
Write-Master "======================================================" "PHASE"

$startTime = Get-Date
$results = @{}

# PHASE 1: AUTONOMOUS FULL CYCLE
Write-Master "" "INFO"
Write-Master "PHASE 1: AUTONOMOUS FULL-CYCLE" "PHASE"
try {
    & npm run autonomous:full-cycle 2>&1 | Select-Object -First 30 | ForEach-Object { Write-Master "  $_" "INFO" }
    $results.autonomous = "COMPLETE"
    Write-Master "PHASE 1: SUCCESS" "SUCCESS"
}
catch {
    Write-Master "PHASE 1 FAILED: $_" "ERROR"
    $results.autonomous = "FAILED"
}

# PHASE 2: SOP VALIDATION
Write-Master "" "INFO"
Write-Master "PHASE 2: SOP VALIDATION" "PHASE"
try {
    $sop = & powershell -File "$ProjectRoot\agents\sop_enforcement_agent.ps1" -Mode validate 2>&1
    $sop | Select-Object -First 20 | ForEach-Object { Write-Master "  $_" "INFO" }
    $results.sop_validate = "COMPLETE"
    Write-Master "PHASE 2: SUCCESS" "SUCCESS"
}
catch {
    Write-Master "PHASE 2 FAILED: $_" "ERROR"
    $results.sop_validate = "FAILED"
}

# PHASE 3: COMPLIANCE CHECK
Write-Master "" "INFO"
Write-Master "PHASE 3: COMPLIANCE MONITORING" "PHASE"
try {
    $comp = & powershell -File "$ProjectRoot\agents\compliance_monitor_agent.ps1" 2>&1
    $comp | Select-Object -First 20 | ForEach-Object { Write-Master "  $_" "INFO" }
    $results.compliance = "COMPLETE"
    Write-Master "PHASE 3: SUCCESS" "SUCCESS"
}
catch {
    Write-Master "PHASE 3 FAILED: $_" "ERROR"
    $results.compliance = "FAILED"
}

# PHASE 4: SOP ENFORCEMENT
Write-Master "" "INFO"
Write-Master "PHASE 4: SOP ENFORCEMENT (AUTO-FIX)" "PHASE"
try {
    $fix = & powershell -File "$ProjectRoot\agents\sop_enforcement_agent.ps1" -Mode enforce -AutoFix 2>&1
    $fix | Select-Object -First 20 | ForEach-Object { Write-Master "  $_" "INFO" }
    $results.sop_enforce = "COMPLETE"
    Write-Master "PHASE 4: SUCCESS" "SUCCESS"
}
catch {
    Write-Master "PHASE 4 FAILED: $_" "ERROR"
    $results.sop_enforce = "FAILED"
}

# PHASE 5: GIT STATUS
Write-Master "" "INFO"
Write-Master "PHASE 5: GIT STATUS" "PHASE"
try {
    $gitStatus = & git -C $ProjectRoot status --porcelain 2>&1
    if ($gitStatus) {
        Write-Master "Changes detected: $($gitStatus.Count) files" "WARN"
        $gitStatus | Select-Object -First 10 | ForEach-Object { Write-Master "  $_" "INFO" }
        $results.git = "PENDING"
    }
    else {
        Write-Master "Git clean" "SUCCESS"
        $results.git = "CLEAN"
    }
}
catch {
    Write-Master "Git check failed: $_" "WARN"
    $results.git = "CHECK_FAILED"
}

# PHASE 6: SYSTEM SUMMARY
Write-Master "" "INFO"
Write-Master "PHASE 6: SYSTEM SUMMARY" "PHASE"

$agents = (Get-ChildItem "$ProjectRoot\agents" -Directory).Count
$files = (Get-ChildItem $ProjectRoot -Recurse -File -ErrorAction SilentlyContinue).Count
$size = "{0:N2}" -f ((Get-ChildItem $ProjectRoot -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1GB)

Write-Master "Agents: $agents | Files: $files | Size: $size GB" "INFO"

$critFiles = @("SYSTEM_MANIFEST.md", "COMPLIANCE_STANDARDS_FRAMEWORK.md", "enterprise\00-MASTER-INDEX\ENTERPRISE_INDEX.md", "enterprise\07-TASKS\TASK_MANIFEST.json")
foreach ($f in $critFiles) {
    $p = Join-Path $ProjectRoot $f
    if (Test-Path $p) { Write-Master "  OK: $f" "SUCCESS" }
    else { Write-Master "  MISSING: $f" "ERROR" }
}

$results.summary = "COMPLETE"
Write-Master "PHASE 6: SUCCESS" "SUCCESS"

# FINAL REPORT
Write-Master "" "INFO"
Write-Master "======================================================" "PHASE"
Write-Master "ORCHESTRATION COMPLETE" "PHASE"
Write-Master "======================================================" "PHASE"

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Master "" "INFO"
Write-Master "Results:" "INFO"
$results.GetEnumerator() | ForEach-Object { Write-Master "  $($_.Key): $($_.Value)" "INFO" }
Write-Master "Duration: $($duration.Minutes) min $($duration.Seconds) sec" "INFO"

Write-Master "" "INFO"
Write-Master "Logs saved to: $LogDirectory" "INFO"
Write-Master "Reports saved to: $OutputDirectory" "INFO"

# Save summary report
$report = @"
====================================================
MASTER ORCHESTRATION REPORT
====================================================
Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Duration: $($duration.Minutes) min $($duration.Seconds) sec

PHASE RESULTS:
────────────────────────────────────────────────
$($results.GetEnumerator() | ForEach-Object { "  $($_.Key): $($_.Value)`n" })

SYSTEM INFO:
────────────────────────────────────────────────
Agents: $agents
Files: $files
Size: $size GB

NEXT ACTIONS:
────────────────────────────────────────────────
1. Review validation reports
2. Address any issues found
3. Git commit if all checks pass
4. Continue monitoring

====================================================
"@

$report | Out-File -Path $MasterReport -Force
Write-Master "Report: $MasterReport" "SUCCESS"

Write-Host ""
Write-Host "COMPLETE - All orchestration phases finished" -ForegroundColor Green
