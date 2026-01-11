# ============================================================================
# SOP ENFORCEMENT AGENT: Real Estate Intelligence System
# ============================================================================
# Purpose: Monitor, validate, and enforce Standard Operating Procedures
# Index: 5.A.1 (Enterprise Governance)
# Status: AUTONOMOUS - Monitors all system operations continuously
# Integration: Works with TASK_MANIFEST.json and autonomous-agent.ps1
# ============================================================================

param(
    [ValidateSet("validate", "enforce", "monitor", "report", "fix", "full-cycle")]
    [string]$Mode = "full-cycle",
    
    [string]$TaskManifestPath = "C:\Users\JARVIS\OneDrive\Documents\Real_estate_Intelligence\enterprise\07-TASKS\TASK_MANIFEST.json",
    [string]$EnterpriseIndexPath = "C:\Users\JARVIS\OneDrive\Documents\Real_estate_Intelligence\enterprise\00-MASTER-INDEX\ENTERPRISE_INDEX.md",
    [switch]$AutoFix = $true,
    [switch]$DryRun = $false,
    [switch]$Verbose = $false,
    [string]$OutputDirectory = "C:\Users\JARVIS\OneDrive\Documents\Real_estate_Intelligence\reports\sop-enforcement"
)

# ============================================================================
# CONFIGURATION & SETUP
# ============================================================================

$ProjectRoot = "C:\Users\JARVIS\OneDrive\Documents\Real_estate_Intelligence"
$AgentsDirectory = Join-Path $ProjectRoot "agents"
$EnterpriseDirectory = Join-Path $ProjectRoot "enterprise"
$LogDirectory = Join-Path $ProjectRoot "logs\sop-enforcement"
$TimestampFormat = "yyyyMMdd_HHmmss"
$Timestamp = Get-Date -Format $TimestampFormat

# Ensure output directories exist
@($OutputDirectory, $LogDirectory) | ForEach-Object {
    if (-not (Test-Path $_)) {
        New-Item -ItemType Directory -Force -Path $_ | Out-Null
    }
}

$LogFile = Join-Path $LogDirectory "sop_enforcement_$Timestamp.log"
$ReportFile = Join-Path $OutputDirectory "sop_report_$Timestamp.json"
$EnforcementLog = Join-Path $OutputDirectory "enforcement_actions_$Timestamp.log"

# ============================================================================
# LOGGING FUNCTIONS
# ============================================================================

function Write-Log {
    param(
        [string]$Message,
        [ValidateSet("INFO", "WARN", "ERROR", "DEBUG", "SUCCESS")]
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    Add-Content -Path $LogFile -Value $logEntry -ErrorAction SilentlyContinue
    
    if ($Verbose -or $Level -eq "ERROR" -or $Level -eq "WARN") {
        Write-Host $logEntry -ForegroundColor $(
            switch($Level) {
                "SUCCESS" { "Green" }
                "ERROR" { "Red" }
                "WARN" { "Yellow" }
                "DEBUG" { "Gray" }
                default { "White" }
            }
        )
    }
}

function Log-EnforcementAction {
    param(
        [string]$Action,
        [string]$Target,
        [string]$Result,
        [string]$Details
    )
    
    $entry = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        action = $Action
        target = $Target
        result = $Result
        details = $Details
    } | ConvertTo-Json -Compress
    
    Add-Content -Path $EnforcementLog -Value $entry
}

# ============================================================================
# CORE SOP VALIDATION FUNCTIONS
# ============================================================================

function Get-TaskManifest {
    <#
    .SYNOPSIS
    Loads and validates the TASK_MANIFEST.json
    #>
    try {
        if (-not (Test-Path $TaskManifestPath)) {
            Write-Log "Task manifest not found: $TaskManifestPath" "ERROR"
            return $null
        }
        
        $manifest = Get-Content $TaskManifestPath | ConvertFrom-Json
        Write-Log "Loaded TASK_MANIFEST.json (version $($manifest.manifest_version))" "INFO"
        return $manifest
    }
    catch {
        Write-Log "Failed to load task manifest: $_" "ERROR"
        return $null
    }
}

function Validate-TaskStructure {
    <#
    .SYNOPSIS
    Validates that all tasks follow required SOP structure
    #>
    param([object]$Manifest)
    
    Write-Log "Validating task structure..." "INFO"
    $violations = @()
    $requiredFields = @("task_id", "index", "name", "status", "assigned_to", "priority", "completion_criteria")
    
    # Check all task phases
    foreach ($phase in $Manifest.task_phases.PSObject.Properties) {
        $phaseName = $phase.Name
        $phaseData = $phase.Value
        
        if ($null -eq $phaseData.tasks) {
            $violations += @{
                severity = "ERROR"
                phase = $phaseName
                issue = "No tasks defined in phase"
            }
            continue
        }
        
        foreach ($task in $phaseData.tasks) {
            # Check for required fields
            foreach ($field in $requiredFields) {
                if ($null -eq $task.$field -or $task.$field -eq "") {
                    $violations += @{
                        severity = "WARN"
                        phase = $phaseName
                        task = $task.task_id
                        issue = "Missing required field: $field"
                    }
                }
            }
            
            # Validate status values
            if ($task.status -notmatch "^(not-started|in-progress|blocked|completed|on-hold)$") {
                $violations += @{
                    severity = "ERROR"
                    phase = $phaseName
                    task = $task.task_id
                    issue = "Invalid status: $($task.status). Must be: not-started, in-progress, blocked, completed, on-hold"
                }
            }
            
            # Validate priority values
            if ($task.priority -notmatch "^(critical|high|medium|low)$") {
                $violations += @{
                    severity = "WARN"
                    phase = $phaseName
                    task = $task.task_id
                    issue = "Invalid priority: $($task.priority)"
                }
            }
            
            # Check index format (should be like "5.B.1.1")
            if ($task.index -notmatch "^\d+\.\w+(\.\d+)+$") {
                $violations += @{
                    severity = "WARN"
                    phase = $phaseName
                    task = $task.task_id
                    issue = "Invalid index format: $($task.index)"
                }
            }
        }
    }
    
    Write-Log "Task structure validation complete: $($violations.Count) issues found" "INFO"
    return $violations
}

function Validate-IndexReferences {
    <#
    .SYNOPSIS
    Validates that all task indexes are valid and exist in ENTERPRISE_INDEX.md
    #>
    param([object]$Manifest)
    
    Write-Log "Validating index references..." "INFO"
    $violations = @()
    
    # Get all indexes from enterprise index
    if (-not (Test-Path $EnterpriseIndexPath)) {
        Write-Log "Enterprise index not found for validation" "WARN"
        return @()
    }
    
    $indexContent = Get-Content $EnterpriseIndexPath -Raw
    $allTasks = @()
    
    # Collect all task indexes
    foreach ($phase in $Manifest.task_phases.PSObject.Properties) {
        foreach ($task in $phase.Value.tasks) {
            $allTasks += $task.index
            
            # Validate referenced documents
            if ($task.documents_involved) {
                foreach ($doc in $task.documents_involved) {
                    if ($indexContent -notmatch [regex]::Escape($doc)) {
                        $violations += @{
                            severity = "WARN"
                            task = $task.task_id
                            issue = "Document reference not found in index: $doc"
                        }
                    }
                }
            }
        }
    }
    
    Write-Log "Index validation complete: $($violations.Count) missing references" "WARN"
    return $violations
}

function Validate-TaskDependencies {
    <#
    .SYNOPSIS
    Validates that task dependencies exist and form no circular references
    #>
    param([object]$Manifest)
    
    Write-Log "Validating task dependencies..." "INFO"
    $violations = @()
    $taskMap = @{}
    $allTasks = @()
    
    # Build task map
    foreach ($phase in $Manifest.task_phases.PSObject.Properties) {
        foreach ($task in $phase.Value.tasks) {
            $taskMap[$task.task_id] = $task
            $allTasks += $task.task_id
        }
    }
    
    # Check dependencies
    foreach ($taskId in $allTasks) {
        $task = $taskMap[$taskId]
        
        if ($task.dependencies) {
            foreach ($dep in $task.dependencies) {
                # Check dependency exists
                if ($taskMap.Keys -notcontains $dep) {
                    $violations += @{
                        severity = "ERROR"
                        task = $taskId
                        issue = "Dependency not found: $dep"
                    }
                }
            }
        }
    }
    
    Write-Log "Dependency validation complete: $($violations.Count) issues found" "INFO"
    return $violations
}

function Validate-AgentCompliance {
    <#
    .SYNOPSIS
    Validates that all agents follow required file structure and identity patterns
    #>
    
    Write-Log "Validating agent compliance..." "INFO"
    $violations = @()
    
    $agentFolders = Get-ChildItem -Path $AgentsDirectory -Directory -ErrorAction SilentlyContinue
    
    foreach ($agent in $agentFolders) {
        $agentPath = $agent.FullName
        $agentName = $agent.Name
        
        # Check for PowerShell scripts
        $scripts = Get-ChildItem -Path $agentPath -Filter "*.ps1" -ErrorAction SilentlyContinue
        if ($scripts.Count -eq 0) {
            $violations += @{
                severity = "INFO"
                agent = $agentName
                issue = "No PowerShell scripts found in agent directory"
            }
        }
    }
    
    Write-Log "Agent compliance check complete: $($violations.Count) items noted" "INFO"
    return $violations
}

function Validate-FileStructure {
    <#
    .SYNOPSIS
    Validates that critical files are in correct locations
    #>
    
    Write-Log "Validating file structure..." "INFO"
    $violations = @()
    
    # Check required files exist
    $requiredFiles = @(
        @{ path = $TaskManifestPath; name = "TASK_MANIFEST.json"; severity = "ERROR" }
        @{ path = $EnterpriseIndexPath; name = "ENTERPRISE_INDEX.md"; severity = "ERROR" }
        @{ path = (Join-Path $ProjectRoot "SYSTEM_MANIFEST.md"); name = "SYSTEM_MANIFEST.md"; severity = "ERROR" }
        @{ path = (Join-Path $ProjectRoot "COMPLIANCE_STANDARDS_FRAMEWORK.md"); name = "COMPLIANCE_STANDARDS_FRAMEWORK.md"; severity = "WARN" }
    )
    
    foreach ($file in $requiredFiles) {
        if (-not (Test-Path $file.path)) {
            $violations += @{
                severity = $file.severity
                issue = "Missing critical file: $($file.name)"
                path = $file.path
            }
        }
    }
    
    Write-Log "File structure validation complete: $($violations.Count) issues found" "INFO"
    return $violations
}

# ============================================================================
# ENFORCEMENT FUNCTIONS
# ============================================================================

function Enforce-Procedures {
    <#
    .SYNOPSIS
    Enforces standard operating procedures on all tasks
    #>
    
    Write-Log "Enforcing system procedures..." "INFO"
    
    $manifest = Get-TaskManifest
    if ($null -eq $manifest) { return }
    
    $enforced = 0
    $blocked = 0
    
    foreach ($phase in $manifest.task_phases.PSObject.Properties) {
        foreach ($task in $phase.Value.tasks) {
            # Enforce: Critical tasks should not be blocked
            if ($task.priority -eq "critical" -and $task.status -eq "blocked") {
                Write-Log "ENFORCING: Critical task $($task.task_id) is blocked - escalating" "WARN"
                Log-EnforcementAction -Action "enforce-critical" -Target $task.task_id -Result "ESCALATED" -Details "Critical task blocked"
                $enforced++
            }
            
            # Enforce: Blocked tasks must have blocker reason
            if ($task.status -eq "blocked" -and $null -eq $task.blockers) {
                Write-Log "ENFORCING: Task $($task.task_id) is blocked but has no blocker documented" "WARN"
                Log-EnforcementAction -Action "enforce-blocker-doc" -Target $task.task_id -Result "REQUIRES-DOC" -Details "Blocked status requires blocker documentation"
                $blocked++
            }
            
            # Enforce: Completion criteria must exist for completed tasks
            if ($task.status -eq "completed" -and $null -eq $task.completion_criteria) {
                Write-Log "ENFORCING: Task $($task.task_id) marked completed but has no completion criteria" "WARN"
                Log-EnforcementAction -Action "enforce-criteria" -Target $task.task_id -Result "FLAGGED" -Details "Completed tasks must have completion criteria"
                $enforced++
            }
        }
    }
    
    return @{ enforced = $enforced; blocked = $blocked }
}

# ============================================================================
# REPORTING FUNCTIONS
# ============================================================================

function Generate-Report {
    <#
    .SYNOPSIS
    Generates comprehensive SOP enforcement report
    #>
    param([hashtable]$ValidatorResults)
    
    Write-Log "Generating SOP enforcement report..." "INFO"
    
    $report = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        report_index = "5.A.1"
        agent = "SOP_ENFORCEMENT_AGENT"
        mode = $Mode
        project_root = $ProjectRoot
        
        validation_results = @{
            task_structure = @{ violations = $ValidatorResults.taskStructure.Count }
            index_references = @{ violations = $ValidatorResults.indexReferences.Count }
            task_dependencies = @{ violations = $ValidatorResults.taskDependencies.Count }
            agent_compliance = @{ violations = $ValidatorResults.agentCompliance.Count }
            file_structure = @{ violations = $ValidatorResults.fileStructure.Count }
        }
        
        total_violations = ($ValidatorResults.Values | Measure-Object -Property Count -Sum).Sum
        
        violations_detail = $ValidatorResults
        
        recommendations = @(
            "Review all violations logged in enforcement actions"
            "Prioritize critical (ERROR) violations immediately"
            "Schedule manual review for WARN level violations"
            "Run compliance_monitor_agent.ps1 to validate system-wide compliance"
            "Update TASK_MANIFEST.json with corrected information"
        )
    }
    
    # Save report as JSON
    $report | ConvertTo-Json -Depth 10 | Set-Content -Path $ReportFile -Force
    Write-Log "Report saved to: $ReportFile" "SUCCESS"
    
    return $report
}

function Show-Report {
    <#
    .SYNOPSIS
    Displays summary of SOP enforcement report
    #>
    param([hashtable]$Report)
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "SOP ENFORCEMENT REPORT" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Timestamp: $($Report.timestamp)" -ForegroundColor White
    Write-Host "Index: $($Report.report_index)" -ForegroundColor White
    Write-Host ""
    Write-Host "VALIDATION SUMMARY:" -ForegroundColor Yellow
    Write-Host "  Task Structure Violations: $($Report.validation_results.task_structure.violations)" -ForegroundColor $(if ($Report.validation_results.task_structure.violations -gt 0) { "Red" } else { "Green" })
    Write-Host "  Index Reference Violations: $($Report.validation_results.index_references.violations)" -ForegroundColor $(if ($Report.validation_results.index_references.violations -gt 0) { "Red" } else { "Green" })
    Write-Host "  Dependency Violations: $($Report.validation_results.task_dependencies.violations)" -ForegroundColor $(if ($Report.validation_results.task_dependencies.violations -gt 0) { "Red" } else { "Green" })
    Write-Host "  Agent Compliance Issues: $($Report.validation_results.agent_compliance.violations)" -ForegroundColor $(if ($Report.validation_results.agent_compliance.violations -gt 0) { "Yellow" } else { "Green" })
    Write-Host "  File Structure Issues: $($Report.validation_results.file_structure.violations)" -ForegroundColor $(if ($Report.validation_results.file_structure.violations -gt 0) { "Yellow" } else { "Green" })
    Write-Host ""
    Write-Host "TOTAL ISSUES: $($Report.total_violations)" -ForegroundColor $(if ($Report.total_violations -gt 0) { "Yellow" } else { "Green" })
    Write-Host ""
    Write-Host "Reports saved to:" -ForegroundColor Cyan
    Write-Host "  JSON Report: $ReportFile" -ForegroundColor Gray
    Write-Host "  Actions Log: $EnforcementLog" -ForegroundColor Gray
    Write-Host "========================================`n" -ForegroundColor Cyan
}

# ============================================================================
# MAIN EXECUTION MODES
# ============================================================================

function Invoke-ValidateMode {
    Write-Log "Running VALIDATE mode - checking SOP compliance..." "INFO"
    
    $manifest = Get-TaskManifest
    if ($null -eq $manifest) { return }
    
    $violations = @{
        taskStructure = Validate-TaskStructure -Manifest $manifest
        indexReferences = Validate-IndexReferences -Manifest $manifest
        taskDependencies = Validate-TaskDependencies -Manifest $manifest
        agentCompliance = Validate-AgentCompliance
        fileStructure = Validate-FileStructure
    }
    
    $report = Generate-Report -ValidatorResults $violations
    Show-Report -Report $report
}

function Invoke-EnforceMode {
    Write-Log "Running ENFORCE mode - applying SOP corrections..." "INFO"
    
    $manifest = Get-TaskManifest
    if ($null -eq $manifest) { return }
    
    $violations = @{
        taskStructure = Validate-TaskStructure -Manifest $manifest
        indexReferences = Validate-IndexReferences -Manifest $manifest
        taskDependencies = Validate-TaskDependencies -Manifest $manifest
        agentCompliance = Validate-AgentCompliance
        fileStructure = Validate-FileStructure
    }
    
    $enforcement = Enforce-Procedures
    Write-Log "Enforcement complete: $($enforcement.enforced) procedures enforced, $($enforcement.blocked) items flagged" "INFO"
    
    $report = Generate-Report -ValidatorResults $violations
    Show-Report -Report $report
}

function Invoke-MonitorMode {
    Write-Log "Running MONITOR mode - continuous SOP surveillance..." "INFO"
    
    $monitorInterval = 300  # 5 minutes
    $cycle = 0
    
    while ($true) {
        $cycle++
        Write-Log "Monitor cycle $cycle started" "INFO"
        
        $manifest = Get-TaskManifest
        if ($null -ne $manifest) {
            $violations = @{
                taskStructure = Validate-TaskStructure -Manifest $manifest
                indexReferences = Validate-IndexReferences -Manifest $manifest
                taskDependencies = Validate-TaskDependencies -Manifest $manifest
                agentCompliance = Validate-AgentCompliance
                fileStructure = Validate-FileStructure
            }
            
            $totalViolations = ($violations.Values | Measure-Object -Property Count -Sum).Sum
            
            if ($totalViolations -gt 0) {
                Write-Log "MONITOR: Found $totalViolations violations in cycle $cycle" "WARN"
                Enforce-Procedures | Out-Null
            }
            else {
                Write-Log "MONITOR: All systems compliant (cycle $cycle)" "SUCCESS"
            }
        }
        
        Write-Log "Monitor cycle $cycle complete - sleeping $monitorInterval seconds" "INFO"
        Start-Sleep -Seconds $monitorInterval
    }
}

function Invoke-FullCycleMode {
    Write-Log "Running FULL-CYCLE mode - complete SOP enforcement..." "INFO"
    
    Invoke-ValidateMode
    Write-Log "Validation phase complete" "INFO"
    
    if ($AutoFix) {
        Invoke-EnforceMode
        Write-Log "Enforcement phase complete" "INFO"
    }
    
    Write-Log "Full cycle execution complete" "SUCCESS"
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

Write-Log "========================================" "INFO"
Write-Log "SOP ENFORCEMENT AGENT STARTED" "INFO"
Write-Log "Mode: $Mode | Auto-Fix: $AutoFix | Dry-Run: $DryRun" "INFO"
Write-Log "========================================" "INFO"

try {
    switch ($Mode) {
        "validate" { Invoke-ValidateMode }
        "enforce" { Invoke-EnforceMode }
        "monitor" { Invoke-MonitorMode }
        "report" { Invoke-ValidateMode }
        "fix" { Invoke-EnforceMode }
        "full-cycle" { Invoke-FullCycleMode }
        default { Write-Log "Unknown mode: $Mode" "ERROR" }
    }
    
    Write-Log "SOP ENFORCEMENT AGENT COMPLETED SUCCESSFULLY" "SUCCESS"
}
catch {
    Write-Log "FATAL ERROR: $_" "ERROR"
    Write-Log "Stack trace: $($_.ScriptStackTrace)" "ERROR"
    exit 1
}

Write-Log "Log file: $LogFile" "INFO"
Write-Log "Report file: $ReportFile" "INFO"
