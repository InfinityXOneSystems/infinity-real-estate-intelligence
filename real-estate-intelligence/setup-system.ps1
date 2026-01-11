# Real Estate Intelligence System - Migration & Deployment Script
# Migrates critical components from foundation repo and sets up complete autonomous system

Write-Host '=== REAL ESTATE INTELLIGENCE SYSTEM - SETUP ===' -ForegroundColor Cyan
Write-Host 'Migrating from foundation + Building autonomous system' -ForegroundColor Yellow

# 1. Create directory structure
Write-Host '
Creating directory structure...' -ForegroundColor Cyan
$dirs = @(
    'src/intelligence',
    'src/crawlers',
    'src/matching',
    'src/statistics',
    'src/ai-voice',
    'src/smart-contracts',
    'src/workflow',
    'config',
    'scripts',
    'data/raw',
    'data/processed',
    'taxonomy',
    'ml-models',
    '.github/workflows'
)
foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}
Write-Host ' Directory structure created' -ForegroundColor Green

# 2. Copy critical files from foundation
Write-Host '
Migrating critical components from foundation...' -ForegroundColor Cyan
$foundationPath = 'C:\Users\JARVIS\OneDrive\Documents\foundation'

$filesToMigrate = @{
    'src/ingest/real-estate/intelligence/emotional-state-predictor.ts' = 'src/intelligence/emotional-state-predictor.ts'
    'src/ingest/real-estate/matching/investor-matcher.ts' = 'src/matching/investor-matcher.ts'
    'src/ingest/real-estate/types.ts' = 'src/types.ts'
    'industries/real-estate/config/treasure-coast-config.ts' = 'config/treasure-coast-config.ts'
    'industries/real-estate/data/distress-keywords-expanded.ts' = 'data/distress-keywords-expanded.ts'
    'industries/real-estate/intelligence/statistical-analysis-engine.ts' = 'src/intelligence/statistical-analysis-engine.ts'
    'industries/real-estate/intelligence/predictive-heatmap-system.ts' = 'src/intelligence/predictive-heatmap-system.ts'
    'industries/real-estate/crawlers/social-media-crawler.ts' = 'src/crawlers/social-media-crawler.ts'
    'industries/real-estate/crawlers/government-data-crawler.ts' = 'src/crawlers/government-data-crawler.ts'
    'industries/real-estate/intelligence/intelligence-orchestrator.ts' = 'src/intelligence/intelligence-orchestrator.ts'
    'industries/real-estate/utils/google-sheets-client.ts' = 'src/utils/google-sheets-client.ts'
}

foreach ($source in $filesToMigrate.Keys) {
    $sourcePath = Join-Path $foundationPath $source
    $destPath = $filesToMigrate[$source]
    
    if (Test-Path $sourcePath) {
        $destDir = Split-Path $destPath
        New-Item -ItemType Directory -Force -Path $destDir | Out-Null
        Copy-Item $sourcePath $destPath -Force
        Write-Host \"   Migrated: $source\" -ForegroundColor Green
    } else {
        Write-Host \"   Not found: $source\" -ForegroundColor Yellow
    }
}

Write-Host '
 Migration complete!' -ForegroundColor Green
Write-Host '
Next steps:' -ForegroundColor Cyan
Write-Host '1. npm init -y' -ForegroundColor White
Write-Host '2. Install dependencies' -ForegroundColor White
Write-Host '3. Setup smart contracts (Hardhat)' -ForegroundColor White
Write-Host '4. Configure AI voice (ElevenLabs + Google Speech)' -ForegroundColor White
Write-Host '5. Deploy to testnet' -ForegroundColor White
