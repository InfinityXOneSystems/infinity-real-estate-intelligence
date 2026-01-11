# AUTO-VALIDATE-TAG-PUSH AGENT POWERSHELL WRAPPER
# Index: 4.A.1 → 4.B.1 → 4.C.2
# 
# Usage: .\invoke_auto_validate_push.ps1
# 
# See SYSTEM_MANIFEST.md (6.C.1.1) for mandatory requirements

param(
    [string]$RepoPath = (Get-Location),
    [string]$BumpType = "patch",  # patch, minor, or major
    [switch]$DryRun = $false
)

# Color output
function Write-Header {
    param([string]$Message)
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host $Message -ForegroundColor Cyan -BackgroundColor Black
    Write-Host "=" * 60 -ForegroundColor Cyan
}

function Write-Stage {
    param([string]$Index, [string]$Message)
    Write-Host "[$Index] $Message" -ForegroundColor Yellow
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Set repository path
Set-Location $RepoPath
$env:REPO_PATH = $RepoPath

Write-Header "AUTO-VALIDATE-TAG-PUSH AGENT (Index: 4.A.1 → 4.B.1 → 4.C.2)"
Write-Host "Repository: $RepoPath" -ForegroundColor Gray
Write-Host "Bump Type: $BumpType" -ForegroundColor Gray
if ($DryRun) { Write-Host "MODE: DRY RUN (No actual commits)" -ForegroundColor Yellow }
Write-Host ""

# STAGE 1: CODE VALIDATION (4.A.1)
Write-Stage "4.A.1" "Running Code Validator..."

# Check if Python is available
try {
    $PythonVersion = python --version 2>&1
    Write-Host "Using: $PythonVersion" -ForegroundColor Gray
} catch {
    Write-Error-Custom "Python not found. Install Python 3.9+ and try again."
    exit 1
}

# Run Python validation agent
try {
    if ($DryRun) {
        python auto_validate_tag_push_agent.py
    } else {
        python auto_validate_tag_push_agent.py
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Validation failed (exit code: $LASTEXITCODE)"
        exit 1
    }
    
    Write-Success "Code validation passed"
} catch {
    Write-Error-Custom "Validation error: $_"
    exit 1
}

# STAGE 2: GIT OPERATIONS (4.B.1) - Only if not dry run
if (-not $DryRun) {
    Write-Host ""
    Write-Stage "4.B.1" "Running Git Pusher..."
    
    # Check git configuration
    Write-Host "[4.B.1.0] Checking git configuration..." -ForegroundColor Gray
    $gitUser = git config --global user.name 2>$null
    $gitEmail = git config --global user.email 2>$null
    
    if (-not $gitUser -or -not $gitEmail) {
        Write-Error-Custom "Git configuration incomplete. Please run:"
        Write-Host "git config --global user.name 'Your Name'" -ForegroundColor Yellow
        Write-Host "git config --global user.email 'your.email@example.com'" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "Git user: $gitUser <$gitEmail>" -ForegroundColor Gray
    
    # Stage changes
    Write-Stage "4.B.1.1" "Staging changes..."
    git add -A
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Failed to stage changes"
        exit 1
    }
    Write-Success "Changes staged"
    
    # Get current version
    $CurrentVersion = git describe --tags --abbrev=0 2>$null
    if ($LASTEXITCODE -ne 0) {
        $CurrentVersion = "0.0.0"
    }
    Write-Host "Current version: $CurrentVersion" -ForegroundColor Gray
    
    # Create commit
    Write-Stage "4.B.1.2" "Creating commit..."
    $FileCount = (git status --porcelain | Measure-Object).Count
    $CommitMsg = "✅ Validated files - Pipeline 4.A.1 → 4.B.1 → 4.C.2 complete"
    
    git commit -m $CommitMsg
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Commit created"
    } else {
        Write-Host "No changes to commit" -ForegroundColor Yellow
    }
    
    # Create tag
    Write-Stage "4.B.1.2" "Creating semantic version tag..."
    $NewVersion = Get-NewVersion -Current $CurrentVersion -Bump $BumpType
    Write-Host "New version: $NewVersion" -ForegroundColor Gray
    
    git tag -a $NewVersion -m "Release $NewVersion (Pipeline: 4.A.1 → 4.B.1 → 4.C.2)"
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Tag created: $NewVersion"
    } else {
        Write-Error-Custom "Failed to create tag"
        exit 1
    }
    
    # Push to remote
    Write-Stage "4.B.1.3" "Pushing to origin/main..."
    git push origin main 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Failed to push commits"
        exit 1
    }
    
    git push origin --tags 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Failed to push tags"
        exit 1
    }
    
    Write-Success "Pushed to origin/main with tag $NewVersion"
    
    # STAGE 3: INDEX SYNC (4.C.2)
    Write-Host ""
    Write-Stage "4.C.2" "Running Document Evolution..."
    Write-Host "[4.C.2.1] Detecting changes..." -ForegroundColor Gray
    
    $Changes = git diff --stat HEAD~1..HEAD 2>$null
    Write-Host $Changes -ForegroundColor Gray
    
    Write-Stage "4.C.2.2" "Updating ENTERPRISE_INDEX.md..."
    if (Test-Path "ENTERPRISE_INDEX.md") {
        $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss UTC"
        Add-Content -Path "ENTERPRISE_INDEX.md" -Value @"
        
### Validation Entry: $Timestamp
- **Version:** $NewVersion
- **Status:** VALIDATED (4.A.1 → 4.B.1 → 4.C.2)
- **Agent Pipeline:** Code Validator → Git Pusher → Document Evolution
"@
        Write-Success "Index updated"
    }
    
    Write-Stage "4.C.2.3" "Cloud sync ready (Google Drive API integration)"
    
} else {
    Write-Host ""
    Write-Host "DRY RUN COMPLETE - No commits or pushes were made" -ForegroundColor Yellow
}

Write-Host ""
Write-Header "✅ PIPELINE COMPLETE"
Write-Host "All stages executed successfully!" -ForegroundColor Green
Write-Host ""

# Helper function for semantic versioning
function Get-NewVersion {
    param(
        [string]$Current,
        [string]$Bump
    )
    
    if ($Current -eq "0.0.0" -or -not $Current) {
        return "v0.0.1"
    }
    
    $Version = $Current -replace '^v', ''
    $Parts = $Version -split '\.'
    
    if ($Parts.Count -lt 3) {
        return "v0.0.1"
    }
    
    $Major = [int]$Parts[0]
    $Minor = [int]$Parts[1]
    $Patch = [int]$Parts[2]
    
    switch ($Bump) {
        "major" { $Major++; $Minor = 0; $Patch = 0 }
        "minor" { $Minor++; $Patch = 0 }
        default { $Patch++ }
    }
    
    return "v$Major.$Minor.$Patch"
}

exit 0
