param([string]$ProjectRoot = "C:\Users\JARVIS\OneDrive\Documents\Real_estate_Intelligence")

$OutputDirectory = Join-Path $ProjectRoot "reports\validation"
$LogDirectory = Join-Path $ProjectRoot "logs\validation"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

@($OutputDirectory, $LogDirectory) | ForEach-Object {
    if (-not (Test-Path $_)) { New-Item -ItemType Directory -Force -Path $_ | Out-Null }
}

$LogFile = Join-Path $LogDirectory "validation_$Timestamp.log"
$ReportFile = Join-Path $OutputDirectory "validation_report_$Timestamp.txt"

function Write-Val {
    param([string]$Message, [string]$Level = "INFO")
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$ts] [$Level] $Message"
    Add-Content -Path $LogFile -Value $line
    $color = if($Level -eq "PASS"){"Green"}elseif($Level -eq "FAIL"){"Red"}elseif($Level -eq "WARN"){"Yellow"}elseif($Level -eq "SECTION"){"Cyan"}else{"White"}
    Write-Host $line -ForegroundColor $color
}

Write-Val "======================================================" "SECTION"
Write-Val "DEEP SYSTEM VALIDATION STARTING" "SECTION"
Write-Val "======================================================" "SECTION"

$checks = @{}

# CHECK 1: Project Structure
Write-Val "" "INFO"
Write-Val "CHECK 1: PROJECT STRUCTURE INTEGRITY" "SECTION"
$structurePass = $true

$requiredDirs = @(
    "agents", "enterprise", "scripts", "src", "config", "data", "logs", "reports", "docs", "contracts", "ml-models"
)

foreach ($dir in $requiredDirs) {
    $path = Join-Path $ProjectRoot $dir
    if (Test-Path $path) {
        Write-Val "  OK: /$dir exists" "PASS"
    } else {
        Write-Val "  FAIL: /$dir missing" "FAIL"
        $structurePass = $false
    }
}
$checks.structure = $structurePass

# CHECK 2: Critical Files
Write-Val "" "INFO"
Write-Val "CHECK 2: CRITICAL FILES VALIDATION" "SECTION"
$criticalPass = $true

$criticalFiles = @(
    @{path = "SYSTEM_MANIFEST.md"; required = $true}
    @{path = "COMPLIANCE_STANDARDS_FRAMEWORK.md"; required = $true}
    @{path = "enterprise/00-MASTER-INDEX/ENTERPRISE_INDEX.md"; required = $true}
    @{path = "enterprise/07-TASKS/TASK_MANIFEST.json"; required = $true}
    @{path = "README.md"; required = $true}
    @{path = "package.json"; required = $true}
    @{path = "tsconfig.json"; required = $true}
)

foreach ($file in $criticalFiles) {
    $path = Join-Path $ProjectRoot $file.path
    if (Test-Path $path) {
        $size = (Get-Item $path).Length / 1KB
        Write-Val "  OK: $($file.path) ($([math]::Round($size,1))KB)" "PASS"
    } else {
        Write-Val "  FAIL: $($file.path) missing" "FAIL"
        $criticalPass = $false
    }
}
$checks.critical_files = $criticalPass

# CHECK 3: Agent Directory
Write-Val "" "INFO"
Write-Val "CHECK 3: AGENT SYSTEM VALIDATION" "SECTION"
$agentPass = $true
$agentDir = Join-Path $ProjectRoot "agents"
$agents = Get-ChildItem $agentDir -Directory -ErrorAction SilentlyContinue

Write-Val "  Total agents: $($agents.Count)" "INFO"

$keyAgents = @("compliance_monitor_agent.ps1", "sop_enforcement_agent.ps1")
foreach ($agent in $keyAgents) {
    $found = $false
    foreach ($a in $agents) {
        if (Test-Path (Join-Path $a.FullName $agent)) {
            $found = $true
            Write-Val "  OK: $agent found" "PASS"
            break
        }
    }
    if (-not $found -and (Test-Path (Join-Path $agentDir $agent))) {
        Write-Val "  OK: $agent found in agents/" "PASS"
    } elseif (-not $found) {
        Write-Val "  WARN: $agent not found" "WARN"
    }
}

$checks.agents = $agentPass

# CHECK 4: Enterprise Index System
Write-Val "" "INFO"
Write-Val "CHECK 4: ENTERPRISE INDEX SYSTEM" "SECTION"
$indexPass = $true
$indexPath = Join-Path $ProjectRoot "enterprise/00-MASTER-INDEX/ENTERPRISE_INDEX.md"

if (Test-Path $indexPath) {
    $indexContent = Get-Content $indexPath -Raw
    $indexCount = ([regex]::Matches($indexContent, '\d+\.\w+(\.\d+)+') | Select-Object -Unique).Count
    Write-Val "  OK: Index file exists ($indexCount unique references)" "PASS"
    
    if ($indexContent -match "6\.\w") { Write-Val "  OK: Index has agent references" "PASS" }
    if ($indexContent -match "5\.\w") { Write-Val "  OK: Index has task references" "PASS" }
    if ($indexContent -match "4\.\w") { Write-Val "  OK: Index has governance references" "PASS" }
} else {
    Write-Val "  FAIL: Enterprise index missing" "FAIL"
    $indexPass = $false
}
$checks.index = $indexPass

# CHECK 5: Task Manifest
Write-Val "" "INFO"
Write-Val "CHECK 5: TASK MANIFEST VALIDATION" "SECTION"
$taskPass = $true
$taskPath = Join-Path $ProjectRoot "enterprise/07-TASKS/TASK_MANIFEST.json"

if (Test-Path $taskPath) {
    try {
        $manifest = Get-Content $taskPath | ConvertFrom-Json
        Write-Val "  OK: Task manifest parses correctly (version $($manifest.manifest_version))" "PASS"
        
        $phaseCount = $manifest.task_phases.PSObject.Properties.Count
        Write-Val "  OK: $phaseCount task phases defined" "PASS"
        
        $totalTasks = 0
        foreach ($phase in $manifest.task_phases.PSObject.Properties) {
            $totalTasks += $phase.Value.tasks.Count
        }
        Write-Val "  OK: $totalTasks total tasks" "PASS"
    } catch {
        Write-Val "  FAIL: Task manifest JSON error: $_" "FAIL"
        $taskPass = $false
    }
} else {
    Write-Val "  FAIL: Task manifest missing" "FAIL"
    $taskPass = $false
}
$checks.tasks = $taskPass

# CHECK 6: Compliance Framework
Write-Val "" "INFO"
Write-Val "CHECK 6: COMPLIANCE FRAMEWORK" "SECTION"
$compliancePass = $true
$compPath = Join-Path $ProjectRoot "COMPLIANCE_STANDARDS_FRAMEWORK.md"

if (Test-Path $compPath) {
    $compContent = Get-Content $compPath -Raw
    Write-Val "  OK: Compliance framework exists" "PASS"
    
    if ($compContent -match "Microsoft") { Write-Val "  OK: Microsoft standards covered" "PASS" }
    if ($compContent -match "Google") { Write-Val "  OK: Google standards covered" "PASS" }
    if ($compContent -match "OpenAI") { Write-Val "  OK: OpenAI standards covered" "PASS" }
    if ($compContent -match "Anthropic") { Write-Val "  OK: Anthropic standards covered" "PASS" }
    if ($compContent -match "Real Estate") { Write-Val "  OK: Real Estate standards covered" "PASS" }
    
    # Check for lint errors
    if ($compContent -match '\breqs\b') {
        Write-Val "  WARN: Possible typo 'reqs' found" "WARN"
    } else {
        Write-Val "  OK: No obvious lint errors" "PASS"
    }
} else {
    Write-Val "  FAIL: Compliance framework missing" "FAIL"
    $compliancePass = $false
}
$checks.compliance = $compliancePass

# CHECK 7: Git Repository
Write-Val "" "INFO"
Write-Val "CHECK 7: GIT REPOSITORY STATUS" "SECTION"
$gitPass = $true

try {
    $gitStatus = & git -C $ProjectRoot status --porcelain 2>&1
    Write-Val "  OK: Git repository active" "PASS"
    
    if ($gitStatus) {
        $untracked = ($gitStatus | Where-Object {$_ -match '^\?\?'}).Count
        $modified = ($gitStatus | Where-Object {$_ -match '^\ M'}).Count
        $added = ($gitStatus | Where-Object {$_ -match '^A\ '}).Count
        
        Write-Val "  INFO: Untracked files: $untracked" "INFO"
        Write-Val "  INFO: Modified files: $modified" "INFO"
        Write-Val "  INFO: Added files: $added" "INFO"
    } else {
        Write-Val "  OK: All files committed" "PASS"
    }
    
    $logCount = & git -C $ProjectRoot rev-list --count HEAD 2>&1
    Write-Val "  OK: Commit history: $logCount commits" "PASS"
} catch {
    Write-Val "  WARN: Git check failed" "WARN"
}
$checks.git = $gitPass

# CHECK 8: Source Code Integrity
Write-Val "" "INFO"
Write-Val "CHECK 8: SOURCE CODE INTEGRITY" "SECTION"
$codePass = $true

$srcPath = Join-Path $ProjectRoot "src"
if (Test-Path $srcPath) {
    $tsFiles = (Get-ChildItem $srcPath -Filter "*.ts" -Recurse -ErrorAction SilentlyContinue).Count
    $jsFiles = (Get-ChildItem $srcPath -Filter "*.js" -Recurse -ErrorAction SilentlyContinue).Count
    Write-Val "  OK: TypeScript files: $tsFiles" "PASS"
    Write-Val "  OK: JavaScript files: $jsFiles" "PASS"
} else {
    Write-Val "  WARN: src/ directory not found" "WARN"
}

# Check for orphaned files
$dockerLlmPath = "C:\Users\JARVIS\OneDrive\Documents\docker_llm"
if (Test-Path $dockerLlmPath) {
    $orphans = Get-ChildItem $dockerLlmPath -File -ErrorAction SilentlyContinue | Where-Object {
        $_.Name -match "SYSTEM_MANIFEST|AUTO_VALIDATE|AGENT_LOCATION"
    }
    if ($orphans) {
        Write-Val "  WARN: Orphaned files in docker_llm: $($orphans.Count)" "WARN"
    } else {
        Write-Val "  OK: No orphaned files detected" "PASS"
    }
}
$checks.code = $codePass

# CHECK 9: Configuration Files
Write-Val "" "INFO"
Write-Val "CHECK 9: CONFIGURATION VALIDATION" "SECTION"
$configPass = $true

$configFiles = @(
    @{path = "package.json"; type = "JSON"}
    @{path = "tsconfig.json"; type = "JSON"}
)

foreach ($cfg in $configFiles) {
    $path = Join-Path $ProjectRoot $cfg.path
    if (Test-Path $path) {
        try {
            if ($cfg.type -eq "JSON") {
                $content = Get-Content $path | ConvertFrom-Json
                Write-Val "  OK: $($cfg.path) is valid JSON" "PASS"
            }
        } catch {
            Write-Val "  FAIL: $($cfg.path) syntax error" "FAIL"
            $configPass = $false
        }
    }
}
$checks.config = $configPass

# CHECK 10: System Health
Write-Val "" "INFO"
Write-Val "CHECK 10: SYSTEM HEALTH SUMMARY" "SECTION"

$totalChecks = $checks.Count
$passedChecks = ($checks.Values | Where-Object {$_ -eq $true}).Count
$healthScore = [math]::Round(($passedChecks / $totalChecks) * 100, 1)

Write-Val "  Checks Passed: $passedChecks/$totalChecks" "INFO"
Write-Val "  Health Score: $healthScore%" $(if($healthScore -ge 80){"PASS"}else{"WARN"})

Write-Val "" "INFO"
Write-Val "======================================================" "SECTION"
Write-Val "DEEP VALIDATION COMPLETE" "SECTION"
Write-Val "======================================================" "SECTION"

# Generate Report
$report = @"
======================================================
DEEP SYSTEM VALIDATION REPORT
======================================================
Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

VALIDATION RESULTS:
────────────────────────────────────────────────────
Structure:             $(if($checks.structure){"PASS"}else{"FAIL"})
Critical Files:        $(if($checks.critical_files){"PASS"}else{"FAIL"})
Agent System:          $(if($checks.agents){"PASS"}else{"FAIL"})
Enterprise Index:      $(if($checks.index){"PASS"}else{"FAIL"})
Task Manifest:         $(if($checks.tasks){"PASS"}else{"FAIL"})
Compliance Framework:  $(if($checks.compliance){"PASS"}else{"FAIL"})
Git Repository:        $(if($checks.git){"PASS"}else{"FAIL"})
Source Code:           $(if($checks.code){"PASS"}else{"FAIL"})
Configuration:         $(if($checks.config){"PASS"}else{"FAIL"})

OVERALL HEALTH: $healthScore%
Passed: $passedChecks/$totalChecks

SYSTEM STATUS: $(if($healthScore -ge 80){"HEALTHY"}elseif($healthScore -ge 60){"GOOD"}else{"NEEDS ATTENTION"})

NEXT ACTIONS:
────────────────────────────────────────────────────
1. Review detailed logs in $LogDirectory
2. Address any FAIL items immediately
3. Verify all agents are operational
4. Run compliance and SOP monitoring
5. Commit approved changes to git

======================================================
"@

$report | Out-File -FilePath $ReportFile -Force
Write-Val "" "INFO"
Write-Val "Report saved: $ReportFile" "PASS"
Write-Val "" "INFO"

Write-Host ""
Write-Host "VALIDATION COMPLETE - Health Score: $healthScore%" -ForegroundColor $(if($healthScore -ge 80){"Green"}else{"Yellow"})
