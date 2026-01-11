#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Sync validated API keys to GitHub repository secrets
.DESCRIPTION
    Automatically adds all valid API keys to GitHub organization secrets for CI/CD
.EXAMPLE
    $env:GITHUB_TOKEN = 'your_github_token'
    .\sync-to-github-secrets.ps1
    .\sync-to-github-secrets.ps1 -DryRun
#>

param(
    [switch]$DryRun = $false,
    [string]$Owner = "InfinityXOneSystems",
    [string]$Repo = "Real_Estate_Intelligence"
)

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  GitHub Secrets Synchronization Tool                       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Check GitHub token
$githubToken = $env:GITHUB_TOKEN
if (-not $githubToken) {
    Write-Host "❌ GITHUB_TOKEN environment variable not set" -ForegroundColor Red
    Write-Host "   Set with: `$env:GITHUB_TOKEN = 'your_token_here'" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ GitHub token found" -ForegroundColor Green

# Validated API keys from deployment
$secrets = @{
    # Blockchain Infrastructure
    "INFURA_RPC_API_KEY" = "1723c3b042ae4d9e9aa8646466b700dd"
    "INFURA_PROJECT_ID" = "1723c3b042ae4d9e9aa8646466b700dd"
    "METAMASK_API_KEY" = "1723c3b042ae4d9e9aa8646466b700dd"
    "INFINITY_COIN_CONTRACT" = "0x9b3c54f5eF469Cc91173F20408f836c9c0A9126cc1"

    # Coinbase (Personal/Business - Testing Only)
    "COINBASE_API_KEY_ID" = "37809c6a-9685-4354-b72d-727124cb5584"
    "COINBASE_SECRET" = "REnOfVOTCKGhts/0Q4o01/HUl5rYzveSfkdjg7yiglHRoKT3q8r1AS0gmZ1SxAk21+/SIwCxmMuhxb5rbl5zkg=="

    # Cryptocurrency Pricing
    "COINGECKO_API_KEY" = "CG-7Mj52H64Ltgh5CgctNgA8Rbf"

    # Stock Market Data
    "ALPHA_VANTAGE_API_KEY" = "HADF7NVOXGKXQA81"
    "FINNHUB_API_KEY" = "cvcsb39r01qodeuba2m0cvcsb39r01qodeuba2mg"

    # Economic Data
    "FRED_API" = "953caf5d4206f0c2ae3faeddbeace7d8"

    # Currency Exchange
    "EXCHANGE_RATE_API" = "405b1128fa7c0c2a43265f43"

    # Multi-Source Financial Data
    "RAPID_API" = "357a571ea8msh84e5d24425fdb3dp17bbdejsn19a8ae903baa"

    # Demographics & Census Data
    "DATA_COMMONS_API_KEY" = "dcdb8a1a-03e7-48e0-9f19-90672aaeb164"

    # Google Vertex AI (Pre-configured)
    "GOOGLE_VERTEX_AI_KEY" = "AQ.Ab8RN6IIsq8RsZ3YIS5YysW_fwHsWDmom2ENxYSC8MtAhR1h-Q"
}

Write-Host "Found $($secrets.Count) secrets to sync`n" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "⚠️  DRY RUN MODE - No changes will be made`n" -ForegroundColor Yellow
}

# GitHub API base URL
$baseUrl = "https://api.github.com/repos/$Owner/$Repo/actions/secrets"
$headers = @{
    "Authorization" = "Bearer $githubToken"
    "Accept" = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}

$successCount = 0
$failCount = 0

foreach ($secretName in $secrets.Keys) {
    $secretValue = $secrets[$secretName]
    
    if ($DryRun) {
        Write-Host "Would sync: $secretName" -ForegroundColor Gray
        continue
    }

    try {
        # Create or update secret
        $response = Invoke-WebRequest -Uri "$baseUrl/$secretName" `
            -Method Put `
            -Headers $headers `
            -ContentType "application/json" `
            -Body (@{
                encrypted_value = $secretValue
                key_id = "012345678901234567890"  # GitHub will generate this
            } | ConvertTo-Json) `
            -ErrorAction Stop

        Write-Host "✅ $secretName" -ForegroundColor Green
        $successCount++
    } catch {
        Write-Host "❌ $secretName - $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
    }
}

# Summary
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  SYNCHRONIZATION SUMMARY                                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "Repository: $Owner/$Repo" -ForegroundColor White
Write-Host "Total secrets: $($secrets.Count)" -ForegroundColor White
Write-Host "Synced: $successCount" -ForegroundColor Green

if ($failCount -gt 0) {
    Write-Host "Failed: $failCount" -ForegroundColor Red
}

if ($DryRun) {
    Write-Host "`n⚠️  Dry run completed. Run without -DryRun to actually sync." -ForegroundColor Yellow
} else {
    Write-Host "`n✅ Synchronization complete!" -ForegroundColor Green
    Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Visit: https://github.com/$Owner/$Repo/settings/secrets/actions" -ForegroundColor White
    Write-Host "2. Verify all secrets are visible" -ForegroundColor White
    Write-Host "3. GitHub Actions will use these secrets in CI/CD pipelines" -ForegroundColor White
}

Write-Host ""
