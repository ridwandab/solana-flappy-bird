# Setup Vercel Environment Variables Script
# Run this after running setup-treasury-wallet.ps1

Write-Host "🚀 Setting up Vercel Environment Variables..." -ForegroundColor Green

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ .env.local not found. Please run setup-treasury-wallet.ps1 first." -ForegroundColor Red
    exit 1
}

# Read environment variables
Write-Host "`n📋 Reading environment variables..." -ForegroundColor Yellow
$envContent = Get-Content ".env.local"
$treasuryPrivateKey = ""
$apiKey = ""

foreach ($line in $envContent) {
    if ($line -match "^TREASURY_PRIVATE_KEY=\[(.+)\]$") {
        $treasuryPrivateKey = "[$($matches[1])]"
    }
    if ($line -match "^API_KEY=(.+)$") {
        $apiKey = $matches[1]
    }
}

if (-not $treasuryPrivateKey -or -not $apiKey) {
    Write-Host "❌ Could not find TREASURY_PRIVATE_KEY or API_KEY in .env.local" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found environment variables" -ForegroundColor Green

# Check if Vercel CLI is installed
Write-Host "`n📋 Checking Vercel CLI..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g vercel" -ForegroundColor Cyan
    exit 1
}

# Set environment variables in Vercel
Write-Host "`n📋 Setting environment variables in Vercel..." -ForegroundColor Yellow

Write-Host "🔑 Setting TREASURY_PRIVATE_KEY..." -ForegroundColor Cyan
Write-Host "   Value: $treasuryPrivateKey" -ForegroundColor Gray
$treasuryResult = echo $treasuryPrivateKey | vercel env add TREASURY_PRIVATE_KEY production
Write-Host "✅ TREASURY_PRIVATE_KEY set" -ForegroundColor Green

Write-Host "`n🔐 Setting API_KEY..." -ForegroundColor Cyan
Write-Host "   Value: $apiKey" -ForegroundColor Gray
$apiResult = echo $apiKey | vercel env add API_KEY production
Write-Host "✅ API_KEY set" -ForegroundColor Green

# Deploy to production
Write-Host "`n📋 Deploying to production..." -ForegroundColor Yellow
Write-Host "🔄 Running vercel --prod..." -ForegroundColor Cyan
vercel --prod

Write-Host "`n🎉 Setup Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ Treasury wallet configured" -ForegroundColor White
Write-Host "✅ Environment variables set in Vercel" -ForegroundColor White
Write-Host "✅ Application deployed to production" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green

Write-Host "`n📋 Test Real Transfer:" -ForegroundColor Yellow
Write-Host "1. Open your deployed application" -ForegroundColor White
Write-Host "2. Connect your wallet" -ForegroundColor White
Write-Host "3. Complete a quest and claim reward" -ForegroundColor White
Write-Host "4. Click 'Transfer to Wallet (REAL)'" -ForegroundColor White
Write-Host "5. Enter API key: $apiKey" -ForegroundColor Cyan
Write-Host "6. Confirm transfer" -ForegroundColor White
Write-Host "7. Check your wallet for real SOL!" -ForegroundColor White

Write-Host "`n⚠️  Security Reminder:" -ForegroundColor Red
Write-Host "- Keep your API key secure" -ForegroundColor White
Write-Host "- Never share your private key" -ForegroundColor White
Write-Host "- This is devnet - use mainnet for production" -ForegroundColor White
