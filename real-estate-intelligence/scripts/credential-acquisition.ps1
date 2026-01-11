# ========================================
# CREDENTIAL ACQUISITION GUIDE
# ========================================
# This script guides you through obtaining optional API keys
# Run this AFTER you decide to add voice, email, or exchange APIs
# ========================================

param(
    [string]$ServiceType = "all",  # all, voice, email, exchange, wallet
    [switch]$OpenBrowsers = $false  # Auto-open credential pages
)

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

function Show-Header {
    param([string]$Title)
    Write-Host ""
    Write-ColorLine ("=" * 70) $colors.Section
    Write-ColorLine $Title $colors.Section
    Write-ColorLine ("=" * 70) $colors.Section
    Write-Host ""
}

# ========================================
# VOICE SYSTEM (ElevenLabs + Twilio)
# ========================================
function Show-VoiceSystem {
    Show-Header "VOICE SYSTEM SETUP (Optional)"
    
    Write-ColorLine "Purpose: Enable inbound/outbound property inquiry calls" $colors.Info
    Write-ColorLine "Effort: 20 minutes | Difficulty: Easy" $colors.Info
    Write-Host ""
    
    Write-Host "Step 1: ElevenLabs AI Voice (5 minutes)"
    Write-ColorLine "  1. Visit: https://elevenlabs.io/app/subscription" $colors.Success
    Write-ColorLine "  2. Sign up (free plan available)" $colors.Success
    Write-ColorLine "  3. Go to: Settings > API Keys" $colors.Success
    Write-ColorLine "  4. Copy key to: .env as ELEVENLABS_API_KEY" $colors.Success
    Write-Host ""
    
    Write-Host "Step 2: Twilio Phone System (15 minutes)"
    Write-ColorLine "  1. Visit: https://www.twilio.com/console" $colors.Success
    Write-ColorLine "  2. Sign up or log in" $colors.Success
    Write-ColorLine "  3. Copy Account SID to: TWILIO_ACCOUNT_SID" $colors.Success
    Write-ColorLine "  4. Copy Auth Token to: TWILIO_AUTH_TOKEN" $colors.Success
    Write-ColorLine "  5. Buy a phone number (Twilio dashboard)" $colors.Success
    Write-ColorLine "  6. Copy to: TWILIO_PHONE_NUMBER (format: +15551234567)" $colors.Success
    Write-Host ""
    
    Write-Host "Step 3: .env Configuration"
    Write-Host @"
ELEVENLABS_API_KEY=your_key_here
TWILIO_ACCOUNT_SID=your_sid_here
TWILIO_AUTH_TOKEN=your_token_here
TWILIO_PHONE_NUMBER=+15551234567
"@
    Write-Host ""
    
    if ($OpenBrowsers) {
        Start-Process "https://elevenlabs.io/app/subscription"
        Start-Process "https://www.twilio.com/console"
    }
}

# ========================================
# EMAIL & CALENDAR AUTOMATION
# ========================================
function Show-EmailSystem {
    Show-Header "EMAIL & CALENDAR AUTOMATION (Optional)"
    
    Write-ColorLine "Purpose: Auto follow-ups, property updates, calendar sync" $colors.Info
    Write-ColorLine "Effort: 25 minutes | Difficulty: Medium" $colors.Info
    Write-Host ""
    
    Write-Host "Step 1: SendGrid Email (5 minutes)"
    Write-ColorLine "  1. Visit: https://sendgrid.com/free" $colors.Success
    Write-ColorLine "  2. Sign up (free plan: 100 emails/day)" $colors.Success
    Write-ColorLine "  3. Go to: Settings > API Keys" $colors.Success
    Write-ColorLine "  4. Create 'Full Access' key" $colors.Success
    Write-ColorLine "  5. Copy to: .env as SENDGRID_API_KEY" $colors.Success
    Write-Host ""
    
    Write-Host "Step 2: Gmail OAuth (20 minutes)"
    Write-ColorLine "  1. Visit: https://console.cloud.google.com/apis/credentials" $colors.Success
    Write-ColorLine "  2. Create OAuth 2.0 Client ID (Desktop app)" $colors.Success
    Write-ColorLine "  3. Download JSON credentials" $colors.Success
    Write-ColorLine "  4. Extract: client_id, client_secret" $colors.Success
    Write-ColorLine "  5. Run first sync to get refresh_token:" $colors.Success
    Write-Host "     npm run sync:gmail-oauth" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Step 3: .env Configuration"
    Write-Host @"
SENDGRID_API_KEY=SG.your_key_here
GMAIL_CLIENT_ID=your_client_id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_REFRESH_TOKEN=your_refresh_token
"@
    Write-Host ""
    
    if ($OpenBrowsers) {
        Start-Process "https://sendgrid.com/free"
        Start-Process "https://console.cloud.google.com/apis/credentials"
    }
}

# ========================================
# MULTI-EXCHANGE MONITORING
# ========================================
function Show-ExchangeAPIs {
    Show-Header "MULTI-EXCHANGE MONITORING (Optional)"
    
    Write-ColorLine "Purpose: Real-time balance monitoring across exchanges" $colors.Info
    Write-ColorLine "Effort: 30 minutes | Difficulty: Easy" $colors.Info
    Write-Host ""
    
    Write-Host "Current Setup (Already Configured):"
    Write-ColorLine "  ✓ CoinGecko (price feeds) - COINGECKO_API_KEY" $colors.Success
    Write-ColorLine "  ✓ Coinbase Commerce (payments) - Already configured" $colors.Success
    Write-Host ""
    
    Write-Host "Step 1: Binance API (10 minutes)"
    Write-ColorLine "  1. Visit: https://www.binance.com/en/my/settings/api-management" $colors.Success
    Write-ColorLine "  2. Create new API key" $colors.Success
    Write-ColorLine "  3. Enable 'Read' permissions only" $colors.Success
    Write-ColorLine "  4. Copy API Key and Secret to .env" $colors.Success
    Write-Host ""
    
    Write-Host "Step 2: Kraken API (10 minutes)"
    Write-ColorLine "  1. Visit: https://www.kraken.com/settings/api" $colors.Success
    Write-ColorLine "  2. Create new API key" $colors.Success
    Write-ColorLine "  3. Enable 'Query Funds' permission only" $colors.Success
    Write-ColorLine "  4. Copy API Key and Secret to .env" $colors.Success
    Write-Host ""
    
    Write-Host "Step 3: Gemini API (10 minutes)"
    Write-ColorLine "  1. Visit: https://exchange.coinbase.com/settings/api" $colors.Success
    Write-ColorLine "  2. Create new API key" $colors.Success
    Write-ColorLine "  3. Enable 'View' permissions only" $colors.Success
    Write-ColorLine "  4. Copy API Key to .env" $colors.Success
    Write-Host ""
    
    Write-Host "Step 4: .env Configuration"
    Write-Host @"
BINANCE_API_KEY=your_key_here
BINANCE_API_SECRET=your_secret_here
KRAKEN_API_KEY=your_key_here
KRAKEN_API_SECRET=your_secret_here
GEMINI_API_KEY=your_key_here
"@
    Write-Host ""
    
    if ($OpenBrowsers) {
        Start-Process "https://www.binance.com/en/my/settings/api-management"
        Start-Process "https://www.kraken.com/settings/api"
        Start-Process "https://exchange.coinbase.com/settings/api"
    }
}

# ========================================
# GOOGLE WALLET INTEGRATION
# ========================================
function Show-GoogleWallet {
    Show-Header "GOOGLE WALLET INTEGRATION (Optional)"
    
    Write-ColorLine "Purpose: Digital property access passes" $colors.Info
    Write-ColorLine "Effort: 30 minutes | Difficulty: Hard" $colors.Info
    Write-Host ""
    
    Write-Host "Step 1: Google Cloud Project Setup (10 minutes)"
    Write-ColorLine "  1. Visit: https://console.cloud.google.com/projectcreate" $colors.Success
    Write-ColorLine "  2. Create new project: 'Real Estate Intelligence'" $colors.Success
    Write-ColorLine "  3. Enable 'Google Wallet API'" $colors.Success
    Write-Host ""
    
    Write-Host "Step 2: Create Service Account (15 minutes)"
    Write-ColorLine "  1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts" $colors.Success
    Write-ColorLine "  2. Create service account: 'wallet-integration'" $colors.Success
    Write-ColorLine "  3. Create JSON key" $colors.Success
    Write-ColorLine "  4. Download the JSON file" $colors.Success
    Write-Host ""
    
    Write-Host "Step 3: Extract Credentials"
    Write-ColorLine "  From the downloaded JSON file, copy:" $colors.Success
    Write-Host @"
  - project_id (as GOOGLE_WALLET_ISSUER_ID)
  - client_email (as GOOGLE_WALLET_SERVICE_EMAIL)
  - private_key (as GOOGLE_WALLET_PRIVATE_KEY)
"@
    Write-Host ""
    
    Write-Host "Step 4: .env Configuration"
    Write-Host @"
GOOGLE_WALLET_ISSUER_ID=your_project_id
GOOGLE_WALLET_SERVICE_EMAIL=your-service@project.iam.gserviceaccount.com
GOOGLE_WALLET_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
"@
    Write-Host ""
    
    if ($OpenBrowsers) {
        Start-Process "https://console.cloud.google.com/projectcreate"
        Start-Process "https://console.cloud.google.com/iam-admin/serviceaccounts"
    }
}

# ========================================
# VERIFICATION FUNCTION
# ========================================
function Verify-Credentials {
    Show-Header "VERIFY CREDENTIALS"
    
    Write-ColorLine "Testing API keys in .env file..." $colors.Info
    Write-Host ""
    
    $envFile = Join-Path (Get-Location) ".env"
    if (-not (Test-Path $envFile)) {
        Write-ColorLine "❌ .env file not found!" $colors.Error
        return
    }
    
    $content = Get-Content $envFile
    $results = @{
        Voice = @{ ElevenLabs = $false; Twilio = $false }
        Email = @{ SendGrid = $false; Gmail = $false }
        Exchange = @{ Binance = $false; Kraken = $false; Gemini = $false }
        Wallet = @{ Google = $false }
    }
    
    if ($content -match "ELEVENLABS_API_KEY=") { $results.Voice.ElevenLabs = $true }
    if ($content -match "TWILIO_ACCOUNT_SID=") { $results.Voice.Twilio = $true }
    if ($content -match "SENDGRID_API_KEY=") { $results.Email.SendGrid = $true }
    if ($content -match "GMAIL_CLIENT_ID=") { $results.Email.Gmail = $true }
    if ($content -match "BINANCE_API_KEY=") { $results.Exchange.Binance = $true }
    if ($content -match "KRAKEN_API_KEY=") { $results.Exchange.Kraken = $true }
    if ($content -match "GEMINI_API_KEY=") { $results.Exchange.Gemini = $true }
    if ($content -match "GOOGLE_WALLET_ISSUER_ID=") { $results.Wallet.Google = $true }
    
    Write-Host "Voice System:"
    foreach ($key in $results.Voice.Keys) {
        $status = if ($results.Voice[$key]) { "✓ Configured" } else { "✗ Missing" }
        $color = if ($results.Voice[$key]) { $colors.Success } else { $colors.Warning }
        Write-ColorLine "  $key: $status" $color
    }
    
    Write-Host ""
    Write-Host "Email & Calendar:"
    foreach ($key in $results.Email.Keys) {
        $status = if ($results.Email[$key]) { "✓ Configured" } else { "✗ Missing" }
        $color = if ($results.Email[$key]) { $colors.Success } else { $colors.Warning }
        Write-ColorLine "  $key: $status" $color
    }
    
    Write-Host ""
    Write-Host "Exchange APIs:"
    foreach ($key in $results.Exchange.Keys) {
        $status = if ($results.Exchange[$key]) { "✓ Configured" } else { "✗ Missing" }
        $color = if ($results.Exchange[$key]) { $colors.Success } else { $colors.Warning }
        Write-ColorLine "  $key: $status" $color
    }
    
    Write-Host ""
    Write-Host "Google Wallet:"
    foreach ($key in $results.Wallet.Keys) {
        $status = if ($results.Wallet[$key]) { "✓ Configured" } else { "✗ Missing" }
        $color = if ($results.Wallet[$key]) { $colors.Success } else { $colors.Warning }
        Write-ColorLine "  $key: $status" $color
    }
}

# ========================================
# MAIN MENU
# ========================================
function Show-Menu {
    Show-Header "OPTIONAL CREDENTIAL ACQUISITION GUIDE"
    
    Write-ColorLine "Select which optional services to set up:" $colors.Info
    Write-Host ""
    Write-Host "  1. Voice System (ElevenLabs + Twilio)"
    Write-Host "  2. Email & Calendar (SendGrid + Gmail)"
    Write-Host "  3. Multi-Exchange Monitoring (Binance, Kraken, Gemini)"
    Write-Host "  4. Google Wallet Integration"
    Write-Host "  5. All Services"
    Write-Host "  6. Verify Current Credentials"
    Write-Host "  7. Exit"
    Write-Host ""
    Write-Host -NoNewline "Select option (1-7): "
    
    $choice = Read-Host
    
    switch ($choice) {
        "1" { Show-VoiceSystem }
        "2" { Show-EmailSystem }
        "3" { Show-ExchangeAPIs }
        "4" { Show-GoogleWallet }
        "5" {
            Show-VoiceSystem
            Show-EmailSystem
            Show-ExchangeAPIs
            Show-GoogleWallet
        }
        "6" { Verify-Credentials }
        "7" {
            Write-ColorLine "Exiting..." $colors.Success
            exit
        }
        default {
            Write-ColorLine "Invalid selection. Please try again." $colors.Error
            Show-Menu
        }
    }
    
    Write-Host ""
    Read-Host "Press Enter to continue..."
    Clear-Host
    Show-Menu
}

# ========================================
# RUN MAIN MENU
# ========================================
if ($ServiceType -eq "all") {
    Show-Menu
} else {
    switch ($ServiceType.ToLower()) {
        "voice" { Show-VoiceSystem }
        "email" { Show-EmailSystem }
        "exchange" { Show-ExchangeAPIs }
        "wallet" { Show-GoogleWallet }
        "verify" { Verify-Credentials }
        default { Show-Menu }
    }
}
