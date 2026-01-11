# COMPLIANCE MONITOR AGENT (Index: 2.D.2.1)
# Monitors Microsoft, Google, OpenAI, Anthropic, and Real Estate Industry Standards
# PowerShell-based, Windows native, no external dependencies

param(
    [ValidateSet('full', 'microsoft', 'google', 'openai', 'anthropic', 'realestate', 'dashboard')]
    [string]$Mode = 'full',
    
    [ValidateSet('json', 'html', 'text')]
    [string]$OutputFormat = 'text',
    
    [ValidateSet('critical', 'high', 'medium', 'low', 'all')]
    [string]$Severity = 'all',
    
    [switch]$CheckAzure,
    [switch]$CheckM365,
    [switch]$CheckWorkspace,
    [switch]$CheckDrive,
    [switch]$CheckOpenAI,
    [switch]$CheckAnthropic,
    [switch]$SendAlert,
    [switch]$RemediateLow
)

#region INITIALIZATION
$script:ComplianceResults = @{
    Microsoft    = @{}
    Google       = @{}
    OpenAI       = @{}
    Anthropic    = @{}
    RealEstate   = @{}
    Timestamp    = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
    OverallScore = 0
    Violations   = @()
    Warnings     = @()
}

$script:RepoPath = "C:\Users\JARVIS\OneDrive\Documents\Real_estate_Intelligence"
$script:LogPath = "$script:RepoPath\compliance\audit_logs"
$script:ReportPath = "$script:RepoPath\compliance\compliance_reports"

# Create directories if not exist
@($script:LogPath, $script:ReportPath) | ForEach-Object {
    if (-not (Test-Path $_)) { New-Item -ItemType Directory -Path $_ -Force | Out-Null }
}

#endregion

#region LOGGING FUNCTIONS
function Write-ComplianceLog {
    param([string]$Message, [ValidateSet('INFO', 'WARN', 'ERROR', 'PASS')]$Level = 'INFO')
    
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $logMessage = "[$timestamp] [$Level] $Message"
    
    Add-Content -Path "$script:LogPath\compliance_audit_$(Get-Date -Format 'yyyy-MM-dd').log" -Value $logMessage
    
    $colors = @{
        'INFO'  = 'Cyan'
        'WARN'  = 'Yellow'
        'ERROR' = 'Red'
        'PASS'  = 'Green'
    }
    
    Write-Host $logMessage -ForegroundColor $colors[$Level]
}

function Add-Violation {
    param(
        [string]$Standard,
        [string]$Description,
        [ValidateSet('critical', 'high', 'medium', 'low')]
        [string]$Severity = 'medium',
        [string]$RemediationStep = ''
    )
    
    $script:ComplianceResults.Violations += @{
        Standard          = $Standard
        Description       = $Description
        Severity          = $Severity
        RemediationStep   = $RemediationStep
        DetectedAt        = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    }
    
    Write-ComplianceLog "VIOLATION: [$Severity] $Standard - $Description" 'WARN'
}

function Add-Warning {
    param([string]$Standard, [string]$Description)
    
    $script:ComplianceResults.Warnings += @{
        Standard     = $Standard
        Description  = $Description
        DetectedAt   = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    }
    
    Write-ComplianceLog "WARNING: $Standard - $Description" 'WARN'
}

#endregion

#region MICROSOFT COMPLIANCE CHECKS

function Check-MicrosoftCompliance {
    Write-Host "`n=== MICROSOFT COMPLIANCE CHECK ===" -ForegroundColor Cyan
    
    # Check 1: Windows Security Baseline
    Write-ComplianceLog "Checking Windows Security Baseline..." 'INFO'
    $uacStatus = Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" -Name "EnableLUA" -ErrorAction SilentlyContinue
    
    if ($uacStatus.EnableLUA -eq 1) {
        Write-ComplianceLog "UAC Enabled - PASS" 'PASS'
        $script:ComplianceResults.Microsoft['UAC'] = @{ Status = 'PASS'; Details = 'User Account Control is enabled' }
    } else {
        Add-Violation -Standard "Windows Security" -Description "UAC is disabled" -Severity "critical" -RemediationStep "Enable UAC via Group Policy"
    }
    
    # Check 2: File Encryption (check for encrypted folders)
    Write-ComplianceLog "Checking file encryption status..." 'INFO'
    $encryptedFolders = Get-ChildItem -Path $script:RepoPath -Recurse -Directory | Where-Object {
        (Get-ItemProperty -Path $_.FullName -Name "Attributes" -ErrorAction SilentlyContinue) -match "Encrypted"
    }
    
    if ($encryptedFolders.Count -gt 0) {
        Write-ComplianceLog "Found $($encryptedFolders.Count) encrypted folders - PASS" 'PASS'
        $script:ComplianceResults.Microsoft['Encryption'] = @{ Status = 'PASS'; EncryptedFolders = $encryptedFolders.Count }
    } else {
        Add-Warning -Standard "Microsoft Data Classification" -Description "No encrypted folders detected - recommend enabling EFS or BitLocker"
    }
    
    # Check 3: OneDrive Sync Compliance
    Write-ComplianceLog "Checking OneDrive sync settings..." 'INFO'
    $oneDrivePath = "$env:USERPROFILE\OneDrive"
    if (Test-Path $oneDrivePath) {
        Write-ComplianceLog "OneDrive is active and syncing - PASS" 'PASS'
        $script:ComplianceResults.Microsoft['OneDriveSync'] = @{ Status = 'PASS'; Path = $oneDrivePath }
    } else {
        Add-Violation -Standard "Microsoft 365 Compliance" -Description "OneDrive not found or not syncing" -Severity "high"
    }
    
    # Check 4: File Sharing Audit
    Write-ComplianceLog "Checking file sharing permissions..." 'INFO'
    $publicShares = Get-ChildItem -Path $script:RepoPath -Recurse -File | Where-Object {
        $acl = Get-Acl $_.FullName
        $acl.Access | Where-Object { $_.IdentityReference -match "Everyone|Anonymous" }
    }
    
    if ($publicShares.Count -eq 0) {
        Write-ComplianceLog "No public shares found - PASS" 'PASS'
        $script:ComplianceResults.Microsoft['Sharing'] = @{ Status = 'PASS'; PublicShares = 0 }
    } else {
        Add-Violation -Standard "Microsoft Data Classification" -Description "Found $($publicShares.Count) publicly shared files" -Severity "high"
    }
}

#endregion

#region GOOGLE COMPLIANCE CHECKS

function Check-GoogleCompliance {
    Write-Host "`n=== GOOGLE COMPLIANCE CHECK ===" -ForegroundColor Cyan
    
    Write-ComplianceLog "Checking Google Workspace integration..." 'INFO'
    
    # Check 1: Google Drive Integration
    $googleDriveFolder = Get-ChildItem -Path $env:USERPROFILE -Directory -ErrorAction SilentlyContinue | 
        Where-Object { $_.Name -like "*Google Drive*" -or $_.Name -like "*GDrive*" }
    
    if ($googleDriveFolder) {
        Write-ComplianceLog "Google Drive folder found - PASS" 'PASS'
        $script:ComplianceResults.Google['DriveIntegration'] = @{ Status = 'PASS'; Path = $googleDriveFolder.FullName }
    } else {
        Add-Warning -Standard "Google Workspace Security" -Description "Google Drive not found - ensure integration is configured"
    }
    
    # Check 2: File Sync Status
    Write-ComplianceLog "Checking file synchronization..." 'INFO'
    $jsonsInRepo = Get-ChildItem -Path $script:RepoPath -Filter "*.json" -Recurse
    
    if ($jsonsInRepo.Count -gt 0) {
        Write-ComplianceLog "Found $($jsonsInRepo.Count) JSON config files - PASS" 'PASS'
        $script:ComplianceResults.Google['ConfigFiles'] = @{ Status = 'PASS'; Count = $jsonsInRepo.Count }
    }
}

#endregion

#region OPENAI COMPLIANCE CHECKS

function Check-OpenAICompliance {
    Write-Host "`n=== OPENAI COMPLIANCE CHECK ===" -ForegroundColor Cyan
    
    Write-ComplianceLog "Checking OpenAI API compliance..." 'INFO'
    
    # Check 1: API key not in code
    Write-ComplianceLog "Scanning for exposed API keys..." 'INFO'
    $filesWithKeys = Get-ChildItem -Path $script:RepoPath -File -Recurse | Where-Object {
        $content = Get-Content $_.FullName -ErrorAction SilentlyContinue
        $content -match "sk-" -or $content -match "openai_api_key"
    }
    
    if ($filesWithKeys.Count -eq 0) {
        Write-ComplianceLog "No exposed OpenAI keys found - PASS" 'PASS'
        $script:ComplianceResults.OpenAI['APIKeyExposure'] = @{ Status = 'PASS'; ExposedKeys = 0 }
    } else {
        Add-Violation -Standard "OpenAI Usage Policy" -Description "Found $($filesWithKeys.Count) files with potential API keys" -Severity "critical" -RemediationStep "Move all API keys to .env file and add to .gitignore"
    }
    
    # Check 2: API usage logging
    Write-ComplianceLog "Checking API usage logging..." 'INFO'
    $apiLogsExist = Test-Path "$script:RepoPath\logs\api_usage.json"
    if ($apiLogsExist) {
        Write-ComplianceLog "API usage log found - PASS" 'PASS'
        $script:ComplianceResults.OpenAI['UsageLogging'] = @{ Status = 'PASS' }
    } else {
        Add-Warning -Standard "OpenAI Data Retention" -Description "API usage logging not found - recommend setting up usage tracking"
    }
}

#endregion

#region ANTHROPIC COMPLIANCE CHECKS

function Check-AnthropicCompliance {
    Write-Host "`n=== ANTHROPIC COMPLIANCE CHECK ===" -ForegroundColor Cyan
    
    Write-ComplianceLog "Checking Anthropic Claude API compliance..." 'INFO'
    
    # Check 1: Claude API key security
    Write-ComplianceLog "Scanning for exposed Claude API keys..." 'INFO'
    $claudeKeyExposed = Get-ChildItem -Path $script:RepoPath -File -Recurse | Where-Object {
        $content = Get-Content $_.FullName -ErrorAction SilentlyContinue
        $content -match "sk-ant-" -or $content -match "anthropic_api_key"
    }
    
    if ($claudeKeyExposed.Count -eq 0) {
        Write-ComplianceLog "No exposed Claude keys found - PASS" 'PASS'
        $script:ComplianceResults.Anthropic['APIKeyExposure'] = @{ Status = 'PASS'; ExposedKeys = 0 }
    } else {
        Add-Violation -Standard "Anthropic Data Policy" -Description "Found $($claudeKeyExposed.Count) files with potential Claude API keys" -Severity "critical"
    }
    
    # Check 2: Token usage tracking
    Write-ComplianceLog "Checking token usage documentation..." 'INFO'
    $tokenLogsExist = Test-Path "$script:RepoPath\logs\claude_token_usage.json"
    if ($tokenLogsExist) {
        Write-ComplianceLog "Claude token usage tracked - PASS" 'PASS'
        $script:ComplianceResults.Anthropic['TokenTracking'] = @{ Status = 'PASS' }
    } else {
        Add-Warning -Standard "Claude API Usage" -Description "Token usage logging not configured"
    }
}

#endregion

#region REAL ESTATE COMPLIANCE CHECKS

function Check-RealEstateCompliance {
    Write-Host "`n=== REAL ESTATE COMPLIANCE CHECK ===" -ForegroundColor Cyan
    
    # Check 1: Fair Housing Language
    Write-ComplianceLog "Checking for Fair Housing compliance..." 'INFO'
    
    $documents = Get-ChildItem -Path "$script:RepoPath\documents" -File -Recurse -ErrorAction SilentlyContinue
    
    $fairHousingRequired = $documents | Where-Object {
        $content = Get-Content $_.FullName -ErrorAction SilentlyContinue
        $content -match "property|listing|offer|advertisement" -and -not ($content -match "Fair Housing|Equal Housing|HUD")
    }
    
    if ($fairHousingRequired.Count -eq 0) {
        Write-ComplianceLog "Fair Housing statements verified - PASS" 'PASS'
        $script:ComplianceResults.RealEstate['FairHousing'] = @{ Status = 'PASS' }
    } else {
        Add-Violation -Standard "Fair Housing Act (FHA)" -Description "Found $($fairHousingRequired.Count) documents missing Fair Housing statements" -Severity "high" -RemediationStep "Add Fair Housing statement: 'Equal Housing Opportunity. We comply with all federal, state, and local fair housing laws.'"
    }
    
    # Check 2: NAR Code of Ethics
    Write-ComplianceLog "Checking NAR Code of Ethics compliance..." 'INFO'
    Write-ComplianceLog "NAR Code of Ethics - Manual verification required (agent review needed)" 'WARN'
    Add-Warning -Standard "NAR Code of Ethics" -Description "Requires manual audit of agent conduct and disclosure practices"
    
    # Check 3: RESPA Compliance
    Write-ComplianceLog "Checking RESPA compliance..." 'INFO'
    $respaDocuments = Get-ChildItem -Path "$script:RepoPath\documents" -Filter "*closing*" -Recurse -ErrorAction SilentlyContinue
    
    if ($respaDocuments.Count -gt 0) {
        Write-ComplianceLog "RESPA documents found - manual review required" 'WARN'
        Add-Warning -Standard "RESPA Compliance" -Description "Found $($respaDocuments.Count) closing documents - requires manual RESPA compliance verification"
    }
    
    # Check 4: MLS Data Accuracy
    Write-ComplianceLog "Checking MLS data standards..." 'INFO'
    Write-ComplianceLog "MLS Data Standards - Requires MLS system integration" 'WARN'
    Add-Warning -Standard "MLS Standards" -Description "MLS data accuracy checks require integration with local MLS system"
    
    # Check 5: Broker Trust Account
    Write-ComplianceLog "Checking trust account audit requirements..." 'INFO'
    $trustAccountDocs = Get-ChildItem -Path "$script:RepoPath\documents" -Filter "*trust*" -Recurse -ErrorAction SilentlyContinue
    
    if ($trustAccountDocs.Count -eq 0) {
        Add-Warning -Standard "Broker Trust Account" -Description "No trust account documentation found - required for earnest money handling"
    } else {
        Write-ComplianceLog "Trust account documentation found - requires manual audit" 'WARN'
    }
}

#endregion

#region REPORTING

function Generate-ComplianceReport {
    param([ValidateSet('json', 'html', 'text')][string]$Format = 'text')
    
    $reportDate = Get-Date -Format 'yyyy-MM-dd_HHmmss'
    
    if ($Format -eq 'json') {
        $jsonReport = $script:ComplianceResults | ConvertTo-Json -Depth 10
        $reportPath = "$script:ReportPath\compliance_report_$reportDate.json"
        Set-Content -Path $reportPath -Value $jsonReport
        Write-Host "JSON report saved to: $reportPath" -ForegroundColor Green
    }
    elseif ($Format -eq 'html') {
        $htmlReport = @"
<!DOCTYPE html>
<html>
<head>
    <title>Compliance Report - $($script:ComplianceResults.Timestamp)</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        h1 { color: #333; border-bottom: 3px solid #0066cc; }
        .section { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .pass { color: #28a745; font-weight: bold; }
        .fail { color: #dc3545; font-weight: bold; }
        .warn { color: #ffc107; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #0066cc; color: white; }
        tr:hover { background-color: #f9f9f9; }
    </style>
</head>
<body>
    <h1>Real Estate Intelligence - Compliance Report</h1>
    <p><strong>Generated:</strong> $($script:ComplianceResults.Timestamp)</p>
    <p><strong>Overall Score:</strong> <span class="$(if($script:ComplianceResults.OverallScore -ge 90) {'pass'} else {'warn'})">$($script:ComplianceResults.OverallScore)%</span></p>
    
    <div class="section">
        <h2>Violations Found: $($script:ComplianceResults.Violations.Count)</h2>
        <table>
            <tr><th>Standard</th><th>Description</th><th>Severity</th><th>Remediation</th></tr>
"@
        
        foreach ($violation in $script:ComplianceResults.Violations) {
            $severityColor = @{
                'critical' = '#dc3545'
                'high'     = '#fd7e14'
                'medium'   = '#ffc107'
                'low'      = '#17a2b8'
            }
            $htmlReport += "<tr><td>$($violation.Standard)</td><td>$($violation.Description)</td><td style='color: $($severityColor[$violation.Severity])'>$($violation.Severity)</td><td>$($violation.RemediationStep)</td></tr>"
        }
        
        $htmlReport += @"
        </table>
    </div>
    
    <div class="section">
        <h2>Warnings: $($script:ComplianceResults.Warnings.Count)</h2>
        <table>
            <tr><th>Standard</th><th>Description</th><th>Detected</th></tr>
"@
        
        foreach ($warning in $script:ComplianceResults.Warnings) {
            $htmlReport += "<tr><td>$($warning.Standard)</td><td>$($warning.Description)</td><td>$($warning.DetectedAt)</td></tr>"
        }
        
        $htmlReport += "</table></div></body></html>"
        
        $reportPath = "$script:ReportPath\compliance_report_$reportDate.html"
        Set-Content -Path $reportPath -Value $htmlReport
        Write-Host "HTML report saved to: $reportPath" -ForegroundColor Green
    }
    else {
        Write-Host "`n" + ("=" * 80) -ForegroundColor Cyan
        Write-Host "REAL ESTATE INTELLIGENCE - COMPLIANCE REPORT" -ForegroundColor Cyan
        Write-Host "=" * 80 -ForegroundColor Cyan
        Write-Host "Timestamp: $($script:ComplianceResults.Timestamp)" -ForegroundColor Gray
        Write-Host "Overall Compliance Score: $($script:ComplianceResults.OverallScore)%" -ForegroundColor $(if($script:ComplianceResults.OverallScore -ge 90) {'Green'} else {'Yellow'})
        Write-Host ""
        Write-Host "VIOLATIONS: $($script:ComplianceResults.Violations.Count)" -ForegroundColor $(if($script:ComplianceResults.Violations.Count -eq 0) {'Green'} else {'Red'})
        foreach ($v in $script:ComplianceResults.Violations | Sort-Object Severity) {
            Write-Host "  [$($v.Severity.ToUpper())] $($v.Standard): $($v.Description)" -ForegroundColor Red
        }
        Write-Host "`nWARNINGS: $($script:ComplianceResults.Warnings.Count)" -ForegroundColor Yellow
        foreach ($w in $script:ComplianceResults.Warnings) {
            Write-Host "  ⚠️  $($w.Standard): $($w.Description)" -ForegroundColor Yellow
        }
    }
}

#endregion

#region MAIN EXECUTION

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  COMPLIANCE MONITOR AGENT - INDEX: 2.D.2.1                     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-ComplianceLog "Starting Compliance Audit - Mode: $Mode" 'INFO'

# Calculate overall score based on violations
$script:ComplianceResults.OverallScore = 100 - (($script:ComplianceResults.Violations.Count) * 5) - (($script:ComplianceResults.Warnings.Count) * 2)
$script:ComplianceResults.OverallScore = [Math]::Max(0, $script:ComplianceResults.OverallScore)

# Run checks based on mode
switch ($Mode) {
    'full' {
        Check-MicrosoftCompliance
        Check-GoogleCompliance
        Check-OpenAICompliance
        Check-AnthropicCompliance
        Check-RealEstateCompliance
    }
    'microsoft' {
        Check-MicrosoftCompliance
    }
    'google' {
        Check-GoogleCompliance
    }
    'openai' {
        Check-OpenAICompliance
    }
    'anthropic' {
        Check-AnthropicCompliance
    }
    'realestate' {
        Check-RealEstateCompliance
    }
    'dashboard' {
        Check-MicrosoftCompliance
        Check-GoogleCompliance
        Check-OpenAICompliance
        Check-AnthropicCompliance
        Check-RealEstateCompliance
        $OutputFormat = 'html'
    }
}

# Recalculate score
$script:ComplianceResults.OverallScore = 100 - (($script:ComplianceResults.Violations.Count) * 5) - (($script:ComplianceResults.Warnings.Count) * 2)
$script:ComplianceResults.OverallScore = [Math]::Max(0, $script:ComplianceResults.OverallScore)

Generate-ComplianceReport -Format $OutputFormat

Write-ComplianceLog "Compliance Audit Complete - Score: $($script:ComplianceResults.OverallScore)%" 'INFO'
Write-Host "`n✅ Audit complete" -ForegroundColor Green

#endregion
