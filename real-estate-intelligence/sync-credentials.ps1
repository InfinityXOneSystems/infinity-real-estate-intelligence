# ============================================================================
# Real Estate Intelligence - Credential Synchronization Script
# Syncs GCP credentials and API keys from foundation repo to Real Estate Intelligence
# ============================================================================

param(
    [Parameter(Mandatory=$false)]
    [string]$FoundationPath = "$env:OneDrive\Documents\foundation",
    
    [Parameter(Mandatory=$false)]
    [string]$RealEstatePath = "$env:OneDrive\Documents\Real_estate_Intelligence",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("local-env", "github-secrets", "both")]
    [string]$SyncTarget = "local-env"
)

# ============================================================================
# CONFIGURATION
# ============================================================================

$ErrorActionPreference = "Stop"
$InformationPreference = "Continue"
$WarningPreference = "Continue"

$SCRIPT_NAME = "Credential Sync"
$LOG_FILE = Join-Path $RealEstatePath "logs\credential-sync-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
$GITHUB_OWNER = "InfinityXOneSystems"
$GITHUB_REPO = "real_estate_intelligence"
$EXCLUDED_KEYS = @("STRIPE_SECRET_KEY", "JWT_SECRET", "SESSION_SECRET", "DB_PASSWORD", "REDIS_PASSWORD")

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

function Write-Log {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter(Mandatory=$false)]
        [ValidateSet("Info", "Warning", "Error", "Success")]
        [string]$Level = "Info"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    
    Add-Content -Path $LOG_FILE -Value $logMessage
    
    switch ($Level) {
        "Info"    { Write-Information $logMessage }
        "Warning" { Write-Warning $logMessage }
        "Error"   { Write-Error $logMessage }
        "Success" { Write-Host $logMessage -ForegroundColor Green }
    }
}

function Test-PathExists {
    param([string]$Path)
    
    if (-not (Test-Path $Path)) {
        Write-Log "Path not found: $Path" "Error"
        return $false
    }
    return $true
}

function Get-EnvVariables {
    param([string]$EnvFilePath)
    
    if (-not (Test-Path $EnvFilePath)) {
        Write-Log "Env file not found: $EnvFilePath" "Warning"
        return @{}
    }
    
    $envVars = @{}
    $content = Get-Content $EnvFilePath -Raw
    
    $content -split "`n" | ForEach-Object {
        if ($_ -match '^\s*([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            
            if ($key -and -not $key.StartsWith("#")) {
                $envVars[$key] = $value
            }
        }
    }
    
    return $envVars
}

function Save-EnvVariables {
    param(
        [hashtable]$Variables,
        [string]$FilePath
    )
    
    $envContent = ""
    
    foreach ($key in ($Variables.Keys | Sort-Object)) {
        $value = $Variables[$key]
        
        # Skip if value is empty or contains placeholder
        if ([string]::IsNullOrEmpty($value) -or $value -like "*YOUR_*" -or $value -like "*placeholder*") {
            continue
        }
        
        $envContent += "$key=$value`n"
    }
    
    Set-Content -Path $FilePath -Value $envContent -Encoding UTF8
    Write-Log "Environment variables saved to $FilePath" "Success"
}

function Load-GCPServiceAccount {
    param([string]$Path)
    
    $keyPath = Join-Path $Path "secrets\gcp-service-account.json"
    
    if (-not (Test-Path $keyPath)) {
        Write-Log "GCP service account key not found: $keyPath" "Warning"
        return @{}
    }
    
    try {
        $keyContent = Get-Content $keyPath | ConvertFrom-Json
        
        $credentials = @{
            "GCP_PROJECT_ID" = $keyContent.project_id
            "GCP_SERVICE_ACCOUNT_EMAIL" = $keyContent.client_email
            "GCP_PRIVATE_KEY" = $keyContent.private_key -replace '\n', '\n'
        }
        
        Write-Log "GCP service account loaded: $($keyContent.client_email)" "Success"
        return $credentials
    }
    catch {
        Write-Log "Failed to parse GCP service account: $_" "Error"
        return @{}
    }
}

function Sync-ToLocalEnv {
    param(
        [hashtable]$Credentials,
        [string]$DestinationPath
    )
    
    Write-Log "Starting local .env synchronization" "Info"
    
    # Ensure directory exists
    $envDir = Split-Path $DestinationPath
    if (-not (Test-Path $envDir)) {
        New-Item -ItemType Directory -Path $envDir -Force | Out-Null
    }
    
    # Load existing .env if it exists
    $mergedEnv = @{}
    if (Test-Path $DestinationPath) {
        $mergedEnv = Get-EnvVariables $DestinationPath
    }
    
    # Merge new credentials
    foreach ($key in $Credentials.Keys) {
        $mergedEnv[$key] = $Credentials[$key]
    }
    
    # Save merged environment
    Save-EnvVariables -Variables $mergedEnv -FilePath $DestinationPath
    
    Write-Log "Synced $(($Credentials | Measure-Object).Count) credentials to local .env" "Success"
    return $mergedEnv.Count
}

function Sync-ToGitHubSecrets {
    param(
        [hashtable]$Credentials
    )
    
    Write-Log "Starting GitHub Secrets synchronization" "Info"
    
    # Check if GitHub CLI is available
    try {
        $ghVersion = gh --version 2>$null
        if (-not $ghVersion) {
            Write-Log "GitHub CLI not available. Skipping GitHub Secrets sync." "Warning"
            return 0
        }
    }
    catch {
        Write-Log "GitHub CLI not found. Install it from https://cli.github.com/" "Warning"
        return 0
    }
    
    $syncCount = 0
    $failureCount = 0
    
    foreach ($key in $Credentials.Keys) {
        $value = $Credentials[$key]
        
        # Skip if value contains placeholder or is in excluded list
        if ($value -like "*YOUR_*" -or $value -like "*placeholder*" -or $EXCLUDED_KEYS -contains $key) {
            continue
        }
        
        try {
            # Escape double quotes in value
            $escapedValue = $value -replace '"', '\"'
            
            # Set GitHub Secret using GitHub CLI
            gh secret set $key --body $escapedValue --repo "$GITHUB_OWNER/$GITHUB_REPO" 2>$null
            
            Write-Log "GitHub Secret synced: $key" "Info"
            $syncCount++
        }
        catch {
            Write-Log "Failed to sync GitHub Secret $key : $_" "Warning"
            $failureCount++
        }
    }
    
    Write-Log "Synced $syncCount secrets to GitHub. Failures: $failureCount" "Success"
    return $syncCount
}

function Validate-Credentials {
    param([hashtable]$Credentials)
    
    Write-Log "Validating credentials" "Info"
    
    $validation = @{
        "GCP" = $false
        "Anthropic" = $false
        "Google" = $false
        "Stripe" = $false
    }
    
    # Validate GCP
    if ($Credentials["GCP_SERVICE_ACCOUNT_EMAIL"] -and $Credentials["GCP_PRIVATE_KEY"]) {
        if (-not ($Credentials["GCP_PRIVATE_KEY"] -like "*YOUR_*")) {
            $validation["GCP"] = $true
        }
    }
    
    # Validate Anthropic
    if ($Credentials["ANTHROPIC_API_KEY"] -and -not ($Credentials["ANTHROPIC_API_KEY"] -like "*YOUR_*")) {
        $validation["Anthropic"] = $true
    }
    
    # Validate Google
    if ($Credentials["GOOGLE_GEMINI_KEY"] -and -not ($Credentials["GOOGLE_GEMINI_KEY"] -like "*YOUR_*")) {
        $validation["Google"] = $true
    }
    
    # Validate Stripe
    if ($Credentials["STRIPE_SECRET_KEY"] -and -not ($Credentials["STRIPE_SECRET_KEY"] -like "*YOUR_*")) {
        $validation["Stripe"] = $true
    }
    
    Write-Log "Validation results: $(ConvertTo-Json $validation)" "Info"
    return $validation
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "$SCRIPT_NAME - Real Estate Intelligence Credential Synchronization" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Log "Script started" "Info"
Write-Log "Foundation Path: $FoundationPath" "Info"
Write-Log "Real Estate Path: $RealEstatePath" "Info"
Write-Log "Sync Target: $SyncTarget" "Info"

# Validate paths
if (-not (Test-PathExists $FoundationPath)) {
    Write-Log "Foundation path not accessible" "Error"
    exit 1
}

if (-not (Test-PathExists $RealEstatePath)) {
    Write-Log "Real Estate Intelligence path not accessible" "Error"
    exit 1
}

# Create logs directory
$logsDir = Join-Path $RealEstatePath "logs"
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
}

# Load credentials from all sources
$allCredentials = @{}

# Load from foundation .env
Write-Log "Loading credentials from foundation .env" "Info"
$foundationEnv = Join-Path $FoundationPath ".env"
$foundationEnvVars = Get-EnvVariables $foundationEnv
$allCredentials += $foundationEnvVars

# Load from foundation .env.local
Write-Log "Loading credentials from foundation .env.local" "Info"
$foundationEnvLocal = Join-Path $FoundationPath ".env.local"
$foundationEnvLocalVars = Get-EnvVariables $foundationEnvLocal
$allCredentials += $foundationEnvLocalVars

# Load GCP service account
Write-Log "Loading GCP service account credentials" "Info"
$gcpCredentials = Load-GCPServiceAccount $FoundationPath
$allCredentials += $gcpCredentials

Write-Log "Total credentials loaded: $(($allCredentials | Measure-Object).Count)" "Success"

# Sync to destinations
$totalSynced = 0

if ($SyncTarget -in @("local-env", "both")) {
    Write-Log "Syncing to local .env" "Info"
    $synced = Sync-ToLocalEnv -Credentials $allCredentials -DestinationPath (Join-Path $RealEstatePath ".env")
    $totalSynced += $synced
}

if ($SyncTarget -in @("github-secrets", "both")) {
    Write-Log "Syncing to GitHub Secrets" "Info"
    $synced = Sync-ToGitHubSecrets -Credentials $allCredentials
    $totalSynced += $synced
}

# Validate credentials
Write-Log "Validating synchronized credentials" "Info"
$validation = Validate-Credentials $allCredentials

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "SYNCHRONIZATION SUMMARY" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "Total Credentials Synced: $totalSynced" -ForegroundColor Yellow
Write-Host ""
Write-Host "Validation Status:" -ForegroundColor Yellow
foreach ($item in $validation.GetEnumerator()) {
    $status = if ($item.Value) { "✓ Valid" } else { "✗ Invalid" }
    $color = if ($item.Value) { "Green" } else { "Red" }
    Write-Host "  $($item.Key): $status" -ForegroundColor $color
}
Write-Host ""
Write-Host "Log file: $LOG_FILE" -ForegroundColor Gray
Write-Host ""

Write-Log "Script completed successfully" "Success"
